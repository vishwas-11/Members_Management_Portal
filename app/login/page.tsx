'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Mail, Lock, Loader2, Eye, EyeOff, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import Navbar from '@/components/ui/Navbar'
import { LeftOliveBranch, RightOliveBranch } from '@/components/ui/OliveBranches'
const LetterpressCross = ({ className = "w-6 h-10" }: { className?: string }) => (
  <svg viewBox="0 0 24 36" fill="none" xmlns="http://www.w3.org/2000/svg" className={`${className} filter drop-shadow-[0_1px_0.5px_rgba(255,255,255,0.45)]`}>
    <path 
      d="M 10,0.5 L 14,1.8 L 14,34.2 L 10,35.5 Z M 1,11 L 23,12.2 L 23,15.2 L 1,14 Z" 
      fill="#3b2f23" 
    />
  </svg>
)

const Sparkle = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.15)]">
    <path d="M12,0 L14.5,9.5 L24,12 L14.5,14.5 L12,24 L9.5,14.5 L0,12 L9.5,9.5 Z" fill="#ebd096" opacity="0.8" />
  </svg>
)

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

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error: loginError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password,
    })

    if (loginError) {
      setError(loginError.message)
      setLoading(false)
      return
    }

    if (data?.user) {
      const { data: member } = await supabase
        .from('members')
        .select('role')
        .eq('user_id', data.user.id)
        .single()
      
      setLoading(false)
      if (!member) {
        router.push('/register/details')
      } else if (member.role === 'admin') {
        router.push('/admin')
      } else {
        router.push('/dashboard')
      }
    } else {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true)
    setError('')

    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { 
        redirectTo: `${window.location.origin}/api/auth/callback` 
      },
    })

    if (oauthError) {
      setError(oauthError.message)
      setGoogleLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-linen-green select-none px-4 py-12">
      {/* Paper Noise Overlay for added tactility */}
      <div className="paper-overlay" />

      {/* Decorative absolute background elements */}
      <div className="botanical-flank absolute left-[-150px] md:left-[-100px] top-[5%] w-[450px] md:w-[550px] pointer-events-none select-none z-10 opacity-85 drop-shadow-2xl">
        <LeftOliveBranch />
      </div>
      <div className="botanical-flank absolute right-[-150px] md:right-[-100px] top-[15%] w-[480px] md:w-[580px] pointer-events-none select-none z-10 opacity-85 drop-shadow-2xl">
        <RightOliveBranch />
      </div>
      <div className="botanical-flank absolute right-[-150px] md:right-[-100px] top-[55%] w-[450px] md:w-[550px] pointer-events-none select-none z-0 opacity-85 drop-shadow-2xl transform -scale-y-100">
        <RightOliveBranch />
      </div>
      <div className="botanical-flank absolute left-[-150px] md:left-[-100px] top-[65%] w-[480px] md:w-[580px] pointer-events-none select-none z-0 opacity-85 drop-shadow-2xl transform -scale-y-100">
        <LeftOliveBranch />
      </div>

      {/* Scattered sparkles */}
      <div className="absolute left-[15%] top-[10%] pointer-events-none select-none z-10 opacity-70">
        <Sparkle />
      </div>
      <div className="absolute left-[8%] bottom-[15%] pointer-events-none select-none z-10 opacity-75">
        <Sparkle />
      </div>
      <div className="absolute right-[20%] top-[12%] pointer-events-none select-none z-10 opacity-70">
        <Sparkle />
      </div>
      <div className="absolute right-[6%] bottom-[12%] pointer-events-none select-none z-10 opacity-60">
        <Sparkle />
      </div>

      <ScrollReveal className="w-full max-w-md relative z-20">
        {/* Header Plaque Area */}
        <div className="flex flex-col items-center mb-8 relative z-20">
          <div className="mb-4 flex justify-center">
            <LetterpressCross className="w-6 h-9 text-[#faf9f6]" />
          </div>
          
          <div className="mb-4 flex items-center justify-center gap-3">
            <span className="w-10 h-px bg-[#faf9f6]/30" />
            <span className="font-sans text-[10px] font-bold uppercase tracking-[0.18em] text-[#faf9f6]/85 drop-shadow-sm">
              Congregation Access
            </span>
            <span className="w-10 h-px bg-[#faf9f6]/30" />
          </div>

          <h1 className="text-4xl font-serif font-medium tracking-tight text-center mb-1 bg-gradient-to-br from-[#fcfbf9] via-[#e8d5b5] to-[#c5b799] bg-clip-text text-transparent drop-shadow-[0_2px_4px_rgba(13,33,25,0.8)]">
            Methodist Registry
          </h1>
          
          <p className="font-sans text-[10.5px] uppercase tracking-widest text-[#faf9f6]/70 text-center mt-2 font-semibold drop-shadow-sm">
            Sign in to manage details
          </p>
        </div>

        {/* Premium Plaque Form Card */}
        <div className="doppelrand-outer w-full shadow-2xl relative z-20">
          <div className="doppelrand-inner p-8">
            {/* Top Gold Ribbon Accent */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#ebd2a3] via-[#be9d62] to-[#76592a] z-10" />

          <div className="space-y-6">
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="label text-[#3b2f23]/70 font-mono text-[10px] uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#3b2f23]/50" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="yourname@example.com"
                    required
                    className="input-field !pl-10 !border-[#dfd8cb] !bg-white/75 focus:!ring-[#3b2f23]/25 focus:!border-[#3b2f23]/50 text-[#3b2f23]"
                  />
                </div>
              </div>

              <div>
                <label className="label text-[#3b2f23]/70 font-mono text-[10px] uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#3b2f23]/50" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="input-field !pl-10 !pr-10 !border-[#dfd8cb] !bg-white/75 focus:!ring-[#3b2f23]/25 focus:!border-[#3b2f23]/50 text-[#3b2f23]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#3b2f23]/50 hover:text-[#3b2f23] focus:outline-none cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && <p className="error-msg text-center font-medium font-sans text-xs">{error}</p>}

              <button
                type="submit"
                disabled={loading || googleLoading}
                className="btn-premium-solid group w-full mt-4"
              >
                <div className="flex items-center gap-2">
                  {loading && <Loader2 className="w-4 h-4 animate-spin text-[#ebd096]" />}
                  <span>{loading ? 'Signing in...' : 'Sign In'}</span>
                </div>
                <div className="btn-premium-icon-wrapper">
                  <ArrowRight className="w-4 h-4 text-[#faf9f6]" strokeWidth={2} />
                </div>
              </button>
            </form>

            <div className="relative flex items-center justify-center my-6">
              <span className="skeu-line w-full" />
              <span className="absolute bg-[#fcfbf9] px-3 text-[10px] text-[#3b2f23]/50 font-mono uppercase tracking-widest">
                or continue with
              </span>
            </div>

            {/* Google OAuth button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading || googleLoading}
              className="btn-premium-outline w-full py-3 flex items-center justify-center gap-2 text-sm font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {googleLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
              ) : (
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              )}
              <span>{googleLoading ? 'Redirecting...' : 'Google'}</span>
            </button>
          </div>
          </div>
        </div>

        <p className="text-xs text-[#faf9f6]/70 text-center mt-8 font-sans font-medium drop-shadow-sm relative z-20">
          First time here?{' '}
          <Link href="/register" className="text-[#faf9f6] font-bold hover:underline transition-colors decoration-[#faf9f6]/40 underline-offset-4 decoration-1">
            Register
          </Link>
        </p>
      </ScrollReveal>
    </div>
  )
}
