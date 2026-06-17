import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error && user) {
      const { data: member } = await supabase
        .from('members')
        .select('role, declaration_signed')
        .eq('user_id', user.id)
        .single()

      if (!member) return NextResponse.redirect(`${origin}/register/claim`)
      if (!member.declaration_signed) return NextResponse.redirect(`${origin}/register/claim`)
      if (member.role === 'admin') return NextResponse.redirect(`${origin}/admin`)
      return NextResponse.redirect(`${origin}/dashboard`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}

