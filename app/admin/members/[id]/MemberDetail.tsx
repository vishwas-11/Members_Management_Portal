'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useForm, useFieldArray, type SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, PlusCircle, Trash2, Loader2, CheckCircle2, IndianRupee } from 'lucide-react'
import Link from 'next/link'
import type { Member, Due } from '@/types'

const memberSchema = z.object({
  full_name: z.string().min(2),
  address: z.string().min(10),
  age: z.coerce.number().min(1).max(120),
  phone: z.string().regex(/^[6-9]\d{9}$/),
  role: z.enum(['member', 'admin']),
  family_members: z.array(z.object({
    name: z.string().min(2),
    age: z.coerce.number().min(1).max(120),
    relationship: z.string().min(2),
  })),
})

type MemberForm = z.infer<typeof memberSchema>

export default function AdminMemberDetail({ member, dues: initialDues }: { member: Member; dues: Due[] }) {
  const supabase = createClient()
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [dues, setDues] = useState<Due[]>(initialDues)
  const [newDue, setNewDue] = useState({ title: '', amount: '', due_date: '' })
  const [addingDue, setAddingDue] = useState(false)

  const { register, control, handleSubmit, formState: { errors } } = useForm<MemberForm>({
    resolver: zodResolver(memberSchema) as any,
    defaultValues: {
      full_name: member.full_name,
      address: member.address,
      age: member.age,
      phone: member.phone,
      role: member.role,
      family_members: member.family_members ?? [],
    },
  })
  const { fields, append, remove } = useFieldArray({ control, name: 'family_members' })

  const onSubmit: SubmitHandler<MemberForm> = async (data) => {
    setSaving(true); setSaveError(''); setSaved(false)
    const { error } = await supabase.from('members').update({ ...data, updated_at: new Date().toISOString() }).eq('id', member.id)
    setSaving(false)
    if (error) { setSaveError(error.message); return }
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const toggleDuePaid = async (due: Due) => {
    const { error } = await supabase.from('dues').update({
      is_paid: !due.is_paid,
      paid_at: !due.is_paid ? new Date().toISOString() : null,
    }).eq('id', due.id)
    if (!error) setDues(prev => prev.map(d => d.id === due.id ? { ...d, is_paid: !d.is_paid } : d))
  }

  const addDue = async () => {
    if (!newDue.title || !newDue.amount || !newDue.due_date) return
    setAddingDue(true)
    const { data, error } = await supabase.from('dues').insert({
      member_id: member.id,
      title: newDue.title,
      amount: parseFloat(newDue.amount),
      due_date: newDue.due_date,
      is_paid: false,
    }).select().single()
    setAddingDue(false)
    if (!error && data) {
      setDues(prev => [data, ...prev])
      setNewDue({ title: '', amount: '', due_date: '' })
    }
  }

  const deleteDue = async (id: string) => {
    await supabase.from('dues').delete().eq('id', id)
    setDues(prev => prev.filter(d => d.id !== id))
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 space-y-10 relative z-10">
      <div className="flex items-center gap-4 border-b border-cream-200 pb-6 mb-2">
        <Link href="/admin" className="w-10 h-10 border border-cream-200 hover:border-forest-600 hover:text-forest-600 text-gray-400 rounded-md flex items-center justify-center bg-white shadow-sm transition-all cursor-pointer">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="font-serif text-3xl font-normal text-forest-800 tracking-tight">{member.full_name}</h1>
          <p className="text-xs text-gray-400 mt-1 font-mono uppercase tracking-wider">Member since {new Date(member.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-6">
        <div className="card border-t-2 border-t-forest-600 space-y-5">
          <h2 className="font-serif text-xl font-normal text-forest-800 border-b border-cream-100 pb-3">Personal Details</h2>
          
          <div>
            <label className="label">Full Name</label>
            <input {...register('full_name')} className="input-field" />
            {errors.full_name && <p className="error-msg">Required</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Age</label>
              <input {...register('age')} type="number" className="input-field" />
            </div>
            <div>
              <label className="label">Phone</label>
              <input {...register('phone')} className="input-field" maxLength={10} />
              {errors.phone && <p className="error-msg">Invalid number</p>}
            </div>
          </div>

          <div>
            <label className="label">Aadhaar (Read Only)</label>
            <input value={member.aadhaar_number} disabled className="input-field bg-cream-100 text-gray-400 border-cream-200 cursor-not-allowed" />
          </div>

          <div>
            <label className="label">Address</label>
            <textarea {...register('address')} className="input-field resize-none !h-auto" rows={3} />
          </div>

          <div>
            <label className="label">Account Role</label>
            <select {...register('role')} className="input-field select-clean">
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>

        <div className="card border-t-2 border-t-forest-600 space-y-5">
          <h2 className="font-serif text-xl font-normal text-forest-800 border-b border-cream-100 pb-3">Family Connections</h2>
          
          <div className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="border border-cream-200 rounded-md p-5 space-y-4 bg-cream-50/30 relative">
                <div className="flex justify-between items-center border-b border-cream-200/60 pb-2">
                  <span className="text-xs font-mono font-medium text-gray-500 uppercase tracking-wider">Member #{index + 1}</span>
                  <button type="button" onClick={() => remove(index)} className="text-red-500 hover:text-red-700 p-1 rounded transition-colors cursor-pointer">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="label">Name</label>
                    <input {...register(`family_members.${index}.name`)} className="input-field" />
                  </div>
                  <div>
                    <label className="label">Age</label>
                    <input {...register(`family_members.${index}.age`)} type="number" className="input-field" />
                  </div>
                  <div>
                    <label className="label">Relationship</label>
                    <select {...register(`family_members.${index}.relationship`)} className="input-field select-clean">
                      <option value="">Select</option>
                      <option>Spouse</option><option>Son</option><option>Daughter</option>
                      <option>Father</option><option>Mother</option><option>Sibling</option><option>Other</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button type="button" onClick={() => append({ name: '', age: 0, relationship: '' })}
            className="w-full flex items-center justify-center gap-2 py-3 border border-dashed border-forest-600 text-forest-600 rounded-md text-sm font-medium hover:bg-cream-100 transition-all duration-200 cursor-pointer">
            <PlusCircle className="w-4 h-4" /> Add Family Member
          </button>
        </div>

        {saveError && <p className="error-msg text-center font-medium">{saveError}</p>}
        {saved && (
          <div className="flex items-center justify-center gap-2 text-forest-600 text-sm font-medium">
            <CheckCircle2 className="w-4 h-4 animate-bounce" /> Profile information updated successfully
          </div>
        )}
        <button type="submit" disabled={saving} className="btn-primary w-full flex items-center justify-center gap-2 min-h-[44px]">
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          {saving ? 'Saving changes...' : 'Save Changes'}
        </button>
      </form>

      {/* Dues section */}
      <div className="card border-t-2 border-t-forest-600 space-y-6">
        <h2 className="font-serif text-xl font-normal text-forest-800 border-b border-cream-100 pb-3 flex items-center gap-2">
          <IndianRupee className="w-5 h-5 text-forest-600" /> Dues & Collections Statement
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 bg-cream-50/50 border border-cream-200 rounded-md relative z-10">
          <div>
            <label className="label text-[10px]">Description</label>
            <input value={newDue.title} onChange={e => setNewDue(p => ({ ...p, title: e.target.value }))}
              placeholder="e.g. Church Fund 2025" className="input-field !h-10 text-xs bg-white" />
          </div>
          <div>
            <label className="label text-[10px]">Amount (₹)</label>
            <input value={newDue.amount} onChange={e => setNewDue(p => ({ ...p, amount: e.target.value }))}
              type="number" placeholder="500" className="input-field !h-10 text-xs bg-white" />
          </div>
          <div>
            <label className="label text-[10px]">Due Date</label>
            <input value={newDue.due_date} onChange={e => setNewDue(p => ({ ...p, due_date: e.target.value }))}
              type="date" className="input-field !h-10 text-xs bg-white font-mono" />
          </div>
          <div className="col-span-1 sm:col-span-3 pt-2">
            <button onClick={addDue} disabled={addingDue || !newDue.title || !newDue.amount || !newDue.due_date}
              className="btn-primary text-xs px-5 py-2 flex items-center gap-1.5 min-h-[36px] w-fit">
              {addingDue && <Loader2 className="w-3 h-3 animate-spin" />}
              Add Due Record
            </button>
          </div>
        </div>

        {dues.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6 font-sans">No contribution statements issued yet.</p>
        ) : (
          <div className="divide-y divide-cream-100 space-y-3">
            {dues.map((due, i) => (
              <div key={due.id} className={`flex items-center justify-between ${i > 0 ? 'pt-4' : ''}`}>
                <div>
                  <p className="text-sm font-medium text-forest-800">{due.title}</p>
                  <p className="text-[11px] font-mono text-gray-400 mt-0.5">Due: {new Date(due.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-forest-800">₹{due.amount.toLocaleString('en-IN')}</span>
                  <button onClick={() => toggleDuePaid(due)}
                    className={`text-xs px-3.5 py-1 rounded-full font-mono uppercase tracking-wider font-medium transition-colors border cursor-pointer ${
                      due.is_paid 
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-100 hover:bg-emerald-100' 
                        : 'bg-rose-50 text-rose-800 border-rose-100 hover:bg-rose-100'
                    }`}>
                    {due.is_paid ? 'Paid' : 'Pending'}
                  </button>
                  <button onClick={() => deleteDue(due.id)} className="p-1.5 border border-cream-200 hover:border-red-600 hover:text-red-600 text-gray-400 bg-white hover:bg-red-50 rounded-md transition-all cursor-pointer">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
