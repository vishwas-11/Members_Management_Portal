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
    <div className="min-h-screen bg-cream-50 relative overflow-hidden pb-12">
      <div className="ambient-glow top-0 right-10" />
      <Navbar role="admin" userName={me.full_name} />
      <div className="max-w-6xl mx-auto px-6 py-12 relative z-10">
        <div className="border-b border-cream-200 pb-6 mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="font-serif text-4xl font-normal text-forest-800 tracking-tight">Members Directory</h1>
            <p className="text-sm text-gray-400 mt-2 font-sans">View and manage all registered congregation members and household records.</p>
          </div>
          <div className="text-xs font-mono uppercase tracking-widest text-gray-400 bg-white border border-cream-200 px-3 py-1.5 rounded-md shadow-sm w-fit">
            {members?.length ?? 0} registered heads of household
          </div>
        </div>
        <AdminMembersClient members={members ?? []} />
      </div>
    </div>
  )
}
