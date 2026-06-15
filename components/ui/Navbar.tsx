'use client'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LogOut, ChurchIcon } from 'lucide-react'

interface NavbarProps {
  role?: 'member' | 'admin'
  userName?: string
}

export default function Navbar({ role, userName }: NavbarProps) {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <nav className="bg-white border-b border-cream-200 shadow-sm relative z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href={role === 'admin' ? '/admin' : '/dashboard'} className="flex items-center gap-2 group">
          <div className="w-8 h-8 border border-forest-600 rounded-md flex items-center justify-center group-hover:bg-cream-100 transition-colors">
            <ChurchIcon className="w-4 h-4 text-forest-600" />
          </div>
          <span className="font-serif font-semibold text-forest-800 text-lg tracking-wide group-hover:text-forest-600 transition-colors">
            Church Registry
          </span>
        </Link>
        <div className="flex items-center gap-6">
          {role === 'admin' && (
            <Link href="/admin" className="text-sm font-medium text-gray-600 hover:text-forest-600 transition-colors tracking-wide">
              Members
            </Link>
          )}
          <Link href="/profile" className="text-sm font-medium text-gray-600 hover:text-forest-600 transition-colors tracking-wide">
            My Profile
          </Link>
          {userName && (
            <span className="text-xs font-mono text-gray-400 bg-cream-100 px-2.5 py-1 rounded hidden sm:block">
              {userName}
            </span>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-red-600 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:block">Logout</span>
          </button>
        </div>
      </div>
    </nav>
  )
}
