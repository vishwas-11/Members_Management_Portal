import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const validUrl = url.startsWith('http') ? url : 'https://placeholder.supabase.co'
  return createBrowserClient(
    validUrl,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'
  )
}

