'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { UserCheck, UserPlus, ArrowRight, Loader2, Hash, ShieldCheck, CheckCircle2, AlertCircle, ChevronLeft } from 'lucide-react'
import Link from 'next/link'

import { ScrollReveal } from '@/components/ui/ScrollReveal'
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

type ClaimStep = 'choose' | 'claim' | 'success'

export default function ClaimPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-linen-green">
        <div className="paper-overlay" />
        <Loader2 className="w-8 h-8 animate-spin text-[#faf9f6]/60" />
      </div>
    }>
      <ClaimPageInner />
    </Suspense>
  )
}

function ClaimPageInner() {
  const router = useRouter()
  const supabase = createClient()
  const [step, setStep] = useState<ClaimStep>('choose')
  const [memberCode, setMemberCode] = useState('')
  const [aadhaarLast4, setAadhaarLast4] = useState('')
  const [loading, setLoading] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      // If user already has a profile, go to dashboard
      const { data: member } = await supabase
        .from('members')
        .select('role')
        .eq('user_id', user.id)
        .single()

      if (member) {
        router.push(member.role === 'admin' ? '/admin' : '/dashboard')
        return
      }
      setCheckingAuth(false)
    }
    checkAuth()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Pre-fill member code from URL params (when redirected from duplicate detection)
  const searchParams = useSearchParams()
  useEffect(() => {
    const codeParam = searchParams.get('code')
    if (codeParam) {
      setMemberCode(codeParam.toUpperCase())
      setStep('claim')
    }
  }, [searchParams])

  const handleClaim = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/claim-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          member_code: memberCode.trim().toUpperCase(),
          aadhaar_last4: aadhaarLast4.trim(),
        }),
      })

      const data = await res.json()

      if (!res.ok || data.error) {
        setError(data.error || 'Something went wrong. Please try again.')
        setLoading(false)
        return
      }

      setSuccessMessage(data.message || 'Profile linked successfully!')
      setStep('success')
      setLoading(false)

      // Redirect after a brief delay to show the success state
      setTimeout(() => {
        router.push(data.redirect || '/dashboard')
      }, 2000)
    } catch {
      setError('Network error. Please check your connection and try again.')
      setLoading(false)
    }
  }

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linen-green">
        <div className="paper-overlay" />
        <Loader2 className="w-8 h-8 animate-spin text-[#faf9f6]/60" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-linen-green select-none px-4 py-12">
      {/* Paper Noise Overlay */}
      <div className="paper-overlay" />

      {/* Decorative botanical elements */}
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

      <ScrollReveal className="w-full max-w-lg relative z-20">
        {/* Header */}
        <div className="flex flex-col items-center mb-8 relative z-20">
          <div className="mb-4 flex justify-center">
            <LetterpressCross className="w-6 h-9 text-[#faf9f6]" />
          </div>

          <div className="mb-4 flex items-center justify-center gap-3">
            <span className="w-10 h-px bg-[#faf9f6]/30" />
            <span className="font-sans text-[10px] font-bold uppercase tracking-[0.18em] text-[#faf9f6]/85 drop-shadow-sm">
              Welcome
            </span>
            <span className="w-10 h-px bg-[#faf9f6]/30" />
          </div>

          <h1 className="text-4xl font-serif font-medium tracking-tight text-center mb-1 bg-gradient-to-br from-[#fcfbf9] via-[#e8d5b5] to-[#c5b799] bg-clip-text text-transparent drop-shadow-[0_2px_4px_rgba(13,33,25,0.8)]">
            {step === 'choose' && 'Join the Registry'}
            {step === 'claim' && 'Claim Your Profile'}
            {step === 'success' && 'Profile Linked!'}
          </h1>

          <p className="font-sans text-[10.5px] uppercase tracking-widest text-[#faf9f6]/70 text-center mt-2 font-semibold drop-shadow-sm">
            {step === 'choose' && 'Are you already registered as a family member?'}
            {step === 'claim' && 'Enter your Member ID to link your account'}
            {step === 'success' && 'Redirecting you to your dashboard...'}
          </p>
        </div>

        {/* ═══════════════════ STEP: Choose ═══════════════════ */}
        {step === 'choose' && (
          <div className="space-y-5">
            {/* Option 1: Claim existing profile */}
            <button
              onClick={() => setStep('claim')}
              className="doppelrand-outer w-full shadow-2xl relative z-20 cursor-pointer group transition-all duration-300 hover:scale-[1.01] hover:shadow-3xl"
              id="claim-profile-option"
            >
              <div className="doppelrand-inner p-7 relative">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#4ade80] via-[#16a34a] to-[#14532d] z-10" />
                <div className="flex items-start gap-5">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-forest-100 to-forest-200 flex items-center justify-center border-2 border-forest-300/50 shadow-md shrink-0 group-hover:shadow-lg transition-shadow">
                    <UserCheck className="w-6 h-6 text-forest-700" />
                  </div>
                  <div className="text-left flex-1">
                    <h3 className="font-serif text-lg font-bold text-[#3b2f23] group-hover:text-forest-800 transition-colors">
                      Yes, I have a Member ID
                    </h3>
                    <p className="text-xs text-[#3b2f23]/60 mt-1.5 font-sans leading-relaxed">
                      A family head has already registered me. I want to link my account to my existing membership profile.
                    </p>
                    <div className="flex items-center gap-1.5 mt-3 text-[10px] font-mono font-bold uppercase tracking-widest text-forest-700">
                      <span>Verify &amp; Link</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </div>
            </button>

            {/* Option 2: New registration */}
            <Link
              href="/register/details"
              className="doppelrand-outer w-full shadow-2xl relative z-20 block group transition-all duration-300 hover:scale-[1.01] hover:shadow-3xl"
              id="new-member-option"
            >
              <div className="doppelrand-inner p-7 relative">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#ebd2a3] via-[#be9d62] to-[#76592a] z-10" />
                <div className="flex items-start gap-5">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#f7f0e0] to-[#e8d5b5] flex items-center justify-center border-2 border-[#dfd8cb]/50 shadow-md shrink-0 group-hover:shadow-lg transition-shadow">
                    <UserPlus className="w-6 h-6 text-[#76592a]" />
                  </div>
                  <div className="text-left flex-1">
                    <h3 className="font-serif text-lg font-bold text-[#3b2f23] group-hover:text-[#76592a] transition-colors">
                      No, I&apos;m a new member
                    </h3>
                    <p className="text-xs text-[#3b2f23]/60 mt-1.5 font-sans leading-relaxed">
                      I&apos;m registering for the first time. I&apos;ll fill in my personal details and family information.
                    </p>
                    <div className="flex items-center gap-1.5 mt-3 text-[10px] font-mono font-bold uppercase tracking-widest text-[#76592a]">
                      <span>Begin Registration</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* ═══════════════════ STEP: Claim Form ═══════════════════ */}
        {step === 'claim' && (
          <div className="doppelrand-outer w-full shadow-2xl relative z-20">
            <div className="doppelrand-inner p-8 relative">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#4ade80] via-[#16a34a] to-[#14532d] z-10" />

              <form onSubmit={handleClaim} className="space-y-6">
                {/* Info banner */}
                <div className="bg-forest-50 border border-forest-200 rounded-lg p-4 flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-forest-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-forest-800 font-semibold font-sans">Identity Verification</p>
                    <p className="text-[11px] text-forest-700/80 mt-0.5 font-sans leading-relaxed">
                      Enter your Member ID (shared by your family head) and the last 4 digits of your Aadhaar to verify your identity.
                    </p>
                  </div>
                </div>

                <div>
                  <label className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#3b2f23]/60 mb-1.5 block">
                    Member ID
                  </label>
                  <div className="relative">
                    <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#3b2f23]/50" />
                    <input
                      type="text"
                      value={memberCode}
                      onChange={e => setMemberCode(e.target.value.toUpperCase())}
                      placeholder="e.g. MCCRMPR26005"
                      required
                      className="input-field !pl-10 !border-[#dfd8cb] !bg-white/75 focus:!ring-[#3b2f23]/25 focus:!border-[#3b2f23]/50 text-[#3b2f23] font-mono uppercase"
                      id="member-code-input"
                    />
                  </div>
                  <p className="text-[10px] text-[#3b2f23]/40 mt-1.5 font-sans">
                    Your family head can find this on their dashboard.
                  </p>
                </div>

                <div>
                  <label className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#3b2f23]/60 mb-1.5 block">
                    Aadhaar Last 4 Digits
                  </label>
                  <div className="relative">
                    <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#3b2f23]/50" />
                    <input
                      type="text"
                      value={aadhaarLast4}
                      onChange={e => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 4)
                        setAadhaarLast4(val)
                      }}
                      placeholder="e.g. 1234"
                      required
                      maxLength={4}
                      inputMode="numeric"
                      pattern="\d{4}"
                      className="input-field !pl-10 !border-[#dfd8cb] !bg-white/75 focus:!ring-[#3b2f23]/25 focus:!border-[#3b2f23]/50 text-[#3b2f23] font-mono tracking-[0.3em]"
                      id="aadhaar-last4-input"
                    />
                  </div>
                </div>

                {error && (
                  <div className="flex items-start gap-2.5 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-red-700 font-medium font-sans">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !memberCode || aadhaarLast4.length !== 4}
                  className="btn-premium-solid group w-full"
                  id="verify-claim-btn"
                >
                  <div className="flex items-center gap-2">
                    {loading && <Loader2 className="w-4 h-4 animate-spin text-[#ebd096]" />}
                    <span>{loading ? 'Verifying...' : 'Verify & Link Profile'}</span>
                  </div>
                  <div className="btn-premium-icon-wrapper">
                    <ArrowRight className="w-4 h-4 text-[#faf9f6]" strokeWidth={2} />
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => { setStep('choose'); setError(''); setMemberCode(''); setAadhaarLast4('') }}
                  className="w-full flex items-center justify-center gap-1.5 text-xs text-[#3b2f23]/60 hover:text-[#3b2f23] font-semibold font-sans transition-colors cursor-pointer py-2"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Back to options</span>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ═══════════════════ STEP: Success ═══════════════════ */}
        {step === 'success' && (
          <div className="doppelrand-outer w-full shadow-2xl relative z-20">
            <div className="doppelrand-inner p-8 relative flex flex-col items-center text-center">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#4ade80] via-[#16a34a] to-[#14532d] z-10" />

              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-forest-100 to-forest-200 flex items-center justify-center border-2 border-forest-300/50 shadow-lg mb-5">
                <CheckCircle2 className="w-10 h-10 text-forest-600" />
              </div>

              <h3 className="font-serif text-xl font-bold text-[#3b2f23] mb-2">
                Profile Linked Successfully!
              </h3>
              <p className="text-sm text-[#3b2f23]/70 font-sans font-medium mb-4">
                {successMessage}
              </p>

              <div className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-widest text-forest-700">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Redirecting to dashboard...</span>
              </div>
            </div>
          </div>
        )}

        {/* Footer link */}
        {step === 'choose' && (
          <p className="text-xs text-[#faf9f6]/70 text-center mt-8 font-sans font-medium drop-shadow-sm relative z-20">
            Need help?{' '}
            <span className="text-[#faf9f6] font-bold">
              Contact your church administrator.
            </span>
          </p>
        )}
      </ScrollReveal>
    </div>
  )
}
