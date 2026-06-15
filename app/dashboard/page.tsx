import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Navbar from '@/components/ui/Navbar'
import { User, MapPin, Phone, Hash, Users, IndianRupee, CalendarDays } from 'lucide-react'
import type { Member, Due } from '@/types'

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
    <div className="min-h-screen bg-cream-50 relative overflow-hidden pb-12">
      <div className="ambient-glow top-0 right-10" />
      <Navbar role="member" userName={member.full_name} />

      <div className="max-w-4xl mx-auto px-6 py-12 space-y-10 relative z-10">
        <div className="border-b border-cream-200 pb-6">
          <h1 className="font-serif text-4xl font-normal text-forest-800 tracking-tight">
            Welcome, {member.full_name.split(' ')[0]}
          </h1>
          <p className="text-sm text-gray-400 mt-2 font-sans">Your membership details, family connection, and contribution dues statement.</p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="card card-gradient-forest text-center flex flex-col justify-between p-6">
            <span className="font-serif text-5xl font-light text-forest-600">{(member.family_members ?? []).length + 1}</span>
            <span className="font-mono text-[10px] uppercase tracking-widest text-gray-400 mt-2">Family Members</span>
          </div>
          <div className="card card-gradient-red text-center flex flex-col justify-between p-6">
            <span className="font-serif text-5xl font-light text-red-600">₹{totalPending.toLocaleString('en-IN')}</span>
            <span className="font-mono text-[10px] uppercase tracking-widest text-gray-400 mt-2">Dues Pending</span>
          </div>
          <div className="card border-t-2 border-t-gray-400 text-center flex flex-col justify-between p-6">
            <span className="font-serif text-5xl font-light text-gray-700">{paidDues.length}</span>
            <span className="font-mono text-[10px] uppercase tracking-widest text-gray-400 mt-2">Payments Made</span>
          </div>
        </div>

        {/* Member details */}
        <div>
          <div className="mb-6 flex items-center gap-4">
            <span className="h-px flex-1 bg-cream-200" />
            <span className="font-mono text-xs font-medium uppercase tracking-[0.15em] text-forest-600 flex items-center gap-2">
              <User className="w-3.5 h-3.5" /> Personal Details
            </span>
            <span className="h-px flex-1 bg-cream-200" />
          </div>
          <div className="card p-8">
            <div className="grid sm:grid-cols-2 gap-6 text-sm">
              <DetailRow icon={<User className="w-4 h-4 text-forest-600" />} label="Full Name" value={member.full_name} />
              <DetailRow icon={<CalendarDays className="w-4 h-4 text-forest-600" />} label="Age" value={`${member.age} years`} />
              <DetailRow icon={<Phone className="w-4 h-4 text-forest-600" />} label="Phone" value={member.phone} />
              <DetailRow icon={<Hash className="w-4 h-4 text-forest-600" />} label="Aadhaar" value={`XXXX XXXX ${member.aadhaar_number.slice(-4)}`} />
              <div className="sm:col-span-2 border-t border-cream-100 pt-4 mt-2">
                <DetailRow icon={<MapPin className="w-4 h-4 text-forest-600" />} label="Address" value={member.address} />
              </div>
            </div>
          </div>
        </div>

        {/* Family members */}
        {member.family_members && member.family_members.length > 0 && (
          <div>
            <div className="mb-6 flex items-center gap-4">
              <span className="h-px flex-1 bg-cream-200" />
              <span className="font-mono text-xs font-medium uppercase tracking-[0.15em] text-forest-600 flex items-center gap-2">
                <Users className="w-3.5 h-3.5" /> Family Connections
              </span>
              <span className="h-px flex-1 bg-cream-200" />
            </div>
            <div className="card p-8 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                {member.family_members.map((fm, i) => (
                  <div key={i} className="flex items-center justify-between py-3.5 px-4 bg-cream-100/40 border border-cream-200 rounded-md">
                    <div>
                      <p className="text-sm font-medium text-forest-800">{fm.name}</p>
                      <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400 mt-0.5">{fm.relationship}</p>
                    </div>
                    <span className="text-xs font-mono text-gray-500 bg-white border border-cream-200 px-2 py-0.5 rounded">{fm.age} yrs</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Dues */}
        <div>
          <div className="mb-6 flex items-center gap-4">
            <span className="h-px flex-1 bg-cream-200" />
            <span className="font-mono text-xs font-medium uppercase tracking-[0.15em] text-forest-600 flex items-center gap-2">
              <IndianRupee className="w-3.5 h-3.5" /> Dues & Payments Statement
            </span>
            <span className="h-px flex-1 bg-cream-200" />
          </div>
          <div className="card p-8">
            {!dues || dues.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">No contribution history found.</p>
            ) : (
              <div className="divide-y divide-cream-100 space-y-3">
                {dues.map((due, i) => (
                  <div key={due.id} className={`flex items-center justify-between ${i > 0 ? 'pt-4' : ''}`}>
                    <div>
                      <p className="text-sm font-medium text-forest-800">{due.title}</p>
                      <p className="text-[11px] font-mono text-gray-400 mt-0.5">Due date: {new Date(due.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-semibold text-forest-800">₹{due.amount.toLocaleString('en-IN')}</span>
                      <span className={due.is_paid ? 'badge-paid' : 'badge-unpaid'}>
                        {due.is_paid ? 'Paid' : 'Pending'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
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
        <p className="label !mb-0.5">{label}</p>
        <p className="text-forest-800 font-medium text-sm leading-relaxed">{value}</p>
      </div>
    </div>
  )
}
