'use client'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LogOut } from 'lucide-react'

const MethodistLogo = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg viewBox="0 0 216 388" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Flame (Red) */}
    <path
      d="m 105.65278,2.875 c 0,0 -2.25,0 -2.25,0 -1.5,9.99997 0.25,36.75 -33.500004,66.5 -11.25,10.5 -50,44.441 -50,87.75 0,43 18.5,69.75 47.5,84.5 29,14.75 30.583,24.166 33.250004,31 -9.500004,-16 -16.500004,-19.25 -35.250004,-27.75 -14.25,-6 -53.75,-14.25 -59.2499999,-86.25 -0.75,-11 -1.5,-38.75 -1.5,-38.75 0,0 -2.25,0 -2.25,0 0,0 -0.25,46.25 -0.25,48.5 0,2.25 -0.5,60.5 1.5,73.25 2,12.75 6,65 66.7499999,71.25 15,1.5 29.25,15.5 32.000004,35.25 2.5,13 4,35.75 4,37 0,0 2,0 2,0 0,0 2,-63.75 -0.5,-85 -2.5,-21.25 -6.5,-40.25 -26.500004,-54.25 -20,-14 -21.25,-15.5 -24.75,-19.75 -3.5,-4.25 -24.5,-27.25 5.25,-58.25 8.75,-10.5 43.250004,-25.5 44.250004,-81 0,0 -0.5,-84 -0.5,-84 z"
      fill="#e4002b"
    />
    {/* Cross (Black/Dark Gray) */}
    <path
      d="m 121.50078,120.54107 c 0,0 -78.099004,0 -78.099004,0 0,0 -6.624,7.6659 -6.624,7.6659 0,0 84.723004,0 84.723004,0 0,0 0,239.168 0,239.168 0,0 7.666,-8.25 7.666,-8.25 0,0 0,-230.918 0,-230.918 0,0 78.526,0 78.526,0 0,0 6.21,-7.6659 6.21,-7.6659 0,0 -84.736,0 -84.736,0 0,0 0,-98.9161 0,-98.9161 0,0 -7.666,8.5469 -7.666,8.5469 0,0 0,90.3742 0,90.3742 0,0 0,-0.005 0,-0.005 z"
      fill="currentColor"
    />
  </svg>
)

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
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-forest-400 via-forest-600 to-forest-400" />
      <div className="max-w-6xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group hover:scale-[1.01] active:scale-[0.99] transition-transform shrink-0">
          <div className="w-8 h-8 border border-forest-600 rounded-md flex items-center justify-center text-forest-600 group-hover:bg-cream-100 transition-colors shrink-0">
            <MethodistLogo className="w-4.5 h-4.5" />
          </div>
          <span className="font-serif font-semibold text-forest-800 text-base sm:text-lg tracking-wide group-hover:text-forest-600 transition-colors truncate">
            Methodist Registry
          </span>
        </Link>
        <div className="flex items-center gap-3 sm:gap-6">
          {role === 'admin' && (
            <Link href="/admin" className="text-xs sm:text-sm font-medium text-gray-600 hover:text-forest-600 transition-colors tracking-wide shrink-0">
              Members
            </Link>
          )}
          <Link href="/profile" className="text-xs sm:text-sm font-medium text-gray-600 hover:text-forest-600 transition-colors tracking-wide shrink-0">
            <span className="hidden sm:inline">My </span>Profile
          </Link>
          {userName && (
            <span className="text-xs font-mono text-gray-400 bg-cream-100 px-2 py-0.5 rounded hidden sm:block truncate max-w-[100px] md:max-w-[150px]">
              {userName}
            </span>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-gray-600 hover:text-red-600 transition-colors cursor-pointer shrink-0"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:block">Logout</span>
          </button>
        </div>
      </div>
    </nav>
  )
}
