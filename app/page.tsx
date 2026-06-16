import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ArrowRight, ShieldCheck, Users, BarChart3, Lock } from 'lucide-react'

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

const GildedCross = ({ size = "w-10 h-16" }: { size?: string }) => (
  <svg viewBox="0 0 80 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={`${size} drop-shadow-[0_4px_6px_rgba(0,0,0,0.45)]`}>
    <defs>
      <linearGradient id="goldGradCross" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ebd2a3" />
        <stop offset="50%" stopColor="#be9d62" />
        <stop offset="100%" stopColor="#76592a" />
      </linearGradient>
    </defs>
    <path d="M34,6 h12 v108 h-12 Z" fill="url(#goldGradCross)" stroke="#4d3c22" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M12,38 h56 v12 h-56 Z" fill="url(#goldGradCross)" stroke="#4d3c22" strokeWidth="1.5" strokeLinejoin="round" />

    <circle cx="40" cy="12" r="2.2" fill="#ffffff" stroke="#76592a" strokeWidth="0.5" />
    <circle cx="40" cy="24" r="2.2" fill="#ffffff" stroke="#76592a" strokeWidth="0.5" />
    <circle cx="40" cy="36" r="2.2" fill="#ffffff" stroke="#76592a" strokeWidth="0.5" />
    <circle cx="40" cy="44" r="2.2" fill="#ffffff" stroke="#76592a" strokeWidth="0.5" />
    <circle cx="40" cy="56" r="2.2" fill="#ffffff" stroke="#76592a" strokeWidth="0.5" />
    <circle cx="40" cy="68" r="2.2" fill="#ffffff" stroke="#76592a" strokeWidth="0.5" />
    <circle cx="40" cy="80" r="2.2" fill="#ffffff" stroke="#76592a" strokeWidth="0.5" />
    <circle cx="40" cy="92" r="2.2" fill="#ffffff" stroke="#76592a" strokeWidth="0.5" />
    <circle cx="40" cy="104" r="2.2" fill="#ffffff" stroke="#76592a" strokeWidth="0.5" />

    <circle cx="18" cy="44" r="2.2" fill="#ffffff" stroke="#76592a" strokeWidth="0.5" />
    <circle cx="29" cy="44" r="2.2" fill="#ffffff" stroke="#76592a" strokeWidth="0.5" />
    <circle cx="51" cy="44" r="2.2" fill="#ffffff" stroke="#76592a" strokeWidth="0.5" />
    <circle cx="62" cy="44" r="2.2" fill="#ffffff" stroke="#76592a" strokeWidth="0.5" />
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
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-linen-green select-none">
      {/* Paper Noise Overlay for added tactility */}
      <div className="paper-overlay" />

      {/* Decorative absolute background elements */}
      {/* Left branch */}
      <div className="botanical-flank absolute left-[-80px] md:left-[-30px] top-[120px] w-[260px] md:w-[380px] pointer-events-none select-none z-10 opacity-90">
        <LeftOliveBranch />
      </div>
      
      {/* Right branch */}
      <div className="botanical-flank absolute right-[-80px] md:right-[-30px] top-[90px] w-[280px] md:w-[400px] pointer-events-none select-none z-10 opacity-90">
        <RightOliveBranch />
      </div>

      {/* Left pearl cross */}
      <div className="botanical-flank absolute left-[8%] top-[190px] pointer-events-none select-none z-10 hidden sm:block">
        <GildedCross size="w-8 h-12" />
      </div>

      {/* Right pearl cross */}
      <div className="botanical-flank absolute right-[10%] top-[390px] pointer-events-none select-none z-10 hidden sm:block">
        <GildedCross size="w-8 h-12" />
      </div>

      {/* Scattered sparkles */}
      <div className="absolute left-[18%] top-[160px] pointer-events-none select-none z-10 opacity-70">
        <Sparkle />
      </div>
      <div className="absolute left-[7%] top-[440px] pointer-events-none select-none z-10 opacity-75">
        <Sparkle />
      </div>
      <div className="absolute right-[22%] top-[200px] pointer-events-none select-none z-10 opacity-70">
        <Sparkle />
      </div>
      <div className="absolute right-[8%] top-[480px] pointer-events-none select-none z-10 opacity-60">
        <Sparkle />
      </div>

      {/* Landing Navbar */}
      <header className="sticky top-0 z-50 transition-all duration-200 py-4 px-6 md:px-12">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Logo Badge (Ivory/Gold Plaque logo container) */}
          <Link href="/" className="group transition-transform hover:scale-[1.02] active:scale-[0.98]">
            <div className="logo-badge-skeu">
              <div className="w-5 h-5 flex items-center justify-center text-[#3b2f23]">
                <MethodistLogo className="w-4.5 h-4.5" />
              </div>
              <span className="text-sm font-serif font-bold tracking-wide text-[#3b2f23]">
                Methodist Registry
              </span>
            </div>
          </Link>

          {/* Navigation Links in Center */}
          <nav className="hidden md:flex items-center gap-8 text-[#3b2f23]/85 font-sans text-xs uppercase tracking-[0.15em] font-semibold">
            <Link href="#features" className="hover:text-[#3b2f23] transition-colors relative after:absolute after:bottom-[-2px] after:left-0 after:w-0 after:h-[1px] after:bg-[#3b2f23] hover:after:w-full after:transition-all">
              Features
            </Link>
            <Link href="#pricing" className="hover:text-[#3b2f23] transition-colors relative after:absolute after:bottom-[-2px] after:left-0 after:w-0 after:h-[1px] after:bg-[#3b2f23] hover:after:w-full after:transition-all">
              Pricing
            </Link>
            <Link href="#about" className="hover:text-[#3b2f23] transition-colors relative after:absolute after:bottom-[-2px] after:left-0 after:w-0 after:h-[1px] after:bg-[#3b2f23] hover:after:w-full after:transition-all">
              About
            </Link>
            <Link href="#contact" className="hover:text-[#3b2f23] transition-colors relative after:absolute after:bottom-[-2px] after:left-0 after:w-0 after:h-[1px] after:bg-[#3b2f23] hover:after:w-full after:transition-all">
              Contact
            </Link>
          </nav>

          {/* User Auth Buttons */}
          <div className="flex items-center gap-3 sm:gap-6">
            {isLoggedIn ? (
              <>
                <span className="text-xs font-mono text-[#3b2f23]/60 bg-white/20 border border-[#3b2f23]/10 px-2.5 py-1 rounded hidden sm:block">
                  {userName || 'Logged In'}
                </span>
                <Link href={portalUrl} className="btn-skeu-register px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm">
                  Dashboard
                </Link>
              </>
            ) : (
              <>
                <Link href="/login" className="text-xs sm:text-sm font-semibold text-[#3b2f23]/85 hover:text-[#3b2f23] underline decoration-[#3b2f23]/30 underline-offset-4 hover:decoration-[#3b2f23] transition-colors">
                  Login
                </Link>
                <Link href="/register" className="btn-skeu-register px-3.5 py-1.5 sm:px-5 sm:py-2 text-xs sm:text-sm">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 md:py-28 max-w-5xl mx-auto px-6 text-center relative z-20">
        <div className="mb-6 flex items-center justify-center gap-4 max-w-[280px] mx-auto">
          <span className="skeu-line" />
          <span className="font-sans text-[11px] font-bold uppercase tracking-[0.18em] text-[#3b2f23]/85">
            Welcome Congregation
          </span>
          <span className="skeu-line" />
        </div>

        <h1 className="text-skeu-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-normal leading-[1.12] tracking-tight mb-8 max-w-4xl mx-auto">
          Gracefully managing our congregation.
        </h1>
        
        <p className="font-sans text-base md:text-lg text-[#3b2f23]/80 leading-relaxed max-w-2xl mx-auto mb-12 px-2">
          A digital member registry designed with classical restraint, built for modern church administration. Timeless. Refined. Trusted.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-5 max-w-md mx-auto">
          <Link href={portalUrl} className="btn-skeu-wood w-full sm:w-auto px-7 py-3 flex items-center justify-center gap-2 text-sm">
            <span>{buttonText}</span>
            <ArrowRight className="w-4 h-4 text-[#ebd096]" />
          </Link>
          {!isLoggedIn && (
            <Link href="/register" className="btn-skeu-clay w-full sm:w-auto px-7 py-3 text-sm flex items-center justify-center">
              Create Account
            </Link>
          )}
        </div>

        {/* Subtle 4-pointed star graphic in the bottom right corner of green hero section */}
        <div className="absolute right-6 bottom-6 opacity-35 pointer-events-none select-none z-10 hidden md:block">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20,0 L24,16 L40,20 L24,24 L20,40 L16,24 L0,20 L16,16 Z" fill="#ffffff" />
          </svg>
        </div>
      </section>

      {/* Transition to Warm Cream Linen Background */}
      <main className="bg-linen-cream flex-grow relative z-20 border-t border-[#dfd8cb]">
        
        {/* Features Overview Section */}
        <section id="features" className="py-24 max-w-5xl mx-auto px-6">
          <h2 className="text-skeu-heading text-3xl md:text-4xl text-center mb-16 font-normal">
            Features Overview
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="card-skeu-wood p-8 flex flex-col gap-5">
              <div className="coin-badge-skeu">
                <ShieldCheck className="w-5 h-5 text-[#4a3820] stroke-[2]" />
              </div>
              <h3 className="font-serif text-xl font-semibold text-[#3b2f23]">Secure Registry</h3>
              <p className="font-sans text-sm text-[#3b2f23]/75 leading-relaxed">
                Secure your congregation&apos;s registry to keep personal records protected and fully encrypted.
              </p>
            </div>

            <div className="card-skeu-wood p-8 flex flex-col gap-5">
              <div className="coin-badge-skeu">
                <Users className="w-5 h-5 text-[#4a3820] stroke-[2]" />
              </div>
              <h3 className="font-serif text-xl font-semibold text-[#3b2f23]">Congregation Management</h3>
              <p className="font-sans text-sm text-[#3b2f23]/75 leading-relaxed">
                Manage church membership with modern tools designed for elegant, simple church administration.
              </p>
            </div>

            <div className="card-skeu-wood p-8 flex flex-col gap-5">
              <div className="coin-badge-skeu">
                <BarChart3 className="w-5 h-5 text-[#4a3820] stroke-[2]" />
              </div>
              <h3 className="font-serif text-xl font-semibold text-[#3b2f23]">Intuitive Reporting</h3>
              <p className="font-sans text-sm text-[#3b2f23]/75 leading-relaxed">
                Generate beautiful, clear reports and intuitive member directories with a single click.
              </p>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 border-y border-[#dfd8cb] max-w-5xl mx-auto px-6 w-full">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-0 divide-y md:divide-y-0 md:divide-x divide-[#dfd8cb]">
            <div className="text-center md:pb-0 pb-6">
              <span className="font-serif text-5xl md:text-6xl font-normal text-[#3b2f23] block mb-2">1,250+</span>
              <span className="font-mono text-xs uppercase tracking-widest text-[#3b2f23]/50">Active Members</span>
            </div>
            <div className="text-center md:py-0 py-6">
              <span className="font-serif text-5xl md:text-6xl font-normal text-[#3b2f23] block mb-2">1894</span>
              <span className="font-mono text-xs uppercase tracking-widest text-[#3b2f23]/50">Year Founded</span>
            </div>
            <div className="text-center md:pt-0 pt-6">
              <span className="font-serif text-5xl md:text-6xl font-normal text-[#3b2f23] block mb-2">100%</span>
              <span className="font-mono text-xs uppercase tracking-widest text-[#3b2f23]/50">Secure Records</span>
            </div>
          </div>
        </section>

        {/* Asymmetric Benefits Section */}
        <section className="py-24 max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
            <div className="md:col-span-7 space-y-6">
              <h2 className="text-skeu-heading text-3xl md:text-4xl font-normal tracking-tight leading-tight">
                Honoring heritage through digital precision.
              </h2>
              <p className="text-[#3b2f23]/80 leading-relaxed text-base">
                For centuries, the church registry has been a vital historical thread binding congregations. We preserve that administrative reverence in a digital platform that makes management elegant and simple.
              </p>
              <div className="border-l-2 border-[#ebd2a3] pl-4 py-1">
                <p className="text-sm font-serif italic text-[#3b2f23]/70 leading-relaxed">
                  &quot;Our aim is classical simplicity, keeping the church administration secure and centered around family connections.&quot;
                </p>
              </div>
            </div>

            <div className="md:col-span-5">
              <div className="bg-[#fcfbf9] border border-[#e8e2d5] rounded-xl shadow-md p-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#ebd2a3] via-[#be9d62] to-[#76592a]" />
                <div className="flex justify-between items-center mb-6">
                  <span className="text-[10px] font-mono font-medium text-[#3b2f23]/60 tracking-wider">MEMBER STATEMENT</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-100">
                    Paid
                  </span>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-[9px] uppercase font-mono tracking-widest text-[#3b2f23]/40">Member Name</p>
                    <p className="font-serif text-base text-[#3b2f23] font-semibold">Thomas P. Alva</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[9px] uppercase font-mono tracking-widest text-[#3b2f23]/40">Family Size</p>
                      <p className="text-sm text-[#3b2f23] font-semibold">4 members</p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase font-mono tracking-widest text-[#3b2f23]/40">Contribution ID</p>
                      <p className="text-sm text-[#3b2f23] font-semibold font-mono">#992-E</p>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-[#dfd8cb]">
                    <p className="text-[11px] text-[#3b2f23]/50 italic">Dues reconcile automatically upon verification.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonial / Quote Section */}
        <section className="py-20 bg-[#e5e0d5] border-t border-[#dfd8cb] relative z-10 text-center">
          <div className="max-w-3xl mx-auto px-6">
            <span className="font-serif text-7xl font-semibold text-[#3b2f23]/20 leading-none select-none block h-8">&ldquo;</span>
            <blockquote className="font-serif text-2xl md:text-3xl font-light text-[#3b2f23] italic leading-relaxed mb-6">
              A church register is more than a list of names; it is a living testament to community, history, and shared faith.
            </blockquote>
            <cite className="font-mono text-xs uppercase tracking-widest text-[#3b2f23]/50 not-italic">— Administrative Guild</cite>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-[#eee9e0] border-t border-[#dfd8cb] py-12 relative z-10">
          <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 border-2 border-[#be9d62] rounded flex items-center justify-center bg-[#faf9f6] text-[#3b2f23]">
                <MethodistLogo className="w-3.5 h-3.5" />
              </div>
              <span className="font-serif font-semibold text-sm text-[#3b2f23] tracking-wide">
                Methodist Member Registry
              </span>
            </div>

            <p className="text-xs text-[#3b2f23]/50 font-sans">
              &copy; {new Date().getFullYear()} Methodist Registry. All rights reserved. Designed with classical elegance.
            </p>
          </div>
        </footer>
      </main>
    </div>
  )
}