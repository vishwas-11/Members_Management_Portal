import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Navbar from '@/components/ui/Navbar'
import AdminMemberDetail from './MemberDetail'
import type { Member, Due } from '@/types'
import { LeftOliveBranch, RightOliveBranch } from '@/components/ui/OliveBranches'

export default async function MemberDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: me } = await supabase.from('members').select('role, full_name').eq('user_id', user.id).single()
  if (me?.role !== 'admin') redirect('/dashboard')

  const { data: member } = await supabase.from('members').select('*').eq('id', id).single() as { data: Member | null }
  if (!member) notFound()

  const { data: dues } = await supabase.from('dues').select('*').eq('member_id', id).order('due_date', { ascending: false }) as { data: Due[] | null }

  return (
    <div className="min-h-screen bg-linen-green relative overflow-hidden pb-12 select-none text-[#faf9f6]">
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

      <Navbar role="admin" userName={me.full_name} />
      <AdminMemberDetail member={member} dues={dues ?? []} />
    </div>
  )
}
