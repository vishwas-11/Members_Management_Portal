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
        <div className="card card-gradient-forest text-center flex flex-col justify-between p-6">
          <div className="flex items-center justify-center gap-1.5 mb-1 text-forest-600">
            <Users className="w-4 h-4" />
            <span className="font-serif text-5xl font-light">{members.length}</span>
          </div>
          <span className="font-mono text-[10px] uppercase tracking-widest text-gray-400 mt-2">Family Heads</span>
        </div>
        <div className="card card-gradient-purple text-center flex flex-col justify-between p-6">
          <div className="flex items-center justify-center gap-1.5 mb-1 text-purple-600">
            <UserCheck className="w-4 h-4" />
            <span className="font-serif text-5xl font-light">{totalMembers}</span>
          </div>
          <span className="font-mono text-[10px] uppercase tracking-widest text-gray-400 mt-2">Total Individuals</span>
        </div>
        <div className="card card-gradient-amber text-center flex flex-col justify-between p-6">
          <div className="flex items-center justify-center gap-1.5 mb-1 text-amber-600">
            <Shield className="w-4 h-4" />
            <span className="font-serif text-5xl font-light">{adminCount}</span>
          </div>
          <span className="font-mono text-[10px] uppercase tracking-widest text-gray-400 mt-2">Admin Accounts</span>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, phone or Aadhaar..."
          className="input-field pl-10"
        />
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-forest-800">
            <thead>
              <tr className="bg-cream-100 border-b border-cream-200">
                <th className="text-left px-5 py-4 font-mono text-[10px] uppercase tracking-wider text-gray-400">Name</th>
                <th className="text-left px-5 py-4 font-mono text-[10px] uppercase tracking-wider text-gray-400 hidden sm:table-cell">Phone</th>
                <th className="text-left px-5 py-4 font-mono text-[10px] uppercase tracking-wider text-gray-400 hidden md:table-cell">Family</th>
                <th className="text-left px-5 py-4 font-mono text-[10px] uppercase tracking-wider text-gray-400">Role</th>
                <th className="text-left px-5 py-4 font-mono text-[10px] uppercase tracking-wider text-gray-400">Joined</th>
                <th className="text-right px-5 py-4 font-mono text-[10px] uppercase tracking-wider text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-100 bg-white">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-gray-400 font-sans">
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
                  <tr key={member.id} className="hover:bg-cream-100/30 transition-colors">
                    <td className="px-5 py-4.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full overflow-hidden bg-gradient-to-br from-forest-600 to-forest-800 flex items-center justify-center text-white border border-cream-200 shadow-sm flex-shrink-0">
                          {member.avatar_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={member.avatar_url} alt={member.full_name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="font-serif text-xs font-light tracking-wide">{initials}</span>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-forest-800">{member.full_name}</p>
                          <p className="text-[10px] font-mono text-gray-400 mt-0.5">
                            {member.aadhaar_number.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3')}
                          </p>
                        </div>
                      </div>
                    </td>
                  <td className="px-5 py-4.5 text-gray-600 hidden sm:table-cell font-sans">{member.phone}</td>
                  <td className="px-5 py-4.5 text-gray-600 hidden md:table-cell font-sans">
                    {(member.family_members?.length ?? 0) + 1} person{(member.family_members?.length ?? 0) + 1 !== 1 ? 's' : ''}
                  </td>
                  <td className="px-5 py-4.5">
                    <span className={member.role === 'admin' ? 'badge-admin' : 'badge-member'}>
                      {member.role}
                    </span>
                  </td>
                  <td className="px-5 py-4.5 text-gray-400 text-xs font-mono">
                    {new Date(member.created_at).toLocaleDateString('en-IN')}
                  </td>
                  <td className="px-5 py-4.5">
                    <div className="flex items-center justify-end gap-2.5">
                      <Link href={`/admin/members/${member.id}`}
                        className="p-2 border border-cream-200 hover:border-forest-600 hover:text-forest-600 rounded-md transition-all text-gray-400 bg-white hover:bg-cream-50" title="View / Edit Statement">
                        <Eye className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(member.id, member.full_name)}
                        disabled={deleting === member.id}
                        className="p-2 border border-cream-200 hover:border-red-600 hover:text-red-600 rounded-md transition-all text-gray-400 bg-white hover:bg-red-50 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed" title="Delete Account">
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
