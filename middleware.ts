import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl

  if (!user && pathname !== '/' && pathname !== '/login' && pathname !== '/register') {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (user && (pathname === '/login' || pathname === '/register')) {
    const { data: member } = await supabase
      .from('members')
      .select('role')
      .eq('user_id', user.id)
      .single()
    const dest = member?.role === 'admin' ? '/admin' : '/dashboard'
    return NextResponse.redirect(new URL(dest, request.url))
  }

  if (pathname.startsWith('/admin')) {
    const { data: member } = await supabase
      .from('members')
      .select('role')
      .eq('user_id', user!.id)
      .single()
    if (member?.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
}
