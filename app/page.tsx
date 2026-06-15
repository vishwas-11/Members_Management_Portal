import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ChurchIcon, ArrowRight, BookOpen, ShieldCheck, Heart } from 'lucide-react'

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
    <div className="min-h-screen bg-cream-50 text-forest-800 flex flex-col relative overflow-hidden">
      {/* Decorative ambient glows */}
      <div className="ambient-glow -top-40 -left-40" />
      <div className="ambient-glow top-2/3 -right-20" />

      {/* Landing Navbar */}
      <header className="bg-white/80 backdrop-blur-md border-b border-cream-200 sticky top-0 z-50 transition-all duration-200">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 border border-forest-600 rounded-md flex items-center justify-center">
              <ChurchIcon className="w-4 h-4 text-forest-600" />
            </div>
            <span className="font-serif font-semibold text-lg tracking-wide">
              Church Registry
            </span>
          </div>

          <nav className="flex items-center gap-6">
            {isLoggedIn ? (
              <>
                <span className="text-xs font-mono text-gray-400 bg-cream-100 px-2.5 py-1 rounded hidden sm:block">
                  {userName || 'Logged In'}
                </span>
                <Link href={portalUrl} className="btn-primary min-h-[40px] px-4 py-2">
                  Dashboard
                </Link>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-forest-600 transition-colors">
                  Login
                </Link>
                <Link href="/register" className="btn-primary min-h-[40px] px-4 py-2">
                  Register
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-24 md:py-32 max-w-5xl mx-auto px-6 text-center relative z-10">
        <div className="mb-6 flex items-center gap-4 max-w-xs mx-auto">
          <span className="h-px flex-1 bg-cream-200" />
          <span className="font-mono text-xs font-medium uppercase tracking-[0.15em] text-forest-600">
            Welcome Congregation
          </span>
          <span className="h-px flex-1 bg-cream-200" />
        </div>

        <h1 className="font-serif text-5xl md:text-7xl font-normal leading-[1.1] tracking-tight mb-8 max-w-4xl mx-auto text-forest-800">
          Gracefully managing our congregation.
        </h1>
        
        <p className="font-sans text-lg md:text-xl text-gray-500 leading-relaxed max-w-2xl mx-auto mb-10">
          A digital member registry designed with classical restraint, built for modern church administration. Timeless. Refined. Trusted.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
          <Link href={portalUrl} className="btn-primary w-full sm:w-auto px-8 py-3.5 text-base shadow-sm">
            {buttonText} <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
          {!isLoggedIn && (
            <Link href="/register" className="btn-secondary w-full sm:w-auto px-8 py-3.5 text-base">
              Create Account
            </Link>
          )}
        </div>
      </section>

      {/* Stats Divider Rule */}
      <div className="max-w-5xl mx-auto px-6 w-full">
        <div className="border-t border-cream-200" />
      </div>

      {/* Stats Section */}
      <section className="py-16 max-w-5xl mx-auto px-6 w-full relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-0 divide-y md:divide-y-0 md:divide-x divide-cream-200">
          <div className="text-center md:pb-0 pb-6">
            <span className="font-serif text-5xl md:text-6xl font-normal text-forest-600 block mb-2">1,250+</span>
            <span className="font-mono text-xs uppercase tracking-widest text-gray-400">Active Members</span>
          </div>
          <div className="text-center md:py-0 py-6">
            <span className="font-serif text-5xl md:text-6xl font-normal text-forest-600 block mb-2">1894</span>
            <span className="font-mono text-xs uppercase tracking-widest text-gray-400">Year Founded</span>
          </div>
          <div className="text-center md:pt-0 pt-6">
            <span className="font-serif text-5xl md:text-6xl font-normal text-forest-600 block mb-2">100%</span>
            <span className="font-mono text-xs uppercase tracking-widest text-gray-400">Secure Records</span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white border-y border-cream-200 relative z-10">
        <div className="max-w-5xl mx-auto px-6">
          <div className="mb-16 flex items-center gap-4">
            <span className="h-px flex-1 bg-cream-200" />
            <span className="font-mono text-xs font-medium uppercase tracking-[0.15em] text-forest-600">
              Registry Offerings
            </span>
            <span className="h-px flex-1 bg-cream-200" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="card card-hoverable border-t-2 border-t-forest-600 p-8 flex flex-col gap-4">
              <div className="w-10 h-10 border border-cream-200 bg-cream-50 rounded-md flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-forest-600" />
              </div>
              <h3 className="font-serif text-xl font-normal text-forest-800">Congregational Records</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Maintain accurate records of household heads and family members. Keep details like age, phone, and address updated seamlessly.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="card card-hoverable border-t-2 border-t-forest-600 p-8 flex flex-col gap-4">
              <div className="w-10 h-10 border border-cream-200 bg-cream-50 rounded-md flex items-center justify-center">
                <Heart className="w-5 h-5 text-forest-600" />
              </div>
              <h3 className="font-serif text-xl font-normal text-forest-800">Dues & Contributions</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Transparently view and track church dues, funds, and contribution logs. Receive real-time payment status details.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="card card-hoverable border-t-2 border-t-forest-600 p-8 flex flex-col gap-4">
              <div className="w-10 h-10 border border-cream-200 bg-cream-50 rounded-md flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-forest-600" />
              </div>
              <h3 className="font-serif text-xl font-normal text-forest-800">Secured Architecture</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Protected by industry-standard Row Level Security (RLS) policies. Only authorized administrators and account owners can view data.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Asymmetric Benefits Section */}
      <section className="py-24 max-w-5xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
          <div className="md:col-span-7 space-y-6">
            <h2 className="font-serif text-3xl md:text-4xl font-normal tracking-tight leading-tight text-forest-800">
              Honoring heritage through digital precision.
            </h2>
            <p className="text-gray-500 leading-relaxed text-base">
              For centuries, the church registry has been a vital historical thread binding congregations. We preserve that administrative reverence in a digital platform that makes management elegant and simple.
            </p>
            <div className="border-l border-forest-600 pl-4 py-1">
              <p className="text-sm font-serif italic text-gray-600 leading-relaxed">
                "Our aim is classical simplicity, keeping the church administration secure and centered around family connections."
              </p>
            </div>
          </div>

          <div className="md:col-span-5">
            {/* Visual representation card */}
            <div className="card shadow-md relative overflow-hidden border-t-2 border-t-forest-600">
              <div className="flex justify-between items-center mb-6">
                <span className="text-xs font-mono font-medium text-forest-600 tracking-wider">MEMBER STATEMENT</span>
                <span className="badge-paid">Paid</span>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] uppercase font-mono tracking-widest text-gray-400">Member Name</p>
                  <p className="font-serif text-base text-forest-800">Thomas P. Alva</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] uppercase font-mono tracking-widest text-gray-400">Family Size</p>
                    <p className="text-sm text-forest-800 font-medium">4 members</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-mono tracking-widest text-gray-400">Contribution ID</p>
                    <p className="text-sm text-forest-800 font-medium font-mono">#992-E</p>
                  </div>
                </div>
                <div className="pt-4 border-t border-cream-200">
                  <p className="text-xs text-gray-400">Dues reconcile automatically upon verification.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial / Quote Section */}
      <section className="py-20 bg-cream-100 border-t border-cream-200 relative z-10">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <span className="font-serif text-7xl font-semibold text-forest-600 leading-none select-none opacity-25">“</span>
          <blockquote className="font-serif text-2xl md:text-3xl font-light text-forest-800 italic leading-relaxed -mt-4 mb-6">
            A church register is more than a list of names; it is a living testament to community, history, and shared faith.
          </blockquote>
          <cite className="font-mono text-xs uppercase tracking-widest text-gray-400 not-italic">— Administrative Guild</cite>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-white border-t border-cream-200 py-12 relative z-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 border border-forest-600 rounded flex items-center justify-center">
              <ChurchIcon className="w-3 h-3 text-forest-600" />
            </div>
            <span className="font-serif font-medium text-sm text-forest-800">
              Church Member Registry
            </span>
          </div>

          <p className="text-xs text-gray-400">
            &copy; {new Date().getFullYear()} Church Registry. All rights reserved. Designed with classical elegance.
          </p>
        </div>
      </footer>
    </div>
  )
}
