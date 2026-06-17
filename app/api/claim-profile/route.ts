import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Check if user already has a members row
    const { data: existingMember } = await supabase
      .from('members')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (existingMember) {
      return NextResponse.json({ error: 'You already have a profile' }, { status: 400 })
    }

    const { member_code, aadhaar_last4 } = await request.json()

    if (!member_code || !aadhaar_last4) {
      return NextResponse.json({ error: 'Member code and Aadhaar last 4 digits are required' }, { status: 400 })
    }

    if (!/^\d{4}$/.test(aadhaar_last4)) {
      return NextResponse.json({ error: 'Aadhaar last 4 must be exactly 4 digits' }, { status: 400 })
    }

    // Call the secure Postgres function to find the member
    const { data: result, error: rpcError } = await supabase.rpc(
      'find_member_by_code_and_aadhaar',
      { p_code: member_code.trim().toUpperCase(), p_aadhaar_last4: aadhaar_last4 }
    )

    if (rpcError) {
      console.error('RPC error:', rpcError)
      return NextResponse.json({ error: 'Failed to search for member' }, { status: 500 })
    }

    if (!result || result.error) {
      const errorMsg = result?.error || 'not_found'
      const messages: Record<string, string> = {
        not_found: 'No member found with that Member ID. Please check and try again.',
        aadhaar_mismatch: 'Aadhaar verification failed. The last 4 digits do not match our records.',
        already_claimed: `This profile (${result?.name || 'member'}) has already been claimed by another account.`,
        head_already_linked: `This profile (${result?.name || 'member'}) is already linked to an account. Please sign in with the original credentials.`,
      }
      return NextResponse.json({
        error: messages[errorMsg] || 'An unexpected error occurred.',
        error_code: errorMsg,
      }, { status: 400 })
    }

    // Handle based on match type
    if (result.match_type === 'family') {
      // Create a new members row from the family member data
      const { error: insertError } = await supabase.from('members').insert({
        user_id: user.id,
        full_name: result.name,
        aadhaar_number: result.aadhaar_number,
        address: '', // Will need to be updated by the user
        age: result.age || 0,
        phone: result.phone || '',
        dob: result.dob || null,
        marital_status: result.marital_status || null,
        avatar_url: result.avatar_url || null,
        certificate_url: result.certificate_url || null,
        role: 'member',
        family_members: [],
        declaration_signed: true,
        declaration_signed_at: new Date().toISOString(),
      })

      if (insertError) {
        console.error('Insert error:', insertError)
        return NextResponse.json({ error: 'Failed to create your profile. ' + insertError.message }, { status: 500 })
      }

      // Mark the family member as claimed in the parent's JSONB
      // Fetch the parent's current family_members
      const { data: parentMember, error: fetchError } = await supabase
        .from('members')
        .select('family_members')
        .eq('id', result.parent_member_id)
        .single()

      if (!fetchError && parentMember?.family_members) {
        const updatedFamilyMembers = [...parentMember.family_members]
        const idx = result.family_index

        if (idx >= 0 && idx < updatedFamilyMembers.length) {
          // Get the new member's ID
          const { data: newMember } = await supabase
            .from('members')
            .select('id')
            .eq('user_id', user.id)
            .single()

          updatedFamilyMembers[idx] = {
            ...updatedFamilyMembers[idx],
            claimed: true,
            claimed_member_id: newMember?.id || null,
          }

          await supabase
            .from('members')
            .update({ family_members: updatedFamilyMembers })
            .eq('id', result.parent_member_id)
        }
      }

      return NextResponse.json({
        success: true,
        message: `Welcome, ${result.name}! Your profile has been linked successfully.`,
        redirect: '/dashboard',
      })
    }

    if (result.match_type === 'head') {
      // This is a family head whose member row has no user_id linked
      // (edge case — shouldn't normally happen since heads register via auth)
      const { error: updateError } = await supabase
        .from('members')
        .update({ user_id: user.id })
        .eq('id', result.member_id)
        .is('user_id', null)

      if (updateError) {
        console.error('Update error:', updateError)
        return NextResponse.json({ error: 'Failed to link your profile' }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        message: `Welcome back, ${result.name}! Your account has been linked.`,
        redirect: '/dashboard',
      })
    }

    return NextResponse.json({ error: 'Unexpected match type' }, { status: 500 })
  } catch (err: any) {
    console.error('Claim profile error:', err)
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}
