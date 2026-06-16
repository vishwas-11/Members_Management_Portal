import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Navbar from '@/components/ui/Navbar'
import AdminMembersClient from './MembersClient'
import type { Member } from '@/types'

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
    <div className="min-h-screen bg-linen-cream relative overflow-hidden pb-12 select-none">
      <div className="paper-overlay" />
      <Navbar role="admin" userName={me.full_name} />
      <div className="max-w-6xl mx-auto px-6 py-12 relative z-10">
        <div className="border-b border-[#dfd8cb] pb-6 mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-skeu-heading text-4xl font-normal tracking-tight">Members Directory</h1>
            <p className="text-sm text-[#3b2f23]/60 mt-2 font-sans font-medium">View and manage all registered congregation members and household records.</p>
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
