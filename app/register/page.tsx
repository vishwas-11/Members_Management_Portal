'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ChurchIcon, Mail, Lock, Loader2, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'

const getPasswordStrength = (pass: string) => {
  if (!pass) return { score: 0, label: '', color: 'bg-gray-200', textClass: 'text-gray-400' }
  let score = 0
  if (pass.length >= 6) score += 1
  if (pass.length >= 8) score += 1
  
  const hasLower = /[a-z]/.test(pass)
  const hasUpper = /[A-Z]/.test(pass)
  const hasDigit = /[0-9]/.test(pass)
  const hasSpecial = /[^A-Za-z0-9]/.test(pass)
  
  const complexity = [hasLower, hasUpper, hasDigit, hasSpecial].filter(Boolean).length
  if (complexity >= 2 && pass.length >= 6) score += 1
  if (complexity >= 3 && pass.length >= 8) score += 1

  // Map score to strength levels
  if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-red-500', textClass: 'text-red-500' }
  if (score === 2) return { score: 2, label: 'Fair', color: 'bg-orange-400', textClass: 'text-orange-500' }
  if (score === 3) return { score: 3, label: 'Good', color: 'bg-yellow-500', textClass: 'text-yellow-600' }
  return { score: 4, label: 'Strong', color: 'bg-forest-600', textClass: 'text-forest-600' }
}

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')
  const strength = getPasswordStrength(password)

  // Primary Action: Register with Email and Password
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.')
      setLoading(false)
      return
    }

    const { data, error: signupError } = await supabase.auth.signUp({
      email: email.trim(),
      password: password,
      options: { 
        emailRedirectTo: `${window.location.origin}/api/auth/callback` 
      },
    })

    setLoading(false)
    if (signupError) {
      setError(signupError.message)
      return
    }

    if (data?.session) {
      // If email confirmation is disabled, user is signed in immediately
      router.push('/register/details')
    } else {
      // Email confirmation is required - redirect user to check inbox
      // For UX consistency, we redirect them to a status info, but since it's password signup we can show a message or handle it.
      // Let's set a success state or error message notifying check inbox.
      setError('Registration successful! Please check your email to confirm your account.')
    }
  }

  // Action: Google OAuth sign-in
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
    <div className="min-h-screen bg-cream-50 flex flex-col items-center justify-center px-4 py-12 relative">
      <div className="ambient-glow top-1/4 left-1/3" />
      <div className="w-full max-w-md relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 border border-forest-600 rounded-md flex items-center justify-center mb-4 bg-white shadow-sm">
            <ChurchIcon className="w-6 h-6 text-forest-600" />
          </div>
          <h1 className="font-serif text-3xl font-normal text-forest-800 text-center tracking-tight">
            Create Account
          </h1>
          <p className="text-sm text-gray-400 mt-2 text-center font-sans">
            Register your membership to join the digital registry
          </p>
        </div>

        <div className="card card-gradient-forest">
          <div className="space-y-6">
            <form onSubmit={handleRegister} className="space-y-5">
              <div>
                <label className="label">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="yourname@example.com"
                    required
                    className="input-field !pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="input-field !pl-10 !pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {password && (
                  <div className="mt-3 space-y-1.5 bg-cream-50 p-2.5 rounded-md border border-cream-200/50">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-400 font-sans">Strength:</span>
                      <span className={`font-semibold ${strength.textClass}`}>
                        {strength.label}
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5">
                      {[1, 2, 3, 4].map(idx => (
                        <div
                          key={idx}
                          className={`h-1 rounded-full transition-all duration-300 ${
                            idx <= strength.score ? strength.color : 'bg-cream-200'
                          }`}
                        />
                      ))}
                    </div>
                    {strength.score < 4 && (
                      <p className="text-[10px] text-gray-400 leading-normal font-sans">
                        Add uppercase letters, numbers, or special characters.
                      </p>
                    )}
                  </div>
                )}
              </div>

              {error && (
                <p className={`text-xs text-center font-medium ${error.includes('successful') ? 'text-forest-600' : 'error-msg'}`}>
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading || googleLoading}
                className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>

            <div className="relative flex items-center justify-center my-6">
              <div className="border-t border-cream-200 w-full"></div>
              <span className="absolute bg-white px-3 text-[10px] text-gray-400 font-mono uppercase tracking-widest">
                or continue with
              </span>
            </div>

            {/* Google OAuth sign-in button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading || googleLoading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-forest-800 rounded-md text-sm font-medium text-forest-800 bg-white hover:bg-cream-100 hover:text-forest-600 hover:border-forest-600 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
            >
              {googleLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24">
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
              {googleLoading ? 'Redirecting...' : 'Continue with Google'}
            </button>
          </div>
        </div>

        <p className="text-sm text-gray-500 text-center mt-8 font-sans">
          Already have an account?{' '}
          <Link href="/login" className="text-forest-600 font-medium hover:text-gold-hover hover:underline transition-colors">
            Login
          </Link>
        </p>
      </div>
    </div>
  )
}
