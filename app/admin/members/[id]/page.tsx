import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Navbar from '@/components/ui/Navbar'
import AdminMemberDetail from './MemberDetail'
import type { Member, Due } from '@/types'

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
    <div className="min-h-screen bg-cream-50 relative overflow-hidden pb-12">
      <div className="ambient-glow top-0 right-10" />
      <Navbar role="admin" userName={me.full_name} />
      <AdminMemberDetail member={member} dues={dues ?? []} />
    </div>
  )
}
