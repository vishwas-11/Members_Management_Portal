import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ArrowUpRight, ArrowRight, ShieldCheck, CheckCircle2, ChevronRight, UserPlus, FileText, Database, Sparkles, LogIn, BookOpen, Users, BarChart3, Lock } from 'lucide-react'
import { ScrollReveal } from '@/components/ui/ScrollReveal'

// Custom SVGs for decorative elements to ensure exact match with design
const LeftOliveBranch = () => (
  <svg viewBox="0 0 450 350" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
    <defs>
      <linearGradient id="goldGradLeft" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#dfcfb3" />
        <stop offset="50%" stopColor="#bda37a" />
        <stop offset="100%" stopColor="#806846" />
      </linearGradient>
      <linearGradient id="oliveGradLeft" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#8a9c54" />
        <stop offset="50%" stopColor="#556b2f" />
        <stop offset="100%" stopColor="#2c3a14" />
      </linearGradient>
    </defs>
    <path d="M20,320 C100,280 220,180 280,60" stroke="url(#goldGradLeft)" strokeWidth="3" strokeLinecap="round" />
    <path d="M120,220 C150,180 180,150 210,130" stroke="url(#goldGradLeft)" strokeWidth="1.8" />
    <path d="M70,260 C90,210 130,180 160,165" stroke="url(#goldGradLeft)" strokeWidth="1.8" />

    <path d="M280,60 C300,45 330,55 350,75 C330,85 295,80 280,60 Z" fill="url(#goldGradLeft)" stroke="#5c4a31" strokeWidth="0.5" />
    <path d="M230,110 C250,90 290,85 310,100 C290,115 255,120 230,110 Z" fill="url(#goldGradLeft)" stroke="#5c4a31" strokeWidth="0.5" />
    <path d="M190,140 C210,120 250,125 270,145 C250,155 210,150 190,140 Z" fill="url(#goldGradLeft)" stroke="#5c4a31" strokeWidth="0.5" />
    <path d="M140,180 C160,160 200,165 220,185 C200,195 160,190 140,180 Z" fill="url(#goldGradLeft)" stroke="#5c4a31" strokeWidth="0.5" />
    <path d="M90,225 C115,205 150,210 170,230 C150,240 115,235 90,225 Z" fill="url(#goldGradLeft)" stroke="#5c4a31" strokeWidth="0.5" />

    <g filter="drop-shadow(2px 5px 6px rgba(0,0,0,0.35))">
      <ellipse cx="215" cy="125" rx="12" ry="18" transform="rotate(-30 215 125)" fill="url(#oliveGradLeft)" stroke="#273310" strokeWidth="1" />
      <circle cx="211" cy="120" r="3.5" fill="#ffffff" opacity="0.25" />
      <ellipse cx="130" cy="190" rx="11" ry="17" transform="rotate(40 130 190)" fill="url(#oliveGradLeft)" stroke="#273310" strokeWidth="1" />
      <circle cx="127" cy="185" r="3.5" fill="#ffffff" opacity="0.25" />
      <ellipse cx="255" cy="85" rx="11" ry="17" transform="rotate(10 255 85)" fill="url(#oliveGradLeft)" stroke="#273310" strokeWidth="1" />
      <circle cx="252" cy="80" r="3" fill="#ffffff" opacity="0.25" />
    </g>
  </svg>
)

const RightOliveBranch = () => (
  <svg viewBox="0 0 450 350" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
    <defs>
      <linearGradient id="goldGradRight" x1="100%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#dfcfb3" />
        <stop offset="50%" stopColor="#bda37a" />
        <stop offset="100%" stopColor="#806846" />
      </linearGradient>
      <linearGradient id="oliveGradRight" x1="100%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#8a9c54" />
        <stop offset="50%" stopColor="#556b2f" />
        <stop offset="100%" stopColor="#2c3a14" />
      </linearGradient>
    </defs>
    <path d="M430,320 C350,280 230,180 170,60" stroke="url(#goldGradRight)" strokeWidth="3" strokeLinecap="round" />
    <path d="M330,220 C300,180 270,150 240,130" stroke="url(#goldGradRight)" strokeWidth="1.8" />
    <path d="M380,260 C360,210 320,180 290,165" stroke="url(#goldGradRight)" strokeWidth="1.8" />

    <path d="M170,60 C150,45 120,55 100,75 C120,85 155,80 170,60 Z" fill="url(#goldGradRight)" stroke="#5c4a31" strokeWidth="0.5" />
    <path d="M220,110 C200,90 160,85 140,100 C160,115 195,120 220,110 Z" fill="url(#goldGradRight)" stroke="#5c4a31" strokeWidth="0.5" />
    <path d="M260,140 C240,120 200,125 180,145 C200,155 240,150 260,140 Z" fill="url(#goldGradRight)" stroke="#5c4a31" strokeWidth="0.5" />
    <path d="M310,180 C290,160 250,165 230,185 C250,195 290,190 310,180 Z" fill="url(#goldGradRight)" stroke="#5c4a31" strokeWidth="0.5" />
    <path d="M360,225 C335,205 300,210 280,230 C300,240 335,235 360,225 Z" fill="url(#goldGradRight)" stroke="#5c4a31" strokeWidth="0.5" />

    <g filter="drop-shadow(-2px 5px 6px rgba(0,0,0,0.35))">
      <ellipse cx="235" cy="125" rx="12" ry="18" transform="rotate(30 235 125)" fill="url(#oliveGradRight)" stroke="#273310" strokeWidth="1" />
      <circle cx="239" cy="120" r="3.5" fill="#ffffff" opacity="0.25" />
      <ellipse cx="320" cy="190" rx="11" ry="17" transform="rotate(-40 320 190)" fill="url(#oliveGradRight)" stroke="#273310" strokeWidth="1" />
      <circle cx="323" cy="185" r="3.5" fill="#ffffff" opacity="0.25" />
      <ellipse cx="195" cy="85" rx="11" ry="17" transform="rotate(-10 195 85)" fill="url(#oliveGradRight)" stroke="#273310" strokeWidth="1" />
      <circle cx="198" cy="80" r="3" fill="#ffffff" opacity="0.25" />
    </g>
  </svg>
)

const LetterpressCross = ({ className = "w-6 h-10" }: { className?: string }) => (
  <svg viewBox="0 0 24 36" fill="none" xmlns="http://www.w3.org/2000/svg" className={`${className} filter drop-shadow-[0_1px_0.5px_rgba(255,255,255,0.45)]`}>
    <path
      d="M 10,0.5 L 14,1.8 L 14,34.2 L 10,35.5 Z M 1,11 L 23,12.2 L 23,15.2 L 1,14 Z"
      fill="currentColor"
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


export default async function LandingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let portalUrl = '/login'
  let isLoggedIn = false
  let buttonText = 'Access Member Portal'
  let userName = ''

  // Fetch daily verse
  let verseText = "See to it, brothers and sisters, that none of you has an evil, unbelieving heart that forsakes the living God. But exhort one another each day, as long as it is called “Today,” that none of you may become hardened by sin’s deception."
  let verseRef = "Hebrews 3:12-13"
  try {
    // Calculate seconds until next midnight in IST (UTC+5:30)
    const now = new Date()
    const istTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }))
    const nextMidnight = new Date(istTime)
    nextMidnight.setHours(24, 0, 0, 0)
    const secondsUntilMidnight = Math.max(60, Math.floor((nextMidnight.getTime() - istTime.getTime()) / 1000))

    const res = await fetch('https://labs.bible.org/api/?passage=votd&type=json', { next: { revalidate: secondsUntilMidnight } })
    if (res.ok) {
      const data = await res.json()
      if (data && data.length > 0) {
        // Handle cases where the verse of the day spans multiple verses
        verseText = data.map((v: any) => v.text.replace(/<[^>]+>/g, '').trim()).join(' ')
        const first = data[0]
        const last = data[data.length - 1]
        verseRef = data.length > 1 
          ? `${first.bookname} ${first.chapter}:${first.verse}-${last.verse}`
          : `${first.bookname} ${first.chapter}:${first.verse}`
      }
    }
  } catch (e) {
    console.error('Failed to fetch daily verse', e)
  }

  if (user) {
    isLoggedIn = true
    buttonText = 'Go to Dashboard'
    const { data: member } = await supabase
      .from('members')
      .select('role, full_name')
      .eq('user_id', user.id)
      .single()

    if (!member) {
      portalUrl = '/register/details'
      buttonText = 'Complete Registration'
    } else if (member.role === 'admin') {
      portalUrl = '/admin'
      userName = member.full_name
    } else {
      portalUrl = '/dashboard'
      userName = member.full_name
    }
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-x-hidden bg-linen-green text-[#3b2f23] selection:bg-[#3b2f23] selection:text-[#faf9f6]">
      {/* Paper Noise Overlay for tactility */}
      <div className="paper-overlay" />

      {/* Subtle Botanical Flanks in background */}
      <div className="botanical-flank absolute left-[-150px] md:left-[-100px] top-[5%] w-[450px] md:w-[550px] pointer-events-none select-none z-0 opacity-85 drop-shadow-2xl">
        <LeftOliveBranch />
      </div>
      <div className="botanical-flank absolute right-[-150px] md:right-[-100px] top-[15%] w-[480px] md:w-[580px] pointer-events-none select-none z-0 opacity-85 drop-shadow-2xl">
        <RightOliveBranch />
      </div>
      <div className="botanical-flank absolute right-[-150px] md:right-[-100px] top-[55%] w-[450px] md:w-[550px] pointer-events-none select-none z-0 opacity-85 drop-shadow-2xl transform -scale-y-100">
        <RightOliveBranch />
      </div>
      <div className="botanical-flank absolute left-[-150px] md:left-[-100px] top-[65%] w-[480px] md:w-[580px] pointer-events-none select-none z-0 opacity-85 drop-shadow-2xl transform -scale-y-100">
        <LeftOliveBranch />
      </div>

      {/* Floating Island Nav */}
      <header className="fixed top-6 left-0 right-0 z-50 px-4 md:px-0 pointer-events-none">
        <div className="max-w-4xl mx-auto flex items-center justify-between p-2 md:p-3 rounded-full bg-white/70 backdrop-blur-xl border border-[#3b2f23]/10 shadow-[0_8px_32px_rgba(59,47,35,0.08)] pointer-events-auto transition-fluid">
          <Link href="/" className="logo-badge-skeu group">
            <MethodistLogo className="h-6 w-auto" />
            <span className="text-xs font-serif font-bold tracking-wide">Methodist Registry</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 px-6 text-[#3b2f23] font-sans text-xs uppercase tracking-[0.15em] font-semibold">
            <Link href="#features" className="hover:opacity-60 transition-opacity">Features</Link>
            <Link href="#about" className="hover:opacity-60 transition-opacity">About</Link>
            <Link href="#contact" className="hover:opacity-60 transition-opacity">Contact</Link>
          </nav>

          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <Link href={portalUrl} className="btn-premium-solid py-2 px-4 md:px-5">
                <span className="text-xs">{userName || 'Dashboard'}</span>
              </Link>
            ) : (
              <>
                <Link href="/login" className="hidden sm:block text-xs font-semibold text-[#3b2f23]/80 hover:text-[#3b2f23] px-3">
                  Login
                </Link>
                <Link href="/register" className="btn-premium-solid py-2 px-4 md:px-5">
                  <span className="text-xs">Register</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-grow flex flex-col w-full relative z-10 pt-32">
        {/* Editorial Split Hero Section */}
        <section className="min-h-[100dvh] flex items-center w-full">
          <div className="max-w-7xl mx-auto px-6 w-full flex flex-col md:flex-row items-center justify-between gap-16 md:gap-8">

            {/* Left Side: Massive Typography */}
            <ScrollReveal className="w-full md:w-[55%] flex flex-col items-start text-left z-20">
              <div className="mb-8 flex items-center gap-4">
                <LetterpressCross className="w-4 h-6 opacity-60 text-[#faf9f6]" />
                <span className="font-mono text-[10px] tracking-[0.2em] uppercase font-bold text-[#faf9f6]/70">Welcome Congregation</span>
              </div>
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-serif font-medium leading-[1.05] tracking-tight mb-8 bg-gradient-to-br from-[#fcfbf9] via-[#e8d5b5] to-[#c5b799] bg-clip-text text-transparent drop-shadow-[0_2px_4px_rgba(13,33,25,0.8)]">
                Gracefully<br />managing our<br />congregation.
              </h1>
              <p className="font-sans text-lg md:text-xl text-[#fcfbf9]/80 leading-relaxed max-w-lg mb-12 drop-shadow-sm">
                A digital member registry designed with classical restraint, built for modern church administration. Timeless. Refined. Trusted.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                <Link href={portalUrl} className="btn-premium-solid group w-full sm:w-auto">
                  <span>{buttonText}</span>
                  <div className="btn-premium-icon-wrapper">
                    <ArrowUpRight className="w-4 h-4 text-[#faf9f6]" strokeWidth={2} />
                  </div>
                </Link>
                {!isLoggedIn && (
                  <Link href="/register" className="btn-premium-outline w-full sm:w-auto mt-4 sm:mt-0">
                    Create Account
                  </Link>
                )}
              </div>
            </ScrollReveal>

            {/* Right Side: Z-Axis Cascade Interactive Cards */}
            <ScrollReveal className="w-full md:w-[45%] relative h-[500px] md:h-[600px] flex items-center justify-center pointer-events-none" delay={200}>
              <div className="relative w-full max-w-md h-full">
                {/* Daily Bible Verse Card */}
                <div className="absolute top-[20%] left-[5%] right-[5%] doppelrand-outer z-20 shadow-2xl transition-fluid group pointer-events-auto">
                  <div className="doppelrand-inner p-8 flex flex-col gap-6 bg-white/95 backdrop-blur-md">
                    <div className="flex items-center justify-between">
                      <span className="eyebrow-tag bg-[#f5f3ee] text-[#3b2f23] border-[#dfd8cb] flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-[#76592a]" /> Verse of the Day
                      </span>
                    </div>
                    <div>
                      <blockquote className="font-serif text-xl md:text-2xl text-[#3b2f23] leading-relaxed italic relative">
                        <span className="absolute -top-4 -left-3 text-5xl text-[#dfd8cb] opacity-50 font-serif">"</span>
                        {verseText}
                        <span className="absolute -bottom-4 text-5xl text-[#dfd8cb] opacity-50 font-serif ml-1">"</span>
                      </blockquote>
                      <p className="text-sm font-bold uppercase tracking-widest text-[#76592a] mt-6 flex justify-end text-right">
                        — {verseRef}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>

          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-32 md:py-40 max-w-6xl mx-auto px-6 relative z-10">
          <ScrollReveal>
            <div className="flex flex-col items-center text-center mb-24">
              <span className="inline-flex items-center px-4 py-1.5 rounded-full text-[10px] uppercase tracking-[0.2em] font-bold font-mono border border-[#faf9f6]/20 bg-white/10 text-[#faf9f6]/90 shadow-sm backdrop-blur-sm mb-6">Capabilities</span>
              <h2 className="text-4xl md:text-5xl font-serif font-medium tracking-tight bg-gradient-to-br from-[#fcfbf9] via-[#e8d5b5] to-[#c5b799] bg-clip-text text-transparent drop-shadow-[0_2px_4px_rgba(13,33,25,0.8)]">
                Digital Precision.
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ScrollReveal delay={100}>
              <div className="doppelrand-outer h-full">
                <div className="doppelrand-inner p-8 flex flex-col gap-6 h-full transition-fluid hover:bg-white">
                  <div className="coin-badge-skeu">
                    <Lock className="w-5 h-5 text-[#4a3820]" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="font-serif text-xl font-semibold text-[#3b2f23] mb-3">Secure Registry</h3>
                    <p className="font-sans text-sm text-[#3b2f23]/70 leading-relaxed">
                      Encrypted personal records ensure your congregation's sensitive data remains fully protected under modern security standards.
                    </p>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={200}>
              <div className="doppelrand-outer h-full">
                <div className="doppelrand-inner p-8 flex flex-col gap-6 h-full transition-fluid hover:bg-white">
                  <div className="coin-badge-skeu">
                    <Users className="w-5 h-5 text-[#4a3820]" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="font-serif text-xl font-semibold text-[#3b2f23] mb-3">Congregation Management</h3>
                    <p className="font-sans text-sm text-[#3b2f23]/70 leading-relaxed">
                      Tools designed specifically for elegant, simple church administration and family connection tracking.
                    </p>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={300}>
              <div className="doppelrand-outer h-full">
                <div className="doppelrand-inner p-8 flex flex-col gap-6 h-full transition-fluid hover:bg-white">
                  <div className="coin-badge-skeu">
                    <BarChart3 className="w-5 h-5 text-[#4a3820]" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="font-serif text-xl font-semibold text-[#3b2f23] mb-3">Intuitive Reporting</h3>
                    <p className="font-sans text-sm text-[#3b2f23]/70 leading-relaxed">
                      Generate beautiful, clear reports and elegant member directories instantly for church committee reviews.
                    </p>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>
      </main>

      {/* Wrapping the rest in bg-linen-cream to switch background color below hero/features */}
      <div className="bg-linen-cream relative z-20 border-t border-[#dfd8cb] w-full">
        {/* Portal Steps Section */}
        <section className="py-32 max-w-6xl mx-auto px-6 w-full border-t border-[#3b2f23]/10 relative z-20">
          <ScrollReveal>
            <div className="text-center mb-20">
              <span className="font-mono text-[10px] tracking-[0.2em] uppercase font-bold text-[#3b2f23]/60">Member Guide</span>
              <h2 className="font-serif text-4xl md:text-5xl text-[#3b2f23] mt-4">How to use the portal</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-12 relative">
              {/* Connecting line for desktop */}
              <div className="hidden md:block absolute top-[13%] left-[15%] right-[15%] h-[1px] bg-[#3b2f23]/10 z-0" />
              
              {/* Step 01 */}
              <div className="relative group text-center md:text-left z-10">
                <div className="mb-8 flex flex-col items-center md:items-start">
                  <div className="bg-linen-cream px-2">
                    <span className="font-serif text-[5.5rem] leading-none text-[#76592a] block mb-6 drop-shadow-sm group-hover:-translate-y-1 transition-transform duration-500">01</span>
                  </div>
                  <span className="eyebrow-tag border-[#3b2f23]/20 text-[#3b2f23]">Submit Details</span>
                </div>
                <h3 className="font-serif text-2xl font-medium text-[#3b2f23] mb-4">Create Family Profile</h3>
                <p className="font-sans text-base text-[#3b2f23]/70 leading-relaxed max-w-[280px] mx-auto md:mx-0">
                  Submit your family details securely to register your household.
                </p>
              </div>

              {/* Step 02 */}
              <div className="relative group text-center md:text-left z-10">
                <div className="mb-8 flex flex-col items-center md:items-start">
                  <div className="bg-linen-cream px-2">
                    <span className="font-serif text-[5.5rem] leading-none text-[#76592a] block mb-6 drop-shadow-sm group-hover:-translate-y-1 transition-transform duration-500">02</span>
                  </div>
                  <span className="eyebrow-tag border-[#3b2f23]/20 text-[#3b2f23]">Church Review</span>
                </div>
                <h3 className="font-serif text-2xl font-medium text-[#3b2f23] mb-4">Verification Process</h3>
                <p className="font-sans text-base text-[#3b2f23]/70 leading-relaxed max-w-[280px] mx-auto md:mx-0">
                  Church administration reviews your details to officially verify your membership.
                </p>
              </div>

              {/* Step 03 */}
              <div className="relative group text-center md:text-left z-10">
                <div className="mb-8 flex flex-col items-center md:items-start">
                  <div className="bg-linen-cream px-2">
                    <span className="font-serif text-[5.5rem] leading-none text-[#76592a] block mb-6 drop-shadow-sm group-hover:-translate-y-1 transition-transform duration-500">03</span>
                  </div>
                  <span className="eyebrow-tag border-[#3b2f23]/20 text-[#3b2f23]">Access Dashboard</span>
                </div>
                <h3 className="font-serif text-2xl font-medium text-[#3b2f23] mb-4">Manage Dues & Receipts</h3>
                <p className="font-sans text-base text-[#3b2f23]/70 leading-relaxed max-w-[280px] mx-auto md:mx-0">
                  Log in to track dues, submit payment proofs, and manage your standing seamlessly.
                </p>
              </div>
            </div>
          </ScrollReveal>
        </section>

        {/* Testimonial Section */}
        <section className="py-32 bg-[#faf9f6] border-y border-[#3b2f23]/10 relative text-center">
          <ScrollReveal>
            <div className="max-w-3xl mx-auto px-6">
              <div className="mb-12 opacity-50 flex justify-center">
                <LetterpressCross className="w-6 h-10" />
              </div>
              <blockquote className="font-serif text-3xl md:text-4xl lg:text-5xl font-light text-[#3b2f23] italic leading-tight mb-12">
                "A church register is more than a list of names; it is a living testament to community, history, and shared faith."
              </blockquote>
              <cite className="eyebrow-tag not-italic">Administrative Guild</cite>
            </div>
          </ScrollReveal>
        </section>

        {/* Footer */}
        <footer id="about" className="relative mt-24">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#ebd2a3] via-[#be9d62] to-[#76592a] z-20" />
          <div className="bg-[#0d2119] relative overflow-hidden text-[#faf9f6] py-24">
            {/* Dark wood texture overlay */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "url('/textures/dark-wood.png')", backgroundSize: 'cover' }} />

            {/* Olive branches */}
            <div className="absolute right-[-100px] bottom-[-50px] w-[400px] opacity-10 pointer-events-none transform -rotate-45">
              <RightOliveBranch />
            </div>
            <div className="absolute left-[-100px] top-[-50px] w-[300px] opacity-10 pointer-events-none transform rotate-180">
              <LeftOliveBranch />
            </div>

            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-12 relative z-10">
              {/* Branding Column */}
              <div className="space-y-6 flex flex-col items-center md:items-start text-center md:text-left">
                <Link href="/" className="logo-badge-skeu group !bg-[#153225] !border-[#2a4d3a] !px-5 !py-3 text-[#ebd2a3]">
                  <MethodistLogo className="h-10 w-auto opacity-100 drop-shadow-md" />
                  <span className="text-xl font-serif font-bold tracking-wide text-[#faf9f6] drop-shadow-sm">Methodist Registry</span>
                </Link>
                <p className="text-base text-[#faf9f6]/80 max-w-xs leading-relaxed font-serif italic">
                  A digital member registry designed with classical restraint for Methodist Christ Church administration.
                </p>
                <p className="text-xs text-[#faf9f6]/40 font-sans pt-4 uppercase tracking-widest font-bold">
                  &copy; {new Date().getFullYear()} Methodist Registry.<br />All rights reserved.
                </p>
              </div>

              {/* Location Column */}
              <div className="space-y-6 text-center md:text-left">
                <h4 className="font-mono text-[11px] uppercase tracking-widest text-[#ebd2a3] font-bold">Church Location</h4>
                <a
                  href="https://maps.app.goo.gl/z49qEU4JMPh6nztf6"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-[#faf9f6]/80 space-y-2 leading-relaxed group"
                >
                  <p className="font-serif text-lg font-bold text-[#faf9f6] group-hover:text-[#ebd2a3] transition-colors drop-shadow-sm">Methodist Christ Church, Rampur</p>
                  <p className="font-serif italic group-hover:text-[#ebd2a3] transition-colors text-[15px]">15, Civil Lines, Rampur (U.P) - 244901</p>
                </a>
                <div className="pt-6">
                  <p className="text-[10px] uppercase font-mono tracking-widest text-[#faf9f6]/50 mb-2 font-bold">Pastor Incharge</p>
                  <p className="font-serif text-2xl font-medium text-[#ebd2a3] drop-shadow-sm">Rev. Nitin Masih</p>
                </div>
              </div>

              {/* Contact Column */}
              <div id="contact" className="space-y-6 text-center md:text-left">
                <h4 className="font-mono text-[11px] uppercase tracking-widest text-[#ebd2a3] font-bold">Contact Details</h4>
                <div className="text-[#faf9f6]/80 space-y-6">
                  <div>
                    <p className="text-[10px] uppercase font-mono tracking-widest text-[#faf9f6]/50 mb-2 font-bold">Email Address</p>
                    <a
                      href="mailto:vcharan1126@gmail.com"
                      className="font-serif text-xl font-medium text-[#faf9f6] hover:text-[#ebd2a3] transition-colors drop-shadow-sm"
                    >
                      vcharan1126@gmail.com
                    </a>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-mono tracking-widest text-[#faf9f6]/50 mb-2 font-bold">Phone Number</p>
                    <a
                      href="tel:9412645482"
                      className="font-serif text-xl font-medium text-[#faf9f6] hover:text-[#ebd2a3] transition-colors drop-shadow-sm"
                    >
                      +91 94126 45482
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}