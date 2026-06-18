import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Verify caller is admin
    const { data: caller } = await supabase
      .from('members')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (caller?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized — admin access required' }, { status: 403 })
    }

    const { primary_id, duplicate_id, is_duplicate_family, duplicate_parent_id } = await request.json()

    if (!primary_id || !duplicate_id) {
      return NextResponse.json({ error: 'Both primary_id and duplicate_id are required' }, { status: 400 })
    }

    if (primary_id === duplicate_id && !is_duplicate_family) {
      return NextResponse.json({ error: 'Cannot merge a member with themselves' }, { status: 400 })
    }

    // Fetch primary member
    const { data: primary } = await supabase
      .from('members')
      .select('*')
      .eq('id', primary_id)
      .single()

    if (!primary) {
      return NextResponse.json({ error: 'Primary member not found' }, { status: 404 })
    }

    // CASE 1: Duplicate is a family member stored in parent's JSONB
    if (is_duplicate_family) {
      if (!duplicate_parent_id) {
        return NextResponse.json({ error: 'duplicate_parent_id is required when duplicate is a family member' }, { status: 400 })
      }

      // Fetch parent member row
      const { data: parentMember } = await supabase
        .from('members')
        .select('*')
        .eq('id', duplicate_parent_id)
        .single()

      if (!parentMember) {
        return NextResponse.json({ error: 'Parent member profile not found' }, { status: 404 })
      }

      const familyMembers = parentMember.family_members || []
      const duplicateIndex = familyMembers.findIndex(
        (fm: any) => fm.member_code === duplicate_id || fm.id === duplicate_id
      )

      if (duplicateIndex === -1) {
        return NextResponse.json({ error: 'Duplicate family member profile not found under the parent\'s account' }, { status: 404 })
      }

      const dupFamilyMember = familyMembers[duplicateIndex]

      // 1. Mark family member as claimed and point to the primary member row
      familyMembers[duplicateIndex] = {
        ...dupFamilyMember,
        claimed: true,
        claimed_member_id: primary_id,
      }

      const { error: parentUpdateError } = await supabase
        .from('members')
        .update({ family_members: familyMembers })
        .eq('id', duplicate_parent_id)

      if (parentUpdateError) {
        console.error('Parent JSONB update error:', parentUpdateError)
        return NextResponse.json({ error: 'Failed to update parent\'s family list: ' + parentUpdateError.message }, { status: 500 })
      }

      // 2. Update primary member's code to the duplicate family member's original code
      // and fill in missing fields from the family member profile
      const updates: any = {}
      if (dupFamilyMember.member_code && primary.member_code !== dupFamilyMember.member_code) {
        updates.member_code = dupFamilyMember.member_code
      }
      if (!primary.phone && dupFamilyMember.phone) {
        updates.phone = dupFamilyMember.phone
      }
      if (!primary.dob && dupFamilyMember.dob) {
        updates.dob = dupFamilyMember.dob
      }
      if (!primary.marital_status && dupFamilyMember.marital_status) {
        updates.marital_status = dupFamilyMember.marital_status
      }
      if (!primary.avatar_url && dupFamilyMember.avatar_url) {
        updates.avatar_url = dupFamilyMember.avatar_url
      }
      if (!primary.certificate_url && dupFamilyMember.certificate_url) {
        updates.certificate_url = dupFamilyMember.certificate_url
      }
      if (!primary.aadhaar_number && dupFamilyMember.aadhaar_number) {
        updates.aadhaar_number = dupFamilyMember.aadhaar_number
      }

      if (Object.keys(updates).length > 0) {
        const { error: primaryUpdateError } = await supabase
          .from('members')
          .update(updates)
          .eq('id', primary_id)

        if (primaryUpdateError) {
          console.error('Primary row update error:', primaryUpdateError)
          return NextResponse.json({ error: 'Failed to update primary profile: ' + primaryUpdateError.message }, { status: 500 })
        }
      }

      return NextResponse.json({
        success: true,
        message: `Successfully linked family member "${dupFamilyMember.name}" into "${primary.full_name}"'s account. Profile has been marked as claimed, and original registry ID has been restored.`,
      })
    }

    // CASE 2: Duplicate is a standalone head member row
    const { data: duplicate } = await supabase
      .from('members')
      .select('*')
      .eq('id', duplicate_id)
      .single()

    if (!duplicate) {
      return NextResponse.json({ error: 'Duplicate member profile not found' }, { status: 404 })
    }

    // 1. Transfer all dues from duplicate to primary
    const { error: duesError } = await supabase
      .from('dues')
      .update({ member_id: primary_id })
      .eq('member_id', duplicate_id)

    if (duesError) {
      console.error('Dues transfer error:', duesError)
      return NextResponse.json({ error: 'Failed to transfer dues: ' + duesError.message }, { status: 500 })
    }

    // 2. Merge family_members arrays
    const primaryFamily = primary.family_members || []
    const duplicateFamily = duplicate.family_members || []
    const mergedFamily = [...primaryFamily, ...duplicateFamily]

    const { error: familyError } = await supabase
      .from('members')
      .update({ family_members: mergedFamily })
      .eq('id', primary_id)

    if (familyError) {
      console.error('Family merge error:', familyError)
      // Non-fatal — continue with deletion
    }

    // 3. Delete the duplicate member
    const { error: deleteError } = await supabase
      .from('members')
      .delete()
      .eq('id', duplicate_id)

    if (deleteError) {
      console.error('Delete error:', deleteError)
      return NextResponse.json({ error: 'Failed to delete duplicate: ' + deleteError.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `Successfully merged "${duplicate.full_name}" into "${primary.full_name}". ${mergedFamily.length > primaryFamily.length ? 'Family members have been combined.' : ''} All dues have been transferred.`,
    })
  } catch (err: any) {
    console.error('Merge members error:', err)
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}

