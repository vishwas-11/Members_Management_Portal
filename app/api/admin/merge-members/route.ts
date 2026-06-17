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

    const { primary_id, duplicate_id } = await request.json()

    if (!primary_id || !duplicate_id) {
      return NextResponse.json({ error: 'Both primary_id and duplicate_id are required' }, { status: 400 })
    }

    if (primary_id === duplicate_id) {
      return NextResponse.json({ error: 'Cannot merge a member with themselves' }, { status: 400 })
    }

    // Fetch both members
    const { data: primary } = await supabase
      .from('members')
      .select('*')
      .eq('id', primary_id)
      .single()

    const { data: duplicate } = await supabase
      .from('members')
      .select('*')
      .eq('id', duplicate_id)
      .single()

    if (!primary || !duplicate) {
      return NextResponse.json({ error: 'One or both members not found' }, { status: 404 })
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
