import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Navbar from '@/components/ui/Navbar'
import { User, MapPin, Phone, Hash, Users, IndianRupee, CalendarDays, FileText } from 'lucide-react'
import type { Member, Due } from '@/types'
import MemberDuesClient from './MemberDuesClient'
import { LeftOliveBranch, RightOliveBranch } from '@/components/ui/OliveBranches'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: member } = await supabase
    .from('members')
    .select('*')
    .eq('user_id', user.id)
    .single() as { data: Member | null }

  if (!member) redirect('/register/details')

  const { data: dues } = await supabase
    .from('dues')
    .select('*')
    .eq('member_id', member.id)
    .order('due_date', { ascending: false }) as { data: Due[] | null }

  const pendingDues = dues?.filter(d => !d.is_paid) ?? []
  const paidDues = dues?.filter(d => d.is_paid) ?? []
  const totalPending = pendingDues.reduce((sum, d) => sum + d.amount, 0)

  return (
    <div className="min-h-screen bg-linen-green relative overflow-hidden pb-24 select-none text-[#faf9f6]">
      <div className="paper-overlay" />

      {/* Decorative absolute background elements */}
      <div className="botanical-flank absolute left-[-150px] md:left-[-100px] top-[5%] w-[450px] md:w-[550px] pointer-events-none select-none z-10 opacity-85 drop-shadow-2xl">
        <LeftOliveBranch />
      </div>
      <div className="botanical-flank absolute right-[-150px] md:right-[-100px] top-[15%] w-[480px] md:w-[580px] pointer-events-none select-none z-10 opacity-85 drop-shadow-2xl">
        <RightOliveBranch />
      </div>

      <Navbar role="member" userName={member.full_name} />

      <div className="max-w-4xl mx-auto px-6 pt-32 pb-12 space-y-10 relative z-10">
        <div className="border-b border-[#faf9f6]/20 pb-6 flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-[#ebd2a3] to-[#be9d62] flex items-center justify-center text-[#3b2f23] border-2 border-[#fcfbf9] shadow-md flex-shrink-0">
            {member.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={member.avatar_url} alt="Profile Picture" className="w-full h-full object-cover" />
            ) : (
              <span className="font-serif text-xl font-bold tracking-wide">
                {member.full_name
                  .split(' ')
                  .map(n => n[0])
                  .slice(0, 2)
                  .join('')
                  .toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <h1 className="text-4xl sm:text-5xl font-serif font-medium tracking-tight bg-gradient-to-br from-[#fcfbf9] via-[#e8d5b5] to-[#c5b799] bg-clip-text text-transparent drop-shadow-[0_2px_4px_rgba(13,33,25,0.8)]">
              Welcome, {member.full_name.split(' ')[0]}
            </h1>
            <p className="text-sm text-[#faf9f6]/70 mt-2 font-sans font-medium drop-shadow-sm">Your membership details, family connection, and contribution dues statement.</p>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="doppelrand-outer shadow-lg text-center flex flex-col justify-between">
            <div className="doppelrand-inner p-6 relative">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#ebd2a3] via-[#be9d62] to-[#76592a] z-10" />
              <span className="font-serif text-5xl font-light text-[#3b2f23]">{(member.family_members ?? []).length + 1}</span>
              <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#3b2f23]/50 mt-2 block">Family Members</span>
            </div>
          </div>
          <div className="doppelrand-outer shadow-lg text-center flex flex-col justify-between">
            <div className="doppelrand-inner p-6 relative">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#ef4444] via-[#dc2626] to-[#991b1b] z-10" />
              <span className="font-serif text-5xl font-light text-red-700">₹{totalPending.toLocaleString('en-IN')}</span>
              <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#3b2f23]/50 mt-2 block">Dues Pending</span>
            </div>
          </div>
          <div className="doppelrand-outer shadow-lg text-center flex flex-col justify-between">
            <div className="doppelrand-inner p-6 relative">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#4ade80] via-[#16a34a] to-[#14532d] z-10" />
              <span className="font-serif text-5xl font-light text-[#3b2f23]">{paidDues.length}</span>
              <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#3b2f23]/50 mt-2 block">Payments Made</span>
            </div>
          </div>
        </div>

        {/* Member details */}
        <div>
          <div className="mb-6 flex items-center gap-4">
            <span className="h-px bg-[#faf9f6]/20 flex-1" />
            <span className="font-mono text-[11px] font-bold uppercase tracking-[0.15em] text-[#faf9f6]/80 flex items-center gap-2">
              <User className="w-3.5 h-3.5" /> Personal Details
            </span>
            <span className="h-px bg-[#faf9f6]/20 flex-1" />
          </div>
          <div className="doppelrand-outer shadow-2xl relative z-20">
            <div className="doppelrand-inner p-8">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#ebd2a3] via-[#be9d62] to-[#76592a] z-10" />
              <div className="grid sm:grid-cols-2 gap-6 text-sm">
              <DetailRow icon={<User className="w-4 h-4 text-[#3b2f23]/60" />} label="Full Name" value={member.full_name} />
              <DetailRow icon={<CalendarDays className="w-4 h-4 text-[#3b2f23]/60" />} label="Age" value={`${member.age} years`} />
              <DetailRow icon={<Phone className="w-4 h-4 text-[#3b2f23]/60" />} label="Phone" value={member.phone} />
              <DetailRow icon={<Hash className="w-4 h-4 text-[#3b2f23]/60" />} label="Aadhaar" value={`XXXX XXXX ${member.aadhaar_number.slice(-4)}`} />
              <DetailRow icon={<CalendarDays className="w-4 h-4 text-[#3b2f23]/60" />} label="Date of Birth" value={member.dob ? new Date(member.dob).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'} />
              <DetailRow icon={<User className="w-4 h-4 text-[#3b2f23]/60" />} label="Marital Status" value={member.marital_status || 'N/A'} />
              
              {member.certificate_url && (
                <div className="sm:col-span-2 pt-2 border-t border-[#dfd8cb]/50 mt-2">
                  <div className="flex items-start gap-3">
                    <span className="mt-1 flex-shrink-0"><FileText className="w-4 h-4 text-[#3b2f23]/60" /></span>
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-widest text-[#3b2f23]/50 mb-0.5 font-bold">Certificate Document</p>
                      <a href={member.certificate_url} target="_blank" rel="noopener noreferrer" className="text-[#3b2f23] hover:text-[#4a3820] hover:underline underline-offset-4 text-sm font-semibold flex items-center gap-1 transition-colors">
                        View Certificate
                      </a>
                    </div>
                  </div>
                </div>
              )}

              <div className="sm:col-span-2 border-t border-[#dfd8cb]/50 pt-4 mt-2">
                <DetailRow icon={<MapPin className="w-4 h-4 text-[#3b2f23]/60" />} label="Address" value={member.address} />
              </div>
            </div>
          </div>
        </div>
      </div>

        {/* Family members */}
        {member.family_members && member.family_members.length > 0 && (
          <div>
            <div className="mb-6 flex items-center gap-4">
              <span className="h-px bg-[#faf9f6]/20 flex-1" />
              <span className="font-mono text-[11px] font-bold uppercase tracking-[0.15em] text-[#faf9f6]/80 flex items-center gap-2">
                <Users className="w-3.5 h-3.5" /> Family Connections
              </span>
              <span className="h-px bg-[#faf9f6]/20 flex-1" />
            </div>
            <div className="doppelrand-outer shadow-2xl relative z-20">
              <div className="doppelrand-inner p-8 space-y-4">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#ebd2a3] via-[#be9d62] to-[#76592a] z-10" />
                <div className="grid sm:grid-cols-2 gap-6">
                {member.family_members.map((fm, i) => (
                  <div key={i} className="flex items-start gap-4 p-5 bg-white/60 border border-[#dfd8cb] rounded-lg shadow-sm">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-[#e5e0d5] border border-[#dfd8cb] flex items-center justify-center text-[#3b2f23] shrink-0 shadow-inner">
                      {fm.avatar_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={fm.avatar_url} alt={fm.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="font-serif text-sm font-bold">
                          {fm.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 space-y-2 text-xs">
                      <div>
                        <p className="text-sm font-bold text-[#3b2f23]">{fm.name}</p>
                        <p className="text-[9px] font-mono uppercase tracking-wider text-[#3b2f23]/60 mt-0.5 font-bold">{fm.relationship}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[#3b2f23]/80 font-sans font-medium">
                        <p><strong className="text-[#3b2f23]/60 font-mono text-[9px] uppercase tracking-wider">Age:</strong> {fm.age} yrs</p>
                        <p><strong className="text-[#3b2f23]/60 font-mono text-[9px] uppercase tracking-wider">Status:</strong> {fm.marital_status || 'N/A'}</p>
                        <p className="col-span-2"><strong className="text-[#3b2f23]/60 font-mono text-[9px] uppercase tracking-wider">DOB:</strong> {fm.dob ? new Date(fm.dob).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}</p>
                        {fm.aadhaar_number && <p className="col-span-2"><strong className="text-[#3b2f23]/60 font-mono text-[9px] uppercase tracking-wider">Aadhaar:</strong> XXXX XXXX {fm.aadhaar_number.slice(-4)}</p>}
                      </div>
                      {fm.certificate_url && (
                        <a href={fm.certificate_url} target="_blank" rel="noopener noreferrer" className="text-[#3b2f23] hover:text-[#4a3820] hover:underline underline-offset-4 font-bold flex items-center gap-1 mt-1 text-[11px] transition-colors">
                          <FileText className="w-3.5 h-3.5" /> View Certificate
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        )}

        {/* Dues */}
        <div>
          <div className="mb-6 flex items-center gap-4">
            <span className="h-px bg-[#faf9f6]/20 flex-1" />
            <span className="font-mono text-[11px] font-bold uppercase tracking-[0.15em] text-[#faf9f6]/80 flex items-center gap-2">
              <IndianRupee className="w-3.5 h-3.5" /> Dues & Payments Statement
            </span>
            <span className="h-px bg-[#faf9f6]/20 flex-1" />
          </div>
          <MemberDuesClient initialDues={dues || []} userId={user.id} />
        </div>
      </div>
    </div>
  )
}

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-1 flex-shrink-0">{icon}</span>
      <div>
        <p className="font-mono text-[10px] uppercase tracking-widest text-[#3b2f23]/50 mb-0.5 font-bold">{label}</p>
        <p className="text-[#3b2f23] font-semibold text-sm leading-relaxed">{value}</p>
      </div>
    </div>
  )
}

