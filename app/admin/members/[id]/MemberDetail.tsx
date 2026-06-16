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
        <Link href="/admin" className="w-10 h-10 border border-cream-200 hover:border-forest-600 hover:text-forest-600 text-gray-400 rounded-md flex items-center justify-center bg-white shadow-sm transition-all cursor-pointer flex-shrink-0">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-forest-600 to-forest-800 flex items-center justify-center text-white border-2 border-cream-200 shadow-md flex-shrink-0">
            {member.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={member.avatar_url} alt={member.full_name} className="w-full h-full object-cover" />
            ) : (
              <span className="font-serif text-xl font-light tracking-wide">{initials}</span>
            )}
          </div>
          <div>
            <h1 className="font-serif text-3xl font-normal text-forest-800 tracking-tight">{member.full_name}</h1>
            <p className="text-xs text-gray-400 mt-1 font-mono uppercase tracking-wider font-sans">Member since {new Date(member.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-6">
        <div className="card card-gradient-forest space-y-5">
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Date of Birth</label>
              <input {...register('dob')} type="date" className="input-field font-mono" />
              {errors.dob && <p className="error-msg">{errors.dob.message}</p>}
            </div>
            <div>
              <label className="label">Marital Status</label>
              <select {...register('marital_status')} className="input-field select-clean">
                <option value="">Select</option>
                <option value="Single">Single</option>
                <option value="Married">Married</option>
                <option value="Widowed">Widowed</option>
                <option value="Divorced">Divorced</option>
              </select>
              {errors.marital_status && <p className="error-msg">{errors.marital_status.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-cream-100">
            <div>
              <label className="label">Photo URL / Upload</label>
              <div className="flex items-center gap-3 mt-1 bg-cream-50/50 p-3 border border-cream-200 rounded-md">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-forest-100 border border-cream-200 flex items-center justify-center text-[#3b2f23]/40 shrink-0">
                  {watch('avatar_url') ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={watch('avatar_url')} alt="Photo" className="w-full h-full object-cover" />
                  ) : (
                    <Camera className="w-4 h-4" />
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <input
                    type="file"
                    accept="image/*"
                    id="admin-head-photo"
                    className="hidden"
                    onChange={(e) => handleFileChange(e, 'avatar_url', 'profile-pictures', 'avatar')}
                  />
                  <label
                    htmlFor="admin-head-photo"
                    className="btn-primary text-[10px] px-2.5 py-1 flex items-center gap-1 cursor-pointer min-h-[28px] w-fit shadow-sm"
                  >
                    {uploadingField === 'avatar_url' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                    {watch('avatar_url') ? 'Change' : 'Upload'}
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label className="label">Certificate Document</label>
              <div className="flex flex-col gap-1.5 mt-1 bg-cream-50/50 p-3 border border-cream-200 rounded-md min-h-[64px] justify-center">
                <input
                  type="file"
                  accept=".pdf,image/*"
                  id="admin-head-certificate"
                  className="hidden"
                  onChange={(e) => handleFileChange(e, 'certificate_url', 'member-documents', 'certificate')}
                />
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="admin-head-certificate"
                    className="btn-primary text-[10px] px-2.5 py-1 flex items-center gap-1 cursor-pointer min-h-[28px] w-fit shadow-sm"
                  >
                    {uploadingField === 'certificate_url' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                    {watch('certificate_url') ? 'Change' : 'Upload'}
                  </label>
                  {watch('certificate_url') && (
                    <a
                      href={watch('certificate_url')}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[9px] text-forest-700 font-semibold bg-forest-50 border border-forest-100 rounded px-2 py-0.5 hover:bg-forest-100 transition-colors"
                    >
                      <FileText className="w-3 h-3" />
                      <span>View</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="label">Account Role</label>
            <select {...register('role')} className="input-field select-clean">
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>

        <div className="card card-gradient-forest space-y-5">
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Date of Birth</label>
                    <input {...register(`family_members.${index}.dob`)} type="date" className="input-field font-mono" />
                  </div>
                  <div>
                    <label className="label">Marital Status</label>
                    <select {...register(`family_members.${index}.marital_status`)} className="input-field select-clean">
                      <option value="">Select</option>
                      <option value="Single">Single</option>
                      <option value="Married">Married</option>
                      <option value="Widowed">Widowed</option>
                      <option value="Divorced">Divorced</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="label">Aadhaar Number</label>
                  <input {...register(`family_members.${index}.aadhaar_number`)} className="input-field" maxLength={12} placeholder="12-digit Aadhaar number" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-cream-100">
                  <div>
                    <label className="label">Member Photo</label>
                    <div className="flex items-center gap-3 mt-1 bg-cream-50/50 p-3 border border-cream-200 rounded-md">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-forest-100 border border-cream-200 flex items-center justify-center text-[#3b2f23]/40 shrink-0">
                        {watch(`family_members.${index}.avatar_url`) ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={watch(`family_members.${index}.avatar_url`)} alt="Member Photo" className="w-full h-full object-cover" />
                        ) : (
                          <Camera className="w-4 h-4" />
                        )}
                      </div>
                      <div className="flex flex-col gap-1">
                        <input
                          type="file"
                          accept="image/*"
                          id={`admin-family-photo-${index}`}
                          className="hidden"
                          onChange={(e) => handleFileChange(e, `family_members.${index}.avatar_url`, 'profile-pictures', `family_${index}_avatar`)}
                        />
                        <label
                          htmlFor={`admin-family-photo-${index}`}
                          className="btn-primary text-[10px] px-2.5 py-1 flex items-center gap-1 cursor-pointer min-h-[28px] w-fit shadow-sm"
                        >
                          {uploadingField === `family_members.${index}.avatar_url` ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                          {watch(`family_members.${index}.avatar_url`) ? 'Change' : 'Upload'}
                        </label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="label">Certificate Document</label>
                    <div className="flex flex-col gap-1.5 mt-1 bg-cream-50/50 p-3 border border-cream-200 rounded-md min-h-[64px] justify-center">
                      <input
                        type="file"
                        accept=".pdf,image/*"
                        id={`admin-family-certificate-${index}`}
                        className="hidden"
                        onChange={(e) => handleFileChange(e, `family_members.${index}.certificate_url`, 'member-documents', `family_${index}_certificate`)}
                      />
                      <div className="flex items-center gap-2">
                        <label
                          htmlFor={`admin-family-certificate-${index}`}
                          className="btn-primary text-[10px] px-2.5 py-1 flex items-center gap-1 cursor-pointer min-h-[28px] w-fit shadow-sm"
                        >
                          {uploadingField === `family_members.${index}.certificate_url` ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                          {watch(`family_members.${index}.certificate_url`) ? 'Change' : 'Upload'}
                        </label>
                        {watch(`family_members.${index}.certificate_url`) && (
                          <a
                            href={watch(`family_members.${index}.certificate_url`)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-[9px] text-forest-700 font-semibold bg-forest-50 border border-forest-100 rounded px-2 py-0.5 hover:bg-forest-100 transition-colors"
                          >
                            <FileText className="w-3 h-3" />
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
      <div className="card card-gradient-forest space-y-6">
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
