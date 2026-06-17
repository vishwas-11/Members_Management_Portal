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
  const [viewMode, setViewMode] = useState<'heads' | 'all'>('heads')
  const [deleting, setDeleting] = useState<string | null>(null)
  const supabase = createClient()
  const router = useRouter()

  type TableRow = {
    id: string;
    parentId: string;
    isHead: boolean;
    full_name: string;
    avatar_url?: string | null;
    member_code: string;
    aadhaar_number: string;
    phone: string;
    family_count: number;
    role: string;
    created_at: string;
    relationship?: string;
  }

  const allRows: TableRow[] = members.flatMap(m => {
    const headRow: TableRow = {
      id: m.id,
      parentId: m.id,
      isHead: true,
      full_name: m.full_name,
      avatar_url: m.avatar_url,
      member_code: m.member_code || '',
      aadhaar_number: m.aadhaar_number || '',
      phone: m.phone || '',
      family_count: (m.family_members?.length ?? 0) + 1,
      role: m.role,
      created_at: m.created_at,
    }

    if (viewMode === 'heads') return [headRow]

    const dependentRows: TableRow[] = (m.family_members || []).map((fm, idx) => ({
      id: fm.id || `${m.id}-fm-${idx}`,
      parentId: m.id,
      isHead: false,
      full_name: fm.name,
      avatar_url: fm.avatar_url,
      member_code: '',
      aadhaar_number: fm.aadhaar_number || 'N/A',
      phone: fm.phone || '-',
      family_count: 0,
      role: fm.relationship?.toUpperCase() || 'FAMILY',
      created_at: m.created_at,
      relationship: fm.relationship,
    }))

    return [headRow, ...dependentRows]
  })

  const filtered = allRows.filter(r =>
    r.full_name.toLowerCase().includes(search.toLowerCase()) ||
    r.phone.includes(search) ||
    r.aadhaar_number.includes(search) ||
    r.member_code.toLowerCase().includes(search.toLowerCase()) ||
    (r.relationship && r.relationship.toLowerCase().includes(search.toLowerCase()))
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
        <div className="doppelrand-outer shadow-lg text-center flex flex-col justify-between">
          <div className="doppelrand-inner p-6 relative">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#ebd2a3] via-[#be9d62] to-[#76592a] z-10" />
            <div className="flex items-center justify-center gap-1.5 mb-1 text-[#3b2f23]">
              <Users className="w-5 h-5" />
              <span className="font-serif text-5xl font-light">{members.length}</span>
            </div>
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#3b2f23]/50 mt-2">Family Heads</span>
          </div>
        </div>
        <div className="doppelrand-outer shadow-lg text-center flex flex-col justify-between">
          <div className="doppelrand-inner p-6 relative">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#ebd2a3] via-[#be9d62] to-[#76592a] z-10" />
            <div className="flex items-center justify-center gap-1.5 mb-1 text-[#3b2f23]">
              <UserCheck className="w-5 h-5" />
              <span className="font-serif text-5xl font-light">{totalMembers}</span>
            </div>
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#3b2f23]/50 mt-2">Total Individuals</span>
          </div>
        </div>
        <div className="doppelrand-outer shadow-lg text-center flex flex-col justify-between">
          <div className="doppelrand-inner p-6 relative">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#ebd2a3] via-[#be9d62] to-[#76592a] z-10" />
            <div className="flex items-center justify-center gap-1.5 mb-1 text-[#3b2f23]">
              <Shield className="w-5 h-5" />
              <span className="font-serif text-5xl font-light">{adminCount}</span>
            </div>
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#3b2f23]/50 mt-2">Admin Accounts</span>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="doppelrand-outer shadow-sm flex-1">
          <div className="doppelrand-inner relative flex items-center bg-white/40">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#ebd2a3] via-[#be9d62] to-[#76592a] z-10 opacity-50" />
            <Search className="absolute left-4 w-4 h-4 text-[#3b2f23]/40 z-20" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, phone or Aadhaar..."
              className="w-full bg-transparent border-none pl-11 pr-4 py-3 text-sm font-medium text-[#3b2f23] focus:outline-none placeholder:text-[#3b2f23]/40 relative z-20 h-12"
            />
          </div>
        </div>
        
        <div className="min-w-[240px] flex items-center">
          <div className="flex w-full relative z-20 bg-[#f5f3ee]/80 border border-[#dfd8cb] rounded-full p-1.5 shadow-sm backdrop-blur-sm">
            {/* Sliding background pill */}
            <div
              className={`absolute top-1.5 bottom-1.5 w-[calc(50%-0.375rem)] bg-white shadow-md rounded-full transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${viewMode === 'all' ? 'translate-x-full' : 'translate-x-0'}`}
            />

            <button
              onClick={() => setViewMode('heads')}
              className={`flex-1 relative z-10 py-2.5 px-4 text-[10px] sm:text-xs font-mono font-bold tracking-wider uppercase rounded-full transition-colors duration-500 ${viewMode === 'heads' ? 'text-[#3b2f23]' : 'text-[#3b2f23]/60 hover:text-[#3b2f23]'}`}
            >
              Family Heads
            </button>
            <button
              onClick={() => setViewMode('all')}
              className={`flex-1 relative z-10 py-2.5 px-4 text-[10px] sm:text-xs font-mono font-bold tracking-wider uppercase rounded-full transition-colors duration-500 ${viewMode === 'all' ? 'text-[#3b2f23]' : 'text-[#3b2f23]/60 hover:text-[#3b2f23]'}`}
            >
              All Members
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="doppelrand-outer shadow-2xl relative z-20">
        <div className="doppelrand-inner p-0 overflow-hidden relative">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#ebd2a3] via-[#be9d62] to-[#76592a] z-10" />
          <div className="overflow-x-auto pt-1.5">
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
            <tbody key={viewMode} className="divide-y divide-[#dfd8cb] bg-[#fcfbf9]">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-[#3b2f23]/50 font-sans font-medium">
                    No congregation members match the criteria.
                  </td>
                </tr>
              )}
              {filtered.map((member, index) => {
                const initials = member.full_name
                  .split(' ')
                  .map(n => n[0])
                  .slice(0, 2)
                  .join('')
                  .toUpperCase() || 'U';

                return (
                  <tr 
                    key={member.id} 
                    className={`hover:bg-[#f5f3ee] transition-colors animate-row-fade ${!member.isHead ? 'bg-[#fcfbf9]/50' : ''}`}
                    style={{ animationDelay: `${Math.min(index * 0.05, 1)}s` }}
                  >
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
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-[#3b2f23]">
                              {!member.isHead && <span className="text-[#3b2f23]/40 mr-1">↳</span>}
                              {member.full_name}
                            </p>
                            {member.member_code && (
                              <span className="text-[9px] font-mono font-bold bg-[#e8e2d5]/60 border border-[#dfd8cb] px-1.5 py-0.5 rounded uppercase tracking-wider text-[#3b2f23]/70">
                                {member.member_code}
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] font-mono text-[#3b2f23]/50 mt-0.5 font-bold">
                            {member.aadhaar_number.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3')}
                          </p>
                        </div>
                      </div>
                    </td>
                  <td className="px-5 py-4.5 text-[#3b2f23]/80 hidden sm:table-cell font-sans font-medium">{member.phone}</td>
                  <td className="px-5 py-4.5 text-[#3b2f23]/80 hidden md:table-cell font-sans font-medium">
                    {member.isHead ? `${member.family_count} person${member.family_count !== 1 ? 's' : ''}` : '-'}
                  </td>
                  <td className="px-5 py-4.5">
                    {member.isHead ? (
                      <span className={member.role === 'admin' ? 'badge-admin' : 'badge-member'}>
                        {member.role}
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono font-bold text-[#3b2f23]/60 bg-[#e8e2d5]/50 px-2 py-1 rounded uppercase tracking-wider">
                        {member.role}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4.5 text-[#3b2f23]/60 text-xs font-mono font-medium">
                    {member.isHead ? new Date(member.created_at).toLocaleDateString('en-IN') : '-'}
                  </td>
                  <td className="px-5 py-4.5">
                    {member.isHead ? (
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
                    ) : (
                      <div className="flex items-center justify-end gap-2.5">
                        <Link href={`/admin/members/${member.parentId}`}
                          className="p-2 border border-[#dfd8cb] hover:border-[#4a3820] hover:text-[#3b2f23] rounded-md transition-all text-[#3b2f23]/50 bg-white hover:bg-[#e8e2d5]/50 shadow-sm" title="View Head's Statement">
                          <Eye className="w-4 h-4" />
                        </Link>
                      </div>
                    )}
                  </td>
                </tr>
              )})}
            </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
