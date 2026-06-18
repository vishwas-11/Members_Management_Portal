'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Search, Eye, Trash2, Users, UserCheck, Shield, Loader2, X, AlertCircle, GitMerge } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { Member } from '@/types'

export default function AdminMembersClient({ members: initial }: { members: Member[] }) {
  const [members, setMembers] = useState(initial)
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState<'heads' | 'all'>('heads')
  const [deleting, setDeleting] = useState<string | null>(null)
  const [showMergeModal, setShowMergeModal] = useState(false)
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
      member_code: fm.member_code || '',
      aadhaar_number: fm.aadhaar_number || 'N/A',
      phone: fm.phone || '-',
      family_count: 0,
      role: 'member',
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
    <>
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

        <button
          onClick={() => setShowMergeModal(true)}
          className="btn-premium-outline px-4 py-2.5 text-[10px] sm:text-xs flex items-center gap-2 font-bold shrink-0 cursor-pointer"
          id="merge-duplicates-btn"
        >
          <GitMerge className="w-4 h-4" />
          Merge Duplicates
        </button>
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

      {/* Merge Duplicates Modal */}
      {showMergeModal && (
        <MergeModal
          members={members}
          onClose={() => setShowMergeModal(false)}
          onMerged={(primaryId, duplicateId, isFamily, parentId) => {
            setMembers(prev => {
              if (isFamily && parentId) {
                const parentObj = prev.find(p => p.id === parentId)
                const fmObj = parentObj?.family_members?.find(fm => fm.member_code === duplicateId || fm.id === duplicateId)
                const targetMemberCode = fmObj?.member_code || duplicateId

                return prev.map(m => {
                  if (m.id === parentId) {
                    const updatedFM = (m.family_members || []).map(fm => {
                      if (fm.member_code === duplicateId || fm.id === duplicateId) {
                        return { ...fm, claimed: true, claimed_member_id: primaryId }
                      }
                      return fm
                    })
                    return { ...m, family_members: updatedFM }
                  }
                  if (m.id === primaryId) {
                    return { ...m, member_code: targetMemberCode }
                  }
                  return m
                })
              } else {
                const duplicateMember = prev.find(m => m.id === duplicateId)
                const dupFamily = duplicateMember?.family_members || []
                return prev
                  .filter(m => m.id !== duplicateId)
                  .map(m => {
                    if (m.id === primaryId) {
                      return {
                        ...m,
                        family_members: [...(m.family_members || []), ...dupFamily]
                      }
                    }
                    return m
                  })
              }
            })
            setShowMergeModal(false)
          }}
        />
      )}
    </>
  )
}

/* ═══════════════════════════════════════════════════════════════
   Merge Duplicates Modal
   Allows admins to select two member profiles and merge them.
   Supports merging family heads and JSONB family members.
   ═══════════════════════════════════════════════════════════════ */
interface MergeRow {
  id: string
  parentId: string
  isHead: boolean
  full_name: string
  avatar_url?: string | null
  member_code: string
  phone: string
  relationship?: string
  parent_name?: string
  aadhaar_number: string
}

function MergeModal({
  members,
  onClose,
  onMerged,
}: {
  members: Member[]
  onClose: () => void
  onMerged: (primaryId: string, duplicateId: string, isFamily: boolean, parentId: string | null) => void
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [primaryId, setPrimaryId] = useState<string | null>(null)
  const [duplicateId, setDuplicateId] = useState<string | null>(null)
  const [merging, setMerging] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Flatten all members into individual rows (heads + JSONB family members)
  const allMergeRows: MergeRow[] = members.flatMap(m => {
    const headRow: MergeRow = {
      id: m.id,
      parentId: m.id,
      isHead: true,
      full_name: m.full_name,
      avatar_url: m.avatar_url,
      member_code: m.member_code || '',
      phone: m.phone || '',
      aadhaar_number: m.aadhaar_number || '',
    }

    const dependentRows: MergeRow[] = (m.family_members || []).map((fm, idx) => ({
      id: fm.member_code || fm.id || `${m.id}-fm-${idx}`,
      parentId: m.id,
      isHead: false,
      full_name: fm.name,
      avatar_url: fm.avatar_url,
      member_code: fm.member_code || '',
      phone: fm.phone || '-',
      relationship: fm.relationship,
      parent_name: m.full_name,
      aadhaar_number: fm.aadhaar_number || '',
    }))

    return [headRow, ...dependentRows]
  })

  const filtered = allMergeRows.filter(r =>
    r.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.member_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.phone.includes(searchQuery) ||
    r.aadhaar_number.includes(searchQuery) ||
    (r.relationship && r.relationship.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (r.parent_name && r.parent_name.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const primary = allMergeRows.find(r => r.id === primaryId)
  const duplicate = allMergeRows.find(r => r.id === duplicateId)

  // Swapping/selection helpers to ensure that registered profiles (Heads) are Primary
  const selectPrimary = (row: MergeRow) => {
    if (duplicateId && row.id === duplicateId) return

    if (!row.isHead && duplicate && duplicate.isHead) {
      // Swap: make the head Primary and the family member Duplicate
      setPrimaryId(duplicateId)
      setDuplicateId(row.id)
      return
    }

    setPrimaryId(row.id)
  }

  const selectDuplicate = (row: MergeRow) => {
    if (primaryId && row.id === primaryId) return

    if (row.isHead && primary && !primary.isHead) {
      // Swap: make the head Primary and the family member Duplicate
      setPrimaryId(row.id)
      setDuplicateId(primaryId)
      return
    }

    setDuplicateId(row.id)
  }

  const handleMerge = async () => {
    if (!primaryId || !duplicateId) return
    setMerging(true)
    setError('')
    setSuccess('')

    const isDuplicateFamily = duplicate ? !duplicate.isHead : false
    const duplicateParentId = duplicate ? duplicate.parentId : null

    try {
      const res = await fetch('/api/admin/merge-members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          primary_id: primaryId,
          duplicate_id: duplicateId,
          is_duplicate_family: isDuplicateFamily,
          duplicate_parent_id: duplicateParentId,
        }),
      })
      const data = await res.json()

      if (!res.ok || data.error) {
        setError(data.error || 'Failed to merge members')
        setMerging(false)
        return
      }

      setSuccess(data.message || 'Members merged successfully!')
      setMerging(false)
      setTimeout(() => onMerged(primaryId, duplicateId, isDuplicateFamily, duplicateParentId), 1500)
    } catch {
      setError('Network error. Please try again.')
      setMerging(false)
    }
  }

  const getInitials = (name: string) =>
    name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()

  const isHeadAndFamilyMerge = primary && duplicate && (primary.isHead !== duplicate.isHead)

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="doppelrand-outer shadow-2xl w-full max-w-2xl">
        <div className="doppelrand-inner p-7 relative overflow-hidden animate-in fade-in zoom-in duration-200">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#ebd2a3] via-[#be9d62] to-[#76592a] z-10" />

          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-1.5 rounded-full hover:bg-[#e8e2d5]/80 transition-colors cursor-pointer text-[#3b2f23]/50 hover:text-[#3b2f23]"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center border border-amber-200">
              <GitMerge className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-[#3b2f23]">Merge Duplicate Profiles</h3>
              <p className="text-[11px] text-[#3b2f23]/60 font-sans">Select a primary profile to keep and a duplicate to merge into it.</p>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#3b2f23]/40" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search members by name, code, phone, or parent..."
              className="input-field !pl-10 !border-[#dfd8cb] !bg-white/75 focus:!ring-[#3b2f23]/25 focus:!border-[#3b2f23]/50 text-[#3b2f23] text-sm"
            />
          </div>

          {/* Selection Area */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-forest-700 mb-2">Primary (Keep)</p>
              <div className={`p-3 rounded-lg border-2 min-h-[60px] flex items-center gap-3 transition-colors ${primary ? 'border-forest-400 bg-forest-50/50' : 'border-dashed border-[#dfd8cb] bg-[#f7f6f0]/50'}`}>
                {primary ? (
                  <>
                    <div className="w-8 h-8 rounded-full bg-[#e5e0d5] border border-[#dfd8cb] flex items-center justify-center text-[#3b2f23] text-xs font-bold shrink-0">
                      {primary.avatar_url ? <img src={primary.avatar_url} alt="" className="w-full h-full rounded-full object-cover" /> : getInitials(primary.full_name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-[#3b2f23] truncate">{primary.full_name}</p>
                      <p className="text-[9px] font-mono text-[#3b2f23]/50">{primary.member_code}</p>
                    </div>
                    <button onClick={() => setPrimaryId(null)} className="ml-auto text-[#3b2f23]/40 hover:text-red-500 cursor-pointer shrink-0"><X className="w-3.5 h-3.5" /></button>
                  </>
                ) : (
                  <p className="text-xs text-[#3b2f23]/40 font-sans w-full text-center">Click a member below</p>
                )}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-red-600 mb-2">Duplicate (Remove)</p>
              <div className={`p-3 rounded-lg border-2 min-h-[60px] flex items-center gap-3 transition-colors ${duplicate ? 'border-red-400 bg-red-50/50' : 'border-dashed border-[#dfd8cb] bg-[#f7f6f0]/50'}`}>
                {duplicate ? (
                  <>
                    <div className="w-8 h-8 rounded-full bg-[#e5e0d5] border border-[#dfd8cb] flex items-center justify-center text-[#3b2f23] text-xs font-bold shrink-0">
                      {duplicate.avatar_url ? <img src={duplicate.avatar_url} alt="" className="w-full h-full rounded-full object-cover" /> : getInitials(duplicate.full_name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-[#3b2f23] truncate">{duplicate.full_name}</p>
                      <p className="text-[9px] font-mono text-[#3b2f23]/50">{duplicate.member_code}</p>
                    </div>
                    <button onClick={() => setDuplicateId(null)} className="ml-auto text-[#3b2f23]/40 hover:text-red-500 cursor-pointer shrink-0"><X className="w-3.5 h-3.5" /></button>
                  </>
                ) : (
                  <p className="text-xs text-[#3b2f23]/40 font-sans w-full text-center">Click a member below</p>
                )}
              </div>
            </div>
          </div>

          {/* Merge Note */}
          {isHeadAndFamilyMerge && (
            <div className="flex items-start gap-2.5 p-3 bg-amber-50 border border-amber-200 rounded-lg text-[10px] text-amber-800 font-medium mb-4">
              <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <strong>Merge Note:</strong> You are merging a registered account and a family member entry.
                To preserve login access, the registered account will be kept as the Primary profile, and the family entry will be linked to it. The primary account\'s Member ID will be updated to the family entry\'s ID.
              </div>
            </div>
          )}

          {/* Members List */}
          <div className="max-h-[200px] overflow-y-auto border border-[#dfd8cb] rounded-lg divide-y divide-[#dfd8cb] mb-5">
            {filtered.length === 0 && (
              <p className="text-sm text-[#3b2f23]/50 text-center py-6 font-sans">No members match your search.</p>
            )}
            {filtered.map(m => {
              const isPrimary = m.id === primaryId
              const isDuplicate = m.id === duplicateId
              const isSelected = isPrimary || isDuplicate

              return (
                <div
                  key={m.id}
                  className={`flex items-center gap-3 px-4 py-3 text-xs transition-colors ${
                    isPrimary ? 'bg-forest-50' : isDuplicate ? 'bg-red-50' : 'bg-white hover:bg-[#f7f6f0]'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-[#e5e0d5] border border-[#dfd8cb] flex items-center justify-center text-[#3b2f23] font-bold shrink-0 overflow-hidden">
                    {m.avatar_url ? <img src={m.avatar_url} alt="" className="w-full h-full object-cover" /> : <span className="text-[10px]">{getInitials(m.full_name)}</span>}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-[#3b2f23] truncate">{m.full_name}</p>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
                      <span className="text-[9px] font-mono text-[#3b2f23]/50">{m.member_code}</span>
                      <span className="text-[9px] text-[#3b2f23]/40">{m.phone}</span>
                      {!m.isHead && (
                        <span className="text-[9px] font-mono font-bold bg-[#e8e2d5]/60 border border-[#dfd8cb] px-1.5 py-0.5 rounded uppercase tracking-wider text-amber-800">
                          ↳ {m.relationship || 'Member'} of {m.parent_name}
                        </span>
                      )}
                    </div>
                  </div>
                  {!isSelected && (
                    <div className="flex gap-1.5 shrink-0">
                      <button
                        onClick={() => selectPrimary(m)}
                        disabled={!!primaryId}
                        className="text-[9px] font-bold font-mono uppercase tracking-wider px-2 py-1 rounded bg-forest-50 border border-forest-200 text-forest-700 hover:bg-forest-100 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        Primary
                      </button>
                      <button
                        onClick={() => selectDuplicate(m)}
                        disabled={!!duplicateId}
                        className="text-[9px] font-bold font-mono uppercase tracking-wider px-2 py-1 rounded bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        Duplicate
                      </button>
                    </div>
                  )}
                  {isSelected && (
                    <span className={`text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded ${isPrimary ? 'bg-forest-100 text-forest-700' : 'bg-red-100 text-red-600'}`}>
                      {isPrimary ? '✓ Primary' : '✓ Duplicate'}
                    </span>
                  )}
                </div>
              )
            })}
          </div>

          {/* Error / Success */}
          {error && (
            <div className="flex items-start gap-2.5 p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <p className="text-xs text-red-700 font-medium font-sans">{error}</p>
            </div>
          )}
          {success && (
            <div className="flex items-start gap-2.5 p-3 bg-forest-50 border border-forest-200 rounded-lg mb-4">
              <UserCheck className="w-4 h-4 text-forest-600 shrink-0 mt-0.5" />
              <p className="text-xs text-forest-700 font-medium font-sans">{success}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button onClick={onClose} className="btn-premium-outline flex-1 py-2.5 text-xs font-bold">
              Cancel
            </button>
            <button
              onClick={handleMerge}
              disabled={!primaryId || !duplicateId || merging || !!success}
              className="btn-premium-solid flex-1 py-2.5 text-xs flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {merging && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {merging ? 'Merging...' : 'Merge Profiles'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

