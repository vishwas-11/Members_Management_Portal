'use client'
import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/ui/Navbar'
import { LeftOliveBranch, RightOliveBranch } from '@/components/ui/OliveBranches'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { useForm, useFieldArray, type SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { PlusCircle, Trash2, Loader2, CheckCircle2, Camera, Upload, FileText, ArrowLeft } from 'lucide-react'
import type { Member } from '@/types'

const schema = z.object({
  full_name: z.string().min(2),
  address: z.string().min(10),
  age: z.coerce.number().min(18).max(120),
  phone: z.string().regex(/^[6-9]\d{9}$/),
  dob: z.string().min(1, 'Date of Birth is required'),
  marital_status: z.enum(['Single', 'Married', 'Widowed', 'Divorced']),
  avatar_url: z.string().optional(),
  certificate_url: z.string().optional(),
  family_members: z.array(z.object({
    name: z.string().min(2),
    age: z.coerce.number().min(1).max(120),
    relationship: z.string().min(2),
    phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number').optional().or(z.literal('')),
    dob: z.string().min(1, 'Date of Birth is required'),
    marital_status: z.enum(['Single', 'Married', 'Widowed', 'Divorced']),
    aadhaar_number: z.string().regex(/^\d{12}$/, 'Aadhaar must be exactly 12 digits'),
    avatar_url: z.string().optional(),
    certificate_url: z.string().optional(),
  })),
})

type FormData = z.infer<typeof schema>

export default function ProfilePage() {
  const supabase = createClient()
  const router = useRouter()
  const [member, setMember] = useState<Member | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null)

  const { register, control, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
  })
  const { fields, append, remove } = useFieldArray({ control, name: 'family_members' })

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data } = await supabase.from('members').select('*').eq('user_id', user.id).single()
      if (!data) { router.push('/register/details'); return }
      setMember(data)
      setAvatarUrl(data.avatar_url || null)
      reset({
        full_name: data.full_name,
        address: data.address,
        age: data.age,
        phone: data.phone,
        dob: data.dob || '',
        marital_status: data.marital_status || '',
        avatar_url: data.avatar_url || '',
        certificate_url: data.certificate_url || '',
        family_members: data.family_members ?? [],
      })
      setLoading(false)
    }
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase()
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true)
      setUploadError('')
      
      const file = e.target.files?.[0]
      if (!file) return

      if (file.size > 2 * 1024 * 1024) {
        setUploadError('Image size must be less than 2MB.')
        setUploading(false)
        return
      }

      if (!file.type.startsWith('image/')) {
        setUploadError('Please select a valid image file (PNG, JPG, JPEG).')
        setUploading(false)
        return
      }

      const reader = new FileReader()
      reader.onload = () => {
        setCropImageSrc(reader.result as string)
        setUploading(false)
      }
      reader.readAsDataURL(file)
      
      // Clear file input value so that selecting the same file triggers change again
      e.target.value = ''
    } catch (err: any) {
      setUploadError(err.message || 'Failed to read image')
      setUploading(false)
    }
  }

  const handleCropComplete = async (blob: Blob) => {
    try {
      setUploading(true)
      setUploadError('')
      
      const fileExt = 'png'
      const filePath = `${member!.user_id}/avatar.${fileExt}`

      // Upload/replace image in the storage bucket
      const { error: uploadErr } = await supabase.storage
        .from('profile-pictures')
        .upload(filePath, blob, { upsert: true })

      if (uploadErr) {
        throw new Error(uploadErr.message)
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(filePath)

      // Update members table in public schema
      const { error: updateErr } = await supabase
        .from('members')
        .update({ avatar_url: publicUrl, updated_at: new Date().toISOString() })
        .eq('id', member!.id)

      if (updateErr) {
        throw new Error(updateErr.message)
      }

      setAvatarUrl(`${publicUrl}?t=${Date.now()}`)
      setValue('avatar_url', publicUrl)
      setCropImageSrc(null)
    } catch (err: any) {
      setUploadError(err.message || 'Failed to upload cropped image')
    } finally {
      setUploading(false)
    }
  }

  const [uploadingField, setUploadingField] = useState<string | null>(null)

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
      const filePath = `${member!.user_id}/${fileType}_${randomId}.${fileExt}`

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

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setSaving(true); setError(''); setSaved(false)
    const { error } = await supabase
      .from('members')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', member!.id)
    setSaving(false)
    if (error) { setError(error.message); return }
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  if (loading) return (
    <div className="min-h-screen bg-linen-green">
      <Navbar role={member?.role} />
      <LoadingSpinner />
    </div>
  )

  const inputClasses = "input-field !border-[#dfd8cb] !bg-white/75 focus:!ring-[#3b2f23]/25 focus:!border-[#3b2f23]/50 text-[#3b2f23]"
  const labelClasses = "font-mono text-[10px] font-bold uppercase tracking-widest text-[#3b2f23]/60 mb-1.5 block"

  return (
    <div className="min-h-screen bg-linen-green relative overflow-hidden pb-24 select-none text-[#faf9f6]">
      <div className="paper-overlay" />

      {/* Decorative absolute background elements */}
      <div className="botanical-flank absolute left-[-150px] md:left-[-100px] top-[5%] w-[450px] md:w-[550px] pointer-events-none select-none z-10 opacity-85 drop-shadow-2xl">
        <LeftOliveBranch />
      </div>
      <div className="botanical-flank absolute right-[-150px] md:right-[-100px] top-[15%] w-[480px] md:w-[580px] pointer-events-none select-none z-10 opacity-85 drop-shadow-2xl">
        <RightOliveBranch />
      </div>
      <div className="botanical-flank absolute right-[-150px] md:right-[-100px] top-[55%] w-[450px] md:w-[550px] pointer-events-none select-none z-0 opacity-85 drop-shadow-2xl transform -scale-y-100">
        <RightOliveBranch />
      </div>
      <div className="botanical-flank absolute left-[-150px] md:left-[-100px] top-[65%] w-[480px] md:w-[580px] pointer-events-none select-none z-0 opacity-85 drop-shadow-2xl transform -scale-y-100">
        <LeftOliveBranch />
      </div>

      <Navbar role={member?.role} userName={member?.full_name} />
      
      <ScrollReveal className="max-w-3xl mx-auto px-6 pt-32 pb-12 relative z-10">
        <div className="flex flex-col sm:flex-row justify-between sm:items-end border-b border-[#faf9f6]/20 pb-5 mb-8 gap-4">
          <div>
            <h1 className="text-4xl sm:text-5xl font-serif font-medium tracking-tight bg-gradient-to-br from-[#fcfbf9] via-[#e8d5b5] to-[#c5b799] bg-clip-text text-transparent drop-shadow-[0_2px_4px_rgba(13,33,25,0.8)]">Edit Profile</h1>
            <p className="text-sm text-[#faf9f6]/70 mt-2 font-sans font-medium drop-shadow-sm">Update your household registration information and family connections.</p>
          </div>
          <Link href="/dashboard" className="btn-premium-outline px-4 py-2 text-xs sm:text-sm flex items-center gap-2 shrink-0">
            <ArrowLeft className="w-4 h-4" /> Dashboard
          </Link>
        </div>

        <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-8">
          <div className="doppelrand-outer shadow-2xl relative z-20">
            <div className="doppelrand-inner p-8 space-y-6">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#ebd2a3] via-[#be9d62] to-[#76592a] z-10" />
              <h2 className="font-serif text-xl font-bold text-[#3b2f23] border-b border-[#dfd8cb] pb-3">Personal Details</h2>
            
            {/* Avatar Upload Section */}
            <div className="flex flex-col sm:flex-row items-center gap-5 pb-5 border-b border-[#dfd8cb]/60">
              <div 
                onClick={() => avatarUrl && setCropImageSrc(avatarUrl)}
                className={`relative group w-20 h-20 rounded-full overflow-hidden bg-gradient-to-br from-[#ebd2a3] to-[#be9d62] flex items-center justify-center text-[#3b2f23] border-2 border-[#fcfbf9] shadow-md flex-shrink-0 ${avatarUrl ? 'cursor-pointer hover:border-[#3b2f23]/50 transition-all' : ''}`}
                title={avatarUrl ? "Click to crop and adjust picture" : undefined}
              >
                {avatarUrl ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={avatarUrl} alt="Profile Picture" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                      <Camera className="w-5 h-5 text-white" />
                    </div>
                  </>
                ) : (
                  <span className="font-serif text-2xl font-bold tracking-wide">{member ? getInitials(member.full_name) : ''}</span>
                )}
                
                {uploading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Loader2 className="w-5 h-5 animate-spin text-white" />
                  </div>
                )}
              </div>

              <div className="flex flex-col items-center sm:items-start gap-1">
                <label htmlFor="avatar-upload" className="btn-premium-outline text-xs px-3.5 py-1.5 flex items-center gap-1.5 cursor-pointer min-h-[36px] w-fit">
                  <Camera className="w-3.5 h-3.5" />
                  {avatarUrl ? 'Change Photo' : 'Upload Photo'}
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  disabled={uploading}
                  className="hidden"
                />
                <p className="text-[10px] font-mono uppercase tracking-widest text-[#3b2f23]/50 mt-1 font-semibold">
                  JPG, JPEG or PNG. Max 2MB.
                </p>
                {uploadError && <p className="text-xs text-red-600 font-medium mt-1">{uploadError}</p>}
              </div>
            </div>

            <div>
              <label className={labelClasses}>Full Name</label>
              <input {...register('full_name')} className={inputClasses} />
              {errors.full_name && <p className="error-msg">Full name is required</p>}
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className={labelClasses}>Age</label>
                <input {...register('age')} type="number" className={inputClasses} />
                {errors.age && <p className="error-msg">Must be 18+</p>}
              </div>
              <div>
                <label className={labelClasses}>Phone</label>
                <input {...register('phone')} className={inputClasses} maxLength={10} />
                {errors.phone && <p className="error-msg">Enter a valid mobile number</p>}
              </div>
            </div>

            <div>
              <label className={labelClasses}>Aadhaar Number (Read Only)</label>
              <input value={`XXXX XXXX ${member?.aadhaar_number.slice(-4)}`} disabled className={`${inputClasses} !bg-[#e8e2d5]/50 !text-[#3b2f23]/50 !cursor-not-allowed`} />
              <p className="text-[10px] text-[#3b2f23]/50 mt-1.5 font-sans font-medium">Aadhaar cannot be changed. Contact administration if corrections are required.</p>
            </div>

            <div>
              <label className={labelClasses}>Address</label>
              <textarea {...register('address')} className={`${inputClasses} resize-none !h-auto`} rows={3} />
              {errors.address && <p className="error-msg">Enter a valid address</p>}
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

            <div>
              <label className={labelClasses}>Baptism/Marriage/Birth Certificate</label>
              <div className="flex flex-col gap-2 mt-1.5 bg-[#f5f3ee] p-5 border border-[#dfd8cb] rounded-lg">
                <input
                  type="file"
                  accept=".pdf,image/*"
                  id="head-certificate-upload"
                  className="hidden"
                  onChange={(e) => handleFileChange(e, 'certificate_url', 'member-documents', 'certificate')}
                />
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <label
                    htmlFor="head-certificate-upload"
                    className="btn-premium-outline text-xs px-3.5 py-1.5 flex items-center justify-center gap-1.5 cursor-pointer min-h-[36px] w-fit"
                  >
                    {uploadingField === 'certificate_url' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                    {watch('certificate_url') ? 'Change Document' : 'Upload Document'}
                  </label>
                  {watch('certificate_url') && (
                    <a
                      href={watch('certificate_url')}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1.5 text-xs text-[#3b2f23] hover:text-[#4a3820] underline-offset-4 hover:underline font-bold transition-colors py-1.5"
                    >
                      <FileText className="w-4 h-4" />
                      <span>View Uploaded Certificate</span>
                    </a>
                  )}
                </div>
                <p className="text-[10px] font-mono uppercase tracking-widest text-[#3b2f23]/50 font-semibold mt-1">
                  PDF, JPG, JPEG or PNG. Max 2MB.
                </p>
              </div>
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
                    <div className="col-span-2 sm:col-span-1">
                      <label className={labelClasses}>Phone (Optional)</label>
                      <input {...register(`family_members.${index}.phone`)} className={inputClasses} maxLength={10} />
                    </div>
                    <div>
                      <label className={labelClasses}>Age</label>
                      <input {...register(`family_members.${index}.age`)} type="number" className={inputClasses} />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
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
                            id={`family-photo-${index}`}
                            className="hidden"
                            onChange={(e) => handleFileChange(e, `family_members.${index}.avatar_url`, 'profile-pictures', `family_${index}_avatar`)}
                          />
                          <label
                            htmlFor={`family-photo-${index}`}
                            className="btn-premium-outline text-[10px] px-3 py-1.5 flex items-center justify-center gap-1.5 cursor-pointer min-h-[32px] w-fit"
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
                          id={`family-certificate-${index}`}
                          className="hidden"
                          onChange={(e) => handleFileChange(e, `family_members.${index}.certificate_url`, 'member-documents', `family_${index}_certificate`)}
                        />
                        <div className="flex items-center gap-3">
                          <label
                            htmlFor={`family-certificate-${index}`}
                            className="btn-premium-outline text-[10px] px-3 py-1.5 flex items-center justify-center gap-1.5 cursor-pointer min-h-[32px] w-fit"
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

            <button type="button" onClick={() => append({ name: '', age: 0, relationship: '', phone: '', dob: '', marital_status: '' as any, aadhaar_number: '', avatar_url: '', certificate_url: '' })}
              className="w-full flex items-center justify-center gap-2 py-3 border border-dashed border-[#dfd8cb] bg-[#f5f3ee]/50 text-[#3b2f23]/70 hover:text-[#3b2f23] rounded-lg text-sm font-bold hover:bg-[#f5f3ee] transition-all duration-200 cursor-pointer">
              <PlusCircle className="w-4 h-4" /> Add Family Member
            </button>
            </div>
          </div>

          {error && <p className="error-msg text-center font-bold text-red-600 bg-red-50 py-2 rounded-md border border-red-100">{error}</p>}
          {saved && (
            <div className="flex items-center justify-center gap-2 text-emerald-800 bg-emerald-50 py-2 rounded-md border border-emerald-100 text-sm font-bold shadow-sm">
              <CheckCircle2 className="w-4 h-4 animate-bounce" /> Profile updated successfully
            </div>
          )}
          
          <button type="submit" disabled={saving} className="btn-premium-solid w-full justify-center group disabled:opacity-50">
            {saving && <Loader2 className="w-5 h-5 animate-spin" />}
            {saving ? 'Saving changes...' : 'Save Changes'}
          </button>
        </form>
      </ScrollReveal>
      {cropImageSrc && (
        <ImageCropModal
          src={cropImageSrc}
          onCrop={handleCropComplete}
          onClose={() => setCropImageSrc(null)}
        />
      )}
    </div>
  )
}

interface ImageCropModalProps {
  src: string
  onCrop: (blob: Blob) => void
  onClose: () => void
}

function ImageCropModal({ src, onCrop, onClose }: ImageCropModalProps) {
  const [zoom, setZoom] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [loading, setLoading] = useState(true)
  const imgRef = useRef<HTMLImageElement>(null)
  
  const cropBoxSize = 250 // Display size of the crop frame

  // When image loads, compute initial layout
  const handleImageLoad = () => {
    if (!imgRef.current) return
    const { naturalWidth, naturalHeight } = imgRef.current
    
    // Scale image so that the shorter dimension matches cropBoxSize
    let displayWidth = cropBoxSize
    let displayHeight = cropBoxSize
    
    if (naturalWidth > naturalHeight) {
      displayWidth = cropBoxSize * (naturalWidth / naturalHeight)
    } else {
      displayHeight = cropBoxSize * (naturalHeight / naturalWidth)
    }
    
    setImageSize({ width: displayWidth, height: displayHeight })
    setPosition({ x: 0, y: 0 }) // Default centered
    setZoom(1)
    setLoading(false)
  }

  // Bounds checker helper
  const getBoundedPosition = (x: number, y: number, currentZoom: number) => {
    if (imageSize.width === 0) return { x, y }
    
    const w_z = imageSize.width * currentZoom
    const h_z = imageSize.height * currentZoom
    
    const maxX = (w_z - cropBoxSize) / 2
    const minX = -maxX
    
    const maxY = (h_z - cropBoxSize) / 2
    const minY = -maxY
    
    return {
      x: Math.max(minX, Math.min(maxX, x)),
      y: Math.max(minY, Math.min(maxY, y))
    }
  }

  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    const newX = e.clientX - dragStart.x
    const newY = e.clientY - dragStart.y
    const bounded = getBoundedPosition(newX, newY, zoom)
    setPosition(bounded)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Touch support for mobile devices
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return
    setIsDragging(true)
    const touch = e.touches[0]
    setDragStart({ x: touch.clientX - position.x, y: touch.clientY - position.y })
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return
    const touch = e.touches[0]
    const newX = touch.clientX - dragStart.x
    const newY = touch.clientY - dragStart.y
    const bounded = getBoundedPosition(newX, newY, zoom)
    setPosition(bounded)
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
  }

  // Zoom slide handler
  const handleZoomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextZoom = parseFloat(e.target.value)
    setZoom(nextZoom)
    // When zooming, make sure the image remains bounded
    setPosition(prev => getBoundedPosition(prev.x, prev.y, nextZoom))
  }

  const handleCrop = () => {
    if (!imgRef.current) return
    
    const canvas = document.createElement('canvas')
    const finalSize = 400 // High-res output square
    canvas.width = finalSize
    canvas.height = finalSize
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = new Image()
    img.crossOrigin = 'anonymous' // Critical for CORS!
    
    img.onload = () => {
      // Scale coordinates from display size (250px) to final resolution (400px)
      const S = finalSize / cropBoxSize
      
      const { naturalWidth, naturalHeight } = img
      
      // Calculate base dimensions on canvas scale
      let baseW = finalSize
      let baseH = finalSize
      if (naturalWidth > naturalHeight) {
        baseW = finalSize * (naturalWidth / naturalHeight)
      } else {
        baseH = finalSize * (naturalHeight / naturalWidth)
      }
      
      const w_z = baseW * zoom
      const h_z = baseH * zoom
      
      const x0 = (finalSize - w_z) / 2
      const y0 = (finalSize - h_z) / 2
      
      const xDraw = x0 + position.x * S
      const yDraw = y0 + position.y * S
      
      // Draw image to canvas
      ctx.drawImage(img, xDraw, yDraw, w_z, h_z)
      
      // Output as blob
      canvas.toBlob((blob) => {
        if (blob) {
          onCrop(blob)
        }
      }, 'image/png')
    }

    img.src = src
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="doppelrand-outer shadow-2xl w-full max-w-sm">
        <div className="doppelrand-inner p-6 relative overflow-hidden flex flex-col items-center animate-in fade-in zoom-in duration-200">
          <h3 className="font-serif text-lg font-bold text-[#3b2f23] border-b border-[#dfd8cb] pb-2.5 w-full text-center mb-5">
            Adjust Profile Picture
          </h3>
        
        {/* Cropper Viewport */}
        <div 
          className="relative w-[250px] h-[250px] rounded-full overflow-hidden bg-[#e8e2d5] border border-[#dfd8cb] shadow-inner cursor-move select-none flex items-center justify-center touch-none"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <Loader2 className="w-6 h-6 animate-spin text-[#3b2f23]/50" />
            </div>
          )}
          
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={imgRef}
            src={src}
            alt="To Crop"
            onLoad={handleImageLoad}
            crossOrigin="anonymous"
            className="absolute max-w-none pointer-events-none"
            style={{
              width: imageSize.width || 'auto',
              height: imageSize.height || 'auto',
              transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
              transformOrigin: 'center center',
            }}
          />
        </div>

        {/* Zoom Controls */}
        <div className="w-full mt-6 space-y-2.5">
          <div className="flex justify-between items-center text-[10px] font-mono font-bold text-[#3b2f23]/60 uppercase tracking-wider">
            <span>Zoom</span>
            <span>{Math.round(zoom * 100)}%</span>
          </div>
          <input
            type="range"
            min="1"
            max="3"
            step="0.01"
            value={zoom}
            onChange={handleZoomChange}
            className="w-full h-1.5 bg-[#dfd8cb] rounded-lg appearance-none cursor-pointer accent-[#4a3820] focus:outline-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 w-full mt-7">
          <button
            onClick={onClose}
            className="flex-1 btn-premium-outline text-xs px-4 py-2 min-h-[36px]"
          >
            Cancel
          </button>
          <button
            onClick={handleCrop}
            className="flex-1 btn-premium-solid group text-xs px-4 py-2 min-h-[36px] flex justify-center"
          >
            Crop & Save
          </button>
        </div>
      </div>
      </div>
    </div>
  )
}
