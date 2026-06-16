'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Search, Eye, Trash2, Users, UserCheck, Shield } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { Member } from '@/types'

export default function AdminMembersClient({ members: initial }: { members: Member[] }) {
  const [members, setMembers] = useState(initial)
  const [search, setSearch] = useState('')
  const [deleting, setDeleting] = useState<string | null>(null)
  const supabase = createClient()
  const router = useRouter()

  const filtered = members.filter(m =>
    m.full_name.toLowerCase().includes(search.toLowerCase()) ||
    m.phone.includes(search) ||
    m.aadhaar_number.includes(search)
  )

  const totalMembers = members.reduce((sum, m) => sum + 1 + (m.family_members?.length ?? 0), 0)
  const adminCount = members.filter(m => m.role === 'admin').length

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) return
    setDeleting(id)
    await supabase.from('dues').delete().eq('member_id', id)
    const { error } = await supabase.from('members').delete().eq('id', id)
    if (!error) {
      setMembers(prev => prev.filter(m => m.id !== id))
    }
    setDeleting(null)
  }

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#fcfbf9] border border-[#e8e2d5] rounded-xl shadow-md p-6 relative overflow-hidden text-center flex flex-col justify-between">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#ebd2a3] via-[#be9d62] to-[#76592a]" />
          <div className="flex items-center justify-center gap-1.5 mb-1 text-[#3b2f23]">
            <Users className="w-5 h-5" />
            <span className="font-serif text-5xl font-light">{members.length}</span>
          </div>
          <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#3b2f23]/50 mt-2">Family Heads</span>
        </div>
        <div className="bg-[#fcfbf9] border border-[#e8e2d5] rounded-xl shadow-md p-6 relative overflow-hidden text-center flex flex-col justify-between">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#ebd2a3] via-[#be9d62] to-[#76592a]" />
          <div className="flex items-center justify-center gap-1.5 mb-1 text-[#3b2f23]">
            <UserCheck className="w-5 h-5" />
            <span className="font-serif text-5xl font-light">{totalMembers}</span>
          </div>
          <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#3b2f23]/50 mt-2">Total Individuals</span>
        </div>
        <div className="bg-[#fcfbf9] border border-[#e8e2d5] rounded-xl shadow-md p-6 relative overflow-hidden text-center flex flex-col justify-between">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#ebd2a3] via-[#be9d62] to-[#76592a]" />
          <div className="flex items-center justify-center gap-1.5 mb-1 text-[#3b2f23]">
            <Shield className="w-5 h-5" />
            <span className="font-serif text-5xl font-light">{adminCount}</span>
          </div>
          <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#3b2f23]/50 mt-2">Admin Accounts</span>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#3b2f23]/40" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, phone or Aadhaar..."
          className="input-field pl-10 !border-[#dfd8cb] !bg-white/75 focus:!ring-[#3b2f23]/25 focus:!border-[#3b2f23]/50 text-[#3b2f23]"
        />
      </div>

      {/* Table */}
      <div className="bg-[#fcfbf9] border border-[#e8e2d5] rounded-xl shadow-md p-0 relative overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-[#3b2f23]">
            <thead>
              <tr className="bg-[#e8e2d5]/50 border-b border-[#dfd8cb]">
                <th className="text-left px-5 py-4 font-mono text-[10px] font-bold uppercase tracking-wider text-[#3b2f23]/60">Name</th>
                <th className="text-left px-5 py-4 font-mono text-[10px] font-bold uppercase tracking-wider text-[#3b2f23]/60 hidden sm:table-cell">Phone</th>
                <th className="text-left px-5 py-4 font-mono text-[10px] font-bold uppercase tracking-wider text-[#3b2f23]/60 hidden md:table-cell">Family</th>
                <th className="text-left px-5 py-4 font-mono text-[10px] font-bold uppercase tracking-wider text-[#3b2f23]/60">Role</th>
                <th className="text-left px-5 py-4 font-mono text-[10px] font-bold uppercase tracking-wider text-[#3b2f23]/60">Joined</th>
                <th className="text-right px-5 py-4 font-mono text-[10px] font-bold uppercase tracking-wider text-[#3b2f23]/60">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#dfd8cb] bg-[#fcfbf9]">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-[#3b2f23]/50 font-sans font-medium">
                    No congregation members match the criteria.
                  </td>
                </tr>
              )}
              {filtered.map(member => {
                const initials = member.full_name
                  .split(' ')
                  .map(n => n[0])
                  .slice(0, 2)
                  .join('')
                  .toUpperCase();

                return (
                  <tr key={member.id} className="hover:bg-[#f5f3ee] transition-colors">
                    <td className="px-5 py-4.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full overflow-hidden bg-[#e5e0d5] flex items-center justify-center text-[#3b2f23] border border-[#dfd8cb] shadow-inner flex-shrink-0 font-serif font-bold">
                          {member.avatar_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={member.avatar_url} alt={member.full_name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xs">{initials}</span>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-[#3b2f23]">{member.full_name}</p>
                          <p className="text-[10px] font-mono text-[#3b2f23]/50 mt-0.5 font-bold">
                            {member.aadhaar_number.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3')}
                          </p>
                        </div>
                      </div>
                    </td>
                  <td className="px-5 py-4.5 text-[#3b2f23]/80 hidden sm:table-cell font-sans font-medium">{member.phone}</td>
                  <td className="px-5 py-4.5 text-[#3b2f23]/80 hidden md:table-cell font-sans font-medium">
                    {(member.family_members?.length ?? 0) + 1} person{(member.family_members?.length ?? 0) + 1 !== 1 ? 's' : ''}
                  </td>
                  <td className="px-5 py-4.5">
                    <span className={member.role === 'admin' ? 'badge-admin' : 'badge-member'}>
                      {member.role}
                    </span>
                  </td>
                  <td className="px-5 py-4.5 text-[#3b2f23]/60 text-xs font-mono font-medium">
                    {new Date(member.created_at).toLocaleDateString('en-IN')}
                  </td>
                  <td className="px-5 py-4.5">
                    <div className="flex items-center justify-end gap-2.5">
                      <Link href={`/admin/members/${member.id}`}
                        className="p-2 border border-[#dfd8cb] hover:border-[#4a3820] hover:text-[#3b2f23] rounded-md transition-all text-[#3b2f23]/50 bg-white hover:bg-[#e8e2d5]/50 shadow-sm" title="View / Edit Statement">
                        <Eye className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(member.id, member.full_name)}
                        disabled={deleting === member.id}
                        className="p-2 border border-[#dfd8cb] hover:border-red-600 hover:text-red-600 rounded-md transition-all text-[#3b2f23]/50 bg-white hover:bg-red-50 shadow-sm cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed" title="Delete Account">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
