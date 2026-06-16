import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Navbar from '@/components/ui/Navbar'
import AdminMembersClient from './MembersClient'
import type { Member } from '@/types'
import { LeftOliveBranch, RightOliveBranch } from '@/components/ui/OliveBranches'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: me } = await supabase.from('members').select('*').eq('user_id', user.id).single()
  if (me?.role !== 'admin') redirect('/dashboard')

  const { data: members } = await supabase
    .from('members')
    .select('*')
    .order('full_name', { ascending: true }) as { data: Member[] | null }

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

      <Navbar role="admin" userName={me.full_name} />
      <div className="max-w-6xl mx-auto px-6 pt-32 pb-12 relative z-10">
        <div className="border-b border-[#faf9f6]/20 pb-6 mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-4xl sm:text-5xl font-serif font-medium tracking-tight bg-gradient-to-br from-[#fcfbf9] via-[#e8d5b5] to-[#c5b799] bg-clip-text text-transparent drop-shadow-[0_2px_4px_rgba(13,33,25,0.8)]">Members Directory</h1>
            <p className="text-sm text-[#faf9f6]/70 mt-2 font-sans font-medium drop-shadow-sm">View and manage all registered congregation members and household records.</p>
          </div>
          <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#3b2f23]/60 bg-[#fcfbf9] border border-[#e8e2d5] px-3 py-1.5 rounded-md shadow-sm w-fit">
            {members?.length ?? 0} registered heads of household
          </div>
        </div>
        <AdminMembersClient members={members ?? []} />
      </div>
    </div>
  )
}
