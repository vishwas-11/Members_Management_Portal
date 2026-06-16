'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useForm, useFieldArray, type SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, PlusCircle, Trash2, Loader2, CheckCircle2, IndianRupee, Upload, FileText, Camera } from 'lucide-react'
import Link from 'next/link'
import type { Member, Due } from '@/types'
import { ScrollReveal } from '@/components/ui/ScrollReveal'

const memberSchema = z.object({
  full_name: z.string().min(2),
  address: z.string().min(10),
  age: z.coerce.number().min(1).max(120),
  phone: z.string().regex(/^[6-9]\d{9}$/),
  role: z.enum(['member', 'admin']),
  dob: z.string().min(1, 'Date of Birth is required'),
  marital_status: z.enum(['Single', 'Married', 'Widowed', 'Divorced']),
  avatar_url: z.string().optional(),
  certificate_url: z.string().optional(),
  family_members: z.array(z.object({
    name: z.string().min(2),
    age: z.coerce.number().min(1).max(120),
    relationship: z.string().min(2),
    dob: z.string().min(1, 'Date of Birth is required'),
    marital_status: z.enum(['Single', 'Married', 'Widowed', 'Divorced']),
    aadhaar_number: z.string().regex(/^\d{12}$/, 'Aadhaar must be exactly 12 digits'),
    avatar_url: z.string().optional(),
    certificate_url: z.string().optional(),
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
  const [rejectingDueId, setRejectingDueId] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')

  const initials = member.full_name
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const [uploadingField, setUploadingField] = useState<string | null>(null)

  const { register, control, handleSubmit, setValue, watch, formState: { errors } } = useForm<MemberForm>({
    resolver: zodResolver(memberSchema) as any,
    defaultValues: {
      full_name: member.full_name,
      address: member.address,
      age: member.age,
      phone: member.phone,
      role: member.role,
      dob: member.dob || '',
      marital_status: (member.marital_status || '') as any,
      avatar_url: member.avatar_url || '',
      certificate_url: member.certificate_url || '',
      family_members: member.family_members ?? [],
    },
  })
  const { fields, append, remove } = useFieldArray({ control, name: 'family_members' })

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldName: any,
    bucket: string,
    fileType: string
  ) => {
    try {
      const file = e.target.files?.[0]
      if (!file) return

      if (file.size > 2 * 1024 * 1024) {
        alert('File size must be less than 2MB.')
        return
      }

      setUploadingField(fieldName)
      
      const fileExt = file.name.split('.').pop()
      const randomId = Math.random().toString(36).substring(2, 9)
      const filePath = `${member.user_id}/${fileType}_${randomId}.${fileExt}`

      const { error: uploadErr } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, { upsert: true })

      if (uploadErr) throw uploadErr

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath)

      setValue(fieldName, publicUrl)
    } catch (err: any) {
      console.error(err)
      alert(err.message || 'Failed to upload file')
    } finally {
      setUploadingField(null)
    }
  }

  const onSubmit: SubmitHandler<MemberForm> = async (data) => {
    setSaving(true); setSaveError(''); setSaved(false)
    const { error } = await supabase.from('members').update({ ...data, updated_at: new Date().toISOString() }).eq('id', member.id)
    setSaving(false)
    if (error) { setSaveError(error.message); return }
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const updateDueStatus = async (due: Due, newStatus: 'pending' | 'paid' | 'rejected', reason?: string) => {
    const updateData: any = { status: newStatus }
    if (newStatus === 'rejected' && reason !== undefined) {
      updateData.rejection_reason = reason
    } else if (newStatus === 'paid' || newStatus === 'pending') {
      updateData.rejection_reason = null // Clear reason on other states
    }

    const { error } = await supabase.from('dues').update(updateData).eq('id', due.id)
    if (!error) {
      setDues(prev => prev.map(d => d.id === due.id ? { 
        ...d, 
        status: newStatus, 
        is_paid: newStatus === 'paid',
        rejection_reason: newStatus === 'rejected' ? reason : undefined
      } : d))
    }
  }

  const handleRejectDue = (due: Due) => {
    setRejectingDueId(due.id)
    setRejectionReason('')
  }

  const submitRejection = async (due: Due) => {
    await updateDueStatus(due, 'rejected', rejectionReason)
    setRejectingDueId(null)
  }

  const addDue = async () => {
    if (!newDue.title || !newDue.amount || !newDue.due_date) return
    setAddingDue(true)
    const { data, error } = await supabase.from('dues').insert({
      member_id: member.id,
      title: newDue.title,
      amount: parseFloat(newDue.amount),
      due_date: newDue.due_date,
      status: 'pending',
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

  const inputClasses = "input-field !border-[#dfd8cb] !bg-white/75 focus:!ring-[#3b2f23]/25 focus:!border-[#3b2f23]/50 text-[#3b2f23]"
  const labelClasses = "font-mono text-[10px] font-bold uppercase tracking-widest text-[#3b2f23]/60 mb-1.5 block"

  return (
    <ScrollReveal className="max-w-4xl mx-auto px-6 py-12 space-y-10 relative z-10 pt-32">
      <div className="flex items-center gap-4 border-b border-[#faf9f6]/20 pb-6 mb-2">
        <Link href="/admin" className="btn-premium-outline px-3 py-2 flex items-center justify-center cursor-pointer flex-shrink-0">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-[#ebd2a3] to-[#be9d62] flex items-center justify-center text-[#3b2f23] border-2 border-[#fcfbf9] shadow-md flex-shrink-0 font-serif font-bold">
            {member.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={member.avatar_url} alt={member.full_name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl">{initials}</span>
            )}
          </div>
          <div>
            <h1 className="text-4xl sm:text-5xl font-serif font-medium tracking-tight bg-gradient-to-br from-[#fcfbf9] via-[#e8d5b5] to-[#c5b799] bg-clip-text text-transparent drop-shadow-[0_2px_4px_rgba(13,33,25,0.8)]">{member.full_name}</h1>
            <p className="text-xs text-[#faf9f6]/70 mt-1 font-mono uppercase tracking-wider font-bold drop-shadow-sm">Member since {new Date(member.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-8">
        <div className="doppelrand-outer shadow-2xl relative z-20">
          <div className="doppelrand-inner p-8 space-y-6">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#ebd2a3] via-[#be9d62] to-[#76592a] z-10" />
          <h2 className="font-serif text-xl font-bold text-[#3b2f23] border-b border-[#dfd8cb] pb-3">Personal Details</h2>
          
          <div>
            <label className={labelClasses}>Full Name</label>
            <input {...register('full_name')} className={inputClasses} />
            {errors.full_name && <p className="error-msg">Required</p>}
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className={labelClasses}>Age</label>
              <input {...register('age')} type="number" className={inputClasses} />
            </div>
            <div>
              <label className={labelClasses}>Phone</label>
              <input {...register('phone')} className={inputClasses} maxLength={10} />
              {errors.phone && <p className="error-msg">Invalid number</p>}
            </div>
          </div>

          <div>
            <label className={labelClasses}>Aadhaar (Read Only)</label>
            <input value={member.aadhaar_number} disabled className={`${inputClasses} !bg-[#e8e2d5]/50 !text-[#3b2f23]/50 !cursor-not-allowed`} />
          </div>

          <div>
            <label className={labelClasses}>Address</label>
            <textarea {...register('address')} className={`${inputClasses} resize-none !h-auto`} rows={3} />
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className={labelClasses}>Date of Birth</label>
              <input {...register('dob')} type="date" className={`${inputClasses} font-mono`} />
              {errors.dob && <p className="error-msg">{errors.dob.message}</p>}
            </div>
            <div>
              <label className={labelClasses}>Marital Status</label>
              <select {...register('marital_status')} className={`${inputClasses} select-clean`}>
                <option value="">Select</option>
                <option value="Single">Single</option>
                <option value="Married">Married</option>
                <option value="Widowed">Widowed</option>
                <option value="Divorced">Divorced</option>
              </select>
              {errors.marital_status && <p className="error-msg">{errors.marital_status.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 border-t border-[#dfd8cb]">
            <div>
              <label className={labelClasses}>Photo URL / Upload</label>
              <div className="flex items-center gap-4 mt-2 bg-[#f5f3ee] p-4 border border-[#dfd8cb] rounded-lg">
                <div className="w-14 h-14 rounded-full overflow-hidden bg-[#e5e0d5] border border-[#dfd8cb] flex items-center justify-center text-[#3b2f23]/40 shrink-0 shadow-inner">
                  {watch('avatar_url') ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={watch('avatar_url')} alt="Photo" className="w-full h-full object-cover" />
                  ) : (
                    <Camera className="w-5 h-5" />
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <input
                    type="file"
                    accept="image/*"
                    id="admin-head-photo"
                    className="hidden"
                    onChange={(e) => handleFileChange(e, 'avatar_url', 'profile-pictures', 'avatar')}
                  />
                  <label
                    htmlFor="admin-head-photo"
                    className="btn-skeu-clay text-[10px] px-3 py-1.5 flex items-center justify-center gap-1.5 cursor-pointer min-h-[32px] w-fit"
                  >
                    {uploadingField === 'avatar_url' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                    {watch('avatar_url') ? 'Change' : 'Upload'}
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label className={labelClasses}>Certificate Document</label>
              <div className="flex flex-col gap-2 mt-2 bg-[#f5f3ee] p-4 border border-[#dfd8cb] rounded-lg min-h-[88px] justify-center">
                <input
                  type="file"
                  accept=".pdf,image/*"
                  id="admin-head-certificate"
                  className="hidden"
                  onChange={(e) => handleFileChange(e, 'certificate_url', 'member-documents', 'certificate')}
                />
                <div className="flex items-center gap-3">
                  <label
                    htmlFor="admin-head-certificate"
                    className="btn-skeu-clay text-[10px] px-3 py-1.5 flex items-center justify-center gap-1.5 cursor-pointer min-h-[32px] w-fit"
                  >
                    {uploadingField === 'certificate_url' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                    {watch('certificate_url') ? 'Change' : 'Upload'}
                  </label>
                  {watch('certificate_url') && (
                    <a
                      href={watch('certificate_url')}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[10px] text-[#3b2f23] font-bold bg-[#dfd8cb]/30 border border-[#dfd8cb] rounded px-2.5 py-1.5 hover:bg-[#dfd8cb]/50 transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>View</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className={labelClasses}>Account Role</label>
            <select {...register('role')} className={`${inputClasses} select-clean`}>
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          </div>
        </div>

        <div className="doppelrand-outer shadow-2xl relative z-20">
          <div className="doppelrand-inner p-8 space-y-6">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#ebd2a3] via-[#be9d62] to-[#76592a] z-10" />
          <h2 className="font-serif text-xl font-bold text-[#3b2f23] border-b border-[#dfd8cb] pb-3">Family Connections</h2>
          
          <div className="space-y-5">
            {fields.map((field, index) => (
              <div key={field.id} className="border border-[#dfd8cb] rounded-lg p-6 space-y-5 bg-white/60 shadow-sm relative">
                <div className="flex justify-between items-center border-b border-[#dfd8cb]/60 pb-3">
                  <span className="text-xs font-mono font-bold text-[#3b2f23]/60 uppercase tracking-wider">Family Member #{index + 1}</span>
                  <button type="button" onClick={() => remove(index)} className="text-red-600 hover:text-red-800 p-1 rounded transition-colors cursor-pointer bg-red-50 hover:bg-red-100">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <div className="col-span-2 sm:col-span-1">
                    <label className={labelClasses}>Name</label>
                    <input {...register(`family_members.${index}.name`)} className={inputClasses} />
                  </div>
                  <div>
                    <label className={labelClasses}>Age</label>
                    <input {...register(`family_members.${index}.age`)} type="number" className={inputClasses} />
                  </div>
                  <div className="col-span-2 sm:col-span-2">
                    <label className={labelClasses}>Relationship</label>
                    <select {...register(`family_members.${index}.relationship`)} className={`${inputClasses} select-clean`}>
                      <option value="">Select</option>
                      <option>Spouse</option><option>Son</option><option>Daughter</option>
                      <option>Father</option><option>Mother</option><option>Sibling</option><option>Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className={labelClasses}>Date of Birth</label>
                    <input {...register(`family_members.${index}.dob`)} type="date" className={`${inputClasses} font-mono`} />
                  </div>
                  <div>
                    <label className={labelClasses}>Marital Status</label>
                    <select {...register(`family_members.${index}.marital_status`)} className={`${inputClasses} select-clean`}>
                      <option value="">Select</option>
                      <option value="Single">Single</option>
                      <option value="Married">Married</option>
                      <option value="Widowed">Widowed</option>
                      <option value="Divorced">Divorced</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className={labelClasses}>Aadhaar Number</label>
                  <input {...register(`family_members.${index}.aadhaar_number`)} className={`${inputClasses} font-mono`} maxLength={12} placeholder="12-digit Aadhaar number" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-4 border-t border-[#dfd8cb]">
                  <div>
                    <label className={labelClasses}>Member Photo</label>
                    <div className="flex items-center gap-4 mt-2 bg-[#f5f3ee] p-4 border border-[#dfd8cb] rounded-lg">
                      <div className="w-14 h-14 rounded-full overflow-hidden bg-[#e5e0d5] border border-[#dfd8cb] flex items-center justify-center text-[#3b2f23]/40 shrink-0 shadow-inner">
                        {watch(`family_members.${index}.avatar_url`) ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={watch(`family_members.${index}.avatar_url`)} alt="Member Photo" className="w-full h-full object-cover" />
                        ) : (
                          <Camera className="w-5 h-5" />
                        )}
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <input
                          type="file"
                          accept="image/*"
                          id={`admin-family-photo-${index}`}
                          className="hidden"
                          onChange={(e) => handleFileChange(e, `family_members.${index}.avatar_url`, 'profile-pictures', `family_${index}_avatar`)}
                        />
                        <label
                          htmlFor={`admin-family-photo-${index}`}
                          className="btn-skeu-clay text-[10px] px-3 py-1.5 flex items-center justify-center gap-1.5 cursor-pointer min-h-[32px] w-fit"
                        >
                          {uploadingField === `family_members.${index}.avatar_url` ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                          {watch(`family_members.${index}.avatar_url`) ? 'Change' : 'Upload'}
                        </label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className={labelClasses}>Certificate Document</label>
                    <div className="flex flex-col gap-2 mt-2 bg-[#f5f3ee] p-4 border border-[#dfd8cb] rounded-lg min-h-[88px] justify-center">
                      <input
                        type="file"
                        accept=".pdf,image/*"
                        id={`admin-family-certificate-${index}`}
                        className="hidden"
                        onChange={(e) => handleFileChange(e, `family_members.${index}.certificate_url`, 'member-documents', `family_${index}_certificate`)}
                      />
                      <div className="flex items-center gap-3">
                        <label
                          htmlFor={`admin-family-certificate-${index}`}
                          className="btn-skeu-clay text-[10px] px-3 py-1.5 flex items-center justify-center gap-1.5 cursor-pointer min-h-[32px] w-fit"
                        >
                          {uploadingField === `family_members.${index}.certificate_url` ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                          {watch(`family_members.${index}.certificate_url`) ? 'Change' : 'Upload'}
                        </label>
                        {watch(`family_members.${index}.certificate_url`) && (
                          <a
                            href={watch(`family_members.${index}.certificate_url`)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-[10px] text-[#3b2f23] font-bold bg-[#dfd8cb]/30 border border-[#dfd8cb] rounded px-2.5 py-1.5 hover:bg-[#dfd8cb]/50 transition-colors"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>View</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button type="button" onClick={() => append({ name: '', age: 0, relationship: '', dob: '', marital_status: '' as any, aadhaar_number: '', avatar_url: '', certificate_url: '' })}
            className="w-full flex items-center justify-center gap-2 py-3 border border-dashed border-[#dfd8cb] bg-[#f5f3ee]/50 text-[#3b2f23]/70 hover:text-[#3b2f23] rounded-lg text-sm font-bold hover:bg-[#f5f3ee] transition-all duration-200 cursor-pointer">
            <PlusCircle className="w-4 h-4" /> Add Family Member
          </button>
          </div>
        </div>

        {saveError && <p className="error-msg text-center font-bold text-red-600 bg-red-50 py-2 rounded-md border border-red-100">{saveError}</p>}
        {saved && (
          <div className="flex items-center justify-center gap-2 text-emerald-800 bg-emerald-50 py-2 rounded-md border border-emerald-100 text-sm font-bold shadow-sm">
            <CheckCircle2 className="w-4 h-4 animate-bounce" /> Profile information updated successfully
          </div>
        )}
        <button type="submit" disabled={saving} className="btn-premium-solid group w-full mt-4">
          <div className="flex items-center gap-2">
            {saving && <Loader2 className="w-5 h-5 animate-spin" />}
            <span>{saving ? 'Saving changes...' : 'Save Changes'}</span>
          </div>
        </button>
      </form>

      {/* Dues section */}
      <div className="doppelrand-outer shadow-2xl relative z-20">
        <div className="doppelrand-inner p-8 space-y-6">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#ebd2a3] via-[#be9d62] to-[#76592a] z-10" />
        <h2 className="font-serif text-xl font-bold text-[#3b2f23] border-b border-[#dfd8cb] pb-3 flex items-center gap-2">
          <IndianRupee className="w-5 h-5 text-[#3b2f23]" /> Dues & Collections Statement
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 p-6 bg-[#f5f3ee] border border-[#dfd8cb] rounded-lg relative z-10">
          <div>
            <label className={labelClasses}>Description</label>
            <input value={newDue.title} onChange={e => setNewDue(p => ({ ...p, title: e.target.value }))}
              placeholder="e.g. Church Fund 2025" className={inputClasses} />
          </div>
          <div>
            <label className={labelClasses}>Amount (₹)</label>
            <input value={newDue.amount} onChange={e => setNewDue(p => ({ ...p, amount: e.target.value }))}
              type="number" placeholder="500" className={inputClasses} />
          </div>
          <div>
            <label className={labelClasses}>Due Date</label>
            <input value={newDue.due_date} onChange={e => setNewDue(p => ({ ...p, due_date: e.target.value }))}
              type="date" className={`${inputClasses} font-mono`} />
          </div>
          <div className="col-span-1 sm:col-span-3 pt-3">
            <button onClick={addDue} disabled={addingDue || !newDue.title || !newDue.amount || !newDue.due_date}
              className="btn-premium-solid group text-xs px-5 py-2.5 flex items-center justify-center gap-1.5 min-h-[36px] w-full sm:w-fit cursor-pointer disabled:opacity-50">
              {addingDue && <Loader2 className="w-4 h-4 animate-spin" />}
              Add Due Record
            </button>
          </div>
        </div>

        {dues.length === 0 ? (
          <p className="text-sm text-[#3b2f23]/50 text-center py-6 font-sans font-medium">No contribution statements issued yet.</p>
        ) : (
          <div className="divide-y divide-[#dfd8cb] space-y-4">
            {dues.map((due, i) => (
              <div key={due.id} className={`flex flex-col sm:flex-row sm:items-start justify-between gap-4 ${i > 0 ? 'pt-4' : ''}`}>
                <div className="flex-1">
                  <p className="text-sm font-bold text-[#3b2f23]">{due.title}</p>
                  <p className="text-[11px] font-mono font-bold text-[#3b2f23]/50 mt-0.5">Due: {new Date(due.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  
                  {due.status === 'submitted' && (
                    <div className="mt-3 bg-[#e8e2d5]/30 p-3 rounded-lg border border-[#dfd8cb]/50 inline-block w-full sm:w-auto">
                      <p className="text-[10px] font-mono uppercase tracking-widest text-[#3b2f23]/60 mb-1 font-bold">Proof Submitted</p>
                      {due.payment_note && <p className="text-xs text-[#3b2f23]/80 italic mb-2">"{due.payment_note}"</p>}
                      {due.payment_proof_url && (
                        <a href={due.payment_proof_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-[11px] font-bold text-[#3b2f23] hover:text-[#4a3820] hover:underline underline-offset-4 transition-colors w-fit">
                          <FileText className="w-3.5 h-3.5" /> View Uploaded Proof
                        </a>
                      )}
                    </div>
                  )}
                  {due.status === 'rejected' && (
                    <div className="mt-3 bg-red-50/50 p-3 rounded-lg border border-red-100 inline-block w-full sm:w-auto">
                      <p className="text-[10px] font-mono uppercase tracking-widest text-red-600 mb-1 font-bold">Proof Rejected</p>
                      {due.rejection_reason && <p className="text-xs text-red-800 italic mb-2">Reason: {due.rejection_reason}</p>}
                      {due.payment_proof_url && (
                        <a href={due.payment_proof_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-[11px] font-bold text-red-700 hover:text-red-900 hover:underline underline-offset-4 transition-colors w-fit">
                          <FileText className="w-3.5 h-3.5" /> View Rejected Proof
                        </a>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-bold text-[#3b2f23]">₹{due.amount.toLocaleString('en-IN')}</span>
                    <span className={`text-[10px] px-3 py-1 rounded-full font-mono uppercase tracking-wider font-bold border shadow-sm ${
                      due.status === 'paid' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 
                      due.status === 'submitted' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                      'bg-rose-50 text-rose-800 border-rose-200'
                    }`}>
                      {due.status}
                    </span>
                    <button onClick={() => deleteDue(due.id)} className="p-2 border border-[#dfd8cb] hover:border-red-600 hover:text-red-600 text-[#3b2f23]/40 bg-white hover:bg-red-50 rounded-md transition-all cursor-pointer shadow-sm ml-2">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {/* Actions based on status */}
                  <div className="flex flex-col items-end gap-2 mt-1 w-full sm:w-auto">
                    <div className="flex items-center gap-2">
                      {due.status === 'submitted' && rejectingDueId !== due.id && (
                        <>
                          <button onClick={() => updateDueStatus(due, 'paid')} className="btn-skeu-clay !bg-emerald-50 hover:!bg-emerald-100 !text-emerald-800 !border-emerald-200 text-[10px] px-3 py-1 flex items-center gap-1 cursor-pointer">
                            <CheckCircle2 className="w-3 h-3" /> Approve Payment
                          </button>
                          <button onClick={() => handleRejectDue(due)} className="btn-skeu-clay !bg-rose-50 hover:!bg-rose-100 !text-rose-800 !border-rose-200 text-[10px] px-3 py-1 flex items-center gap-1 cursor-pointer">
                            Reject
                          </button>
                        </>
                      )}
                      {(due.status === 'pending' || due.status === 'rejected') && (
                        <button onClick={() => updateDueStatus(due, 'paid')} className="btn-skeu-clay text-[10px] px-3 py-1 flex items-center gap-1 cursor-pointer">
                          Mark as Paid
                        </button>
                      )}
                      {due.status === 'paid' && (
                        <button onClick={() => updateDueStatus(due, 'pending')} className="btn-skeu-clay !bg-rose-50 hover:!bg-rose-100 !text-rose-800 !border-rose-200 text-[10px] px-3 py-1 flex items-center gap-1 cursor-pointer">
                          Mark as Pending
                        </button>
                      )}
                    </div>
                    {rejectingDueId === due.id && (
                      <div className="mt-2 flex flex-col gap-2 w-full min-w-[200px] bg-red-50 p-3 rounded-lg border border-red-100 shadow-sm">
                        <input 
                          type="text" 
                          placeholder="Reason for rejection (optional)..." 
                          value={rejectionReason} 
                          onChange={e => setRejectionReason(e.target.value)}
                          className="text-xs px-2.5 py-1.5 rounded bg-white border border-red-200 w-full focus:outline-none focus:border-red-400 text-red-900 placeholder:text-red-300"
                        />
                        <div className="flex gap-3 justify-end items-center mt-1">
                          <button onClick={() => setRejectingDueId(null)} className="text-[10px] text-red-600 font-bold hover:underline cursor-pointer">Cancel</button>
                          <button onClick={() => submitRejection(due)} className="btn-skeu-clay !bg-red-600 hover:!bg-red-700 !text-white !border-red-800 text-[10px] px-3 py-1.5 cursor-pointer shadow-sm font-bold">Confirm Reject</button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        </div>
      </div>
    </ScrollReveal>
  )
}
