import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { full_name, aadhaar_number } = await request.json()

    if (!full_name || !aadhaar_number) {
      return NextResponse.json({ error: 'Name and Aadhaar are required' }, { status: 400 })
    }

    // Call the secure Postgres function
    const { data: result, error: rpcError } = await supabase.rpc(
      'check_duplicate_member',
      { p_name: full_name.trim(), p_aadhaar: aadhaar_number.trim() }
    )

    if (rpcError) {
      console.error('RPC error:', rpcError)
      return NextResponse.json({ error: 'Failed to check for duplicates' }, { status: 500 })
    }

    return NextResponse.json(result || { duplicates: [] })
  } catch (err: any) {
    console.error('Check duplicate error:', err)
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}
