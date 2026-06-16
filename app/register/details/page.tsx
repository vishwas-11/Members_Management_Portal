'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useForm, useFieldArray, type SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { PlusCircle, Trash2, ChevronRight, ChevronLeft, Loader2, CheckCircle2, Upload, FileText, Camera } from 'lucide-react'

// Custom SVGs for decorative elements to ensure exact match with design
const LeftOliveBranch = () => (
  <svg viewBox="0 0 450 350" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
    <defs>
      <linearGradient id="goldGradLeft" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#dfcfb3" />
        <stop offset="50%" stopColor="#bda37a" />
        <stop offset="100%" stopColor="#806846" />
      </linearGradient>
      <linearGradient id="oliveGradLeft" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#8a9c54" />
        <stop offset="50%" stopColor="#556b2f" />
        <stop offset="100%" stopColor="#2c3a14" />
      </linearGradient>
    </defs>
    <path d="M20,320 C100,280 220,180 280,60" stroke="url(#goldGradLeft)" strokeWidth="3" strokeLinecap="round" />
    <path d="M120,220 C150,180 180,150 210,130" stroke="url(#goldGradLeft)" strokeWidth="1.8" />
    <path d="M70,260 C90,210 130,180 160,165" stroke="url(#goldGradLeft)" strokeWidth="1.8" />

    <path d="M280,60 C300,45 330,55 350,75 C330,85 295,80 280,60 Z" fill="url(#goldGradLeft)" stroke="#5c4a31" strokeWidth="0.5" />
    <path d="M230,110 C250,90 290,85 310,100 C290,115 255,120 230,110 Z" fill="url(#goldGradLeft)" stroke="#5c4a31" strokeWidth="0.5" />
    <path d="M190,140 C210,120 250,125 270,145 C250,155 210,150 190,140 Z" fill="url(#goldGradLeft)" stroke="#5c4a31" strokeWidth="0.5" />
    <path d="M140,180 C160,160 200,165 220,185 C200,195 160,190 140,180 Z" fill="url(#goldGradLeft)" stroke="#5c4a31" strokeWidth="0.5" />
    <path d="M90,225 C115,205 150,210 170,230 C150,240 115,235 90,225 Z" fill="url(#goldGradLeft)" stroke="#5c4a31" strokeWidth="0.5" />

    <g filter="drop-shadow(2px 5px 6px rgba(0,0,0,0.35))">
      <ellipse cx="215" cy="125" rx="12" ry="18" transform="rotate(-30 215 125)" fill="url(#oliveGradLeft)" stroke="#273310" strokeWidth="1" />
      <circle cx="211" cy="120" r="3.5" fill="#ffffff" opacity="0.25" />
      <ellipse cx="130" cy="190" rx="11" ry="17" transform="rotate(40 130 190)" fill="url(#oliveGradLeft)" stroke="#273310" strokeWidth="1" />
      <circle cx="127" cy="185" r="3.5" fill="#ffffff" opacity="0.25" />
      <ellipse cx="255" cy="85" rx="11" ry="17" transform="rotate(10 255 85)" fill="url(#oliveGradLeft)" stroke="#273310" strokeWidth="1" />
      <circle cx="252" cy="80" r="3" fill="#ffffff" opacity="0.25" />
    </g>
  </svg>
)

const RightOliveBranch = () => (
  <svg viewBox="0 0 450 350" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
    <defs>
      <linearGradient id="goldGradRight" x1="100%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#dfcfb3" />
        <stop offset="50%" stopColor="#bda37a" />
        <stop offset="100%" stopColor="#806846" />
      </linearGradient>
      <linearGradient id="oliveGradRight" x1="100%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#8a9c54" />
        <stop offset="50%" stopColor="#556b2f" />
        <stop offset="100%" stopColor="#2c3a14" />
      </linearGradient>
    </defs>
    <path d="M430,320 C350,280 230,180 170,60" stroke="url(#goldGradRight)" strokeWidth="3" strokeLinecap="round" />
    <path d="M330,220 C300,180 270,150 240,130" stroke="url(#goldGradRight)" strokeWidth="1.8" />
    <path d="M380,260 C360,210 320,180 290,165" stroke="url(#goldGradRight)" strokeWidth="1.8" />

    <path d="M170,60 C150,45 120,55 100,75 C120,85 155,80 170,60 Z" fill="url(#goldGradRight)" stroke="#5c4a31" strokeWidth="0.5" />
    <path d="M220,110 C200,90 160,85 140,100 C160,115 195,120 220,110 Z" fill="url(#goldGradRight)" stroke="#5c4a31" strokeWidth="0.5" />
    <path d="M260,140 C240,120 200,125 180,145 C200,155 240,150 260,140 Z" fill="url(#goldGradRight)" stroke="#5c4a31" strokeWidth="0.5" />
    <path d="M310,180 C290,160 250,165 230,185 C250,195 290,190 310,180 Z" fill="url(#goldGradRight)" stroke="#5c4a31" strokeWidth="0.5" />
    <path d="M360,225 C335,205 300,210 280,230 C300,240 335,235 360,225 Z" fill="url(#goldGradRight)" stroke="#5c4a31" strokeWidth="0.5" />

    <g filter="drop-shadow(-2px 5px 6px rgba(0,0,0,0.35))">
      <ellipse cx="235" cy="125" rx="12" ry="18" transform="rotate(30 235 125)" fill="url(#oliveGradRight)" stroke="#273310" strokeWidth="1" />
      <circle cx="239" cy="120" r="3.5" fill="#ffffff" opacity="0.25" />
      <ellipse cx="320" cy="190" rx="11" ry="17" transform="rotate(-40 320 190)" fill="url(#oliveGradRight)" stroke="#273310" strokeWidth="1" />
      <circle cx="323" cy="185" r="3.5" fill="#ffffff" opacity="0.25" />
      <ellipse cx="195" cy="85" rx="11" ry="17" transform="rotate(-10 195 85)" fill="url(#oliveGradRight)" stroke="#273310" strokeWidth="1" />
      <circle cx="198" cy="80" r="3" fill="#ffffff" opacity="0.25" />
    </g>
  </svg>
)

const LetterpressCross = ({ className = "w-6 h-10" }: { className?: string }) => (
  <svg viewBox="0 0 24 36" fill="none" xmlns="http://www.w3.org/2000/svg" className={`${className} filter drop-shadow-[0_1px_0.5px_rgba(255,255,255,0.45)]`}>
    <path 
      d="M 10,0.5 L 14,1.8 L 14,34.2 L 10,35.5 Z M 1,11 L 23,12.2 L 23,15.2 L 1,14 Z" 
      fill="#3b2f23" 
    />
  </svg>
)

const Sparkle = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.15)]">
    <path d="M12,0 L14.5,9.5 L24,12 L14.5,14.5 L12,24 L9.5,14.5 L0,12 L9.5,9.5 Z" fill="#ebd096" opacity="0.8" />
  </svg>
)

const MethodistLogo = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg viewBox="0 0 216 388" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Flame (Red) */}
    <path
      d="m 105.65278,2.875 c 0,0 -2.25,0 -2.25,0 -1.5,9.99997 0.25,36.75 -33.500004,66.5 -11.25,10.5 -50,44.441 -50,87.75 0,43 18.5,69.75 47.5,84.5 29,14.75 30.583,24.166 33.250004,31 -9.500004,-16 -16.500004,-19.25 -35.250004,-27.75 -14.25,-6 -53.75,-14.25 -59.2499999,-86.25 -0.75,-11 -1.5,-38.75 -1.5,-38.75 0,0 -2.25,0 -2.25,0 0,0 -0.25,46.25 -0.25,48.5 0,2.25 -0.5,60.5 1.5,73.25 2,12.75 6,65 66.7499999,71.25 15,1.5 29.25,15.5 32.000004,35.25 2.5,13 4,35.75 4,37 0,0 2,0 2,0 0,0 2,-63.75 -0.5,-85 -2.5,-21.25 -6.5,-40.25 -26.500004,-54.25 -20,-14 -21.25,-15.5 -24.75,-19.75 -3.5,-4.25 -24.5,-27.25 5.25,-58.25 8.75,-10.5 43.250004,-25.5 44.250004,-81 0,0 -0.5,-84 -0.5,-84 z"
      fill="#e4002b"
    />
    {/* Cross (Black/Dark Gray) */}
    <path
      d="m 121.50078,120.54107 c 0,0 -78.099004,0 -78.099004,0 0,0 -6.624,7.6659 -6.624,7.6659 0,0 84.723004,0 84.723004,0 0,0 0,239.168 0,239.168 0,0 7.666,-8.25 7.666,-8.25 0,0 0,-230.918 0,-230.918 0,0 78.526,0 78.526,0 0,0 6.21,-7.6659 6.21,-7.6659 0,0 -84.736,0 -84.736,0 0,0 0,-98.9161 0,-98.9161 0,0 -7.666,8.5469 -7.666,8.5469 0,0 0,90.3742 0,90.3742 0,0 0,-0.005 0,-0.005 z"
      fill="currentColor"
    />
  </svg>
)

const familyMemberSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  age: z.coerce.number().min(1).max(120),
  relationship: z.string().min(2, 'Relationship is required'),
  dob: z.string().min(1, 'Date of Birth is required'),
  marital_status: z.enum(['Single', 'Married', 'Widowed', 'Divorced']),
  aadhaar_number: z.string().regex(/^\d{12}$/, 'Aadhaar must be exactly 12 digits'),
  avatar_url: z.string().optional(),
  certificate_url: z.string().optional(),
})

const formSchema = z.object({
  full_name: z.string().min(2, 'Full name is required'),
  aadhaar_number: z.string().regex(/^\d{12}$/, 'Aadhaar must be exactly 12 digits'),
  address: z.string().min(10, 'Please enter your full address'),
  age: z.coerce.number().min(18, 'Must be 18 or older').max(120),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'),
  dob: z.string().min(1, 'Date of Birth is required'),
  marital_status: z.enum(['Single', 'Married', 'Widowed', 'Divorced']),
  avatar_url: z.string().optional(),
  certificate_url: z.string().optional(),
  family_members: z.array(familyMemberSchema),
  declaration: z.literal(true, { message: 'You must accept the declaration' }),
})

type FormData = z.infer<typeof formSchema>

const STEPS = ['Personal Details', 'Family Members', 'Declaration']

export default function RegisterDetailsPage() {
  const router = useRouter()
  const supabase = createClient()
  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [uploadingField, setUploadingField] = useState<string | null>(null)

  const { register, control, handleSubmit, trigger, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: { family_members: [] },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'family_members' })

  const stepFields: Record<number, (keyof FormData)[]> = {
    0: ['full_name', 'aadhaar_number', 'address', 'age', 'phone', 'dob', 'marital_status'],
    1: ['family_members'],
  }

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
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const fileExt = file.name.split('.').pop()
      const randomId = Math.random().toString(36).substring(2, 9)
      const filePath = `${user.id}/${fileType}_${randomId}.${fileExt}`

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

  const nextStep = async () => {
    const valid = step < 2 ? await trigger(stepFields[step]) : true
    if (valid) setStep(s => s + 1)
  }

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setSubmitting(true)
    setSubmitError('')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { error } = await supabase.from('members').upsert({
      user_id: user.id,
      full_name: data.full_name,
      aadhaar_number: data.aadhaar_number,
      address: data.address,
      age: data.age,
      phone: data.phone,
      dob: data.dob,
      marital_status: data.marital_status,
      avatar_url: data.avatar_url || null,
      certificate_url: data.certificate_url || null,
      role: 'member',
      family_members: data.family_members,
      declaration_signed: true,
      declaration_signed_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })

    setSubmitting(false)
    if (error) { setSubmitError(error.message); return }
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen flex flex-col items-center relative overflow-y-auto bg-linen-green select-none px-4 py-12">
      {/* Paper Noise Overlay for added tactility */}
      <div className="paper-overlay" />

      {/* Decorative absolute background elements */}
      <div className="botanical-flank absolute left-[-80px] md:left-[-30px] top-[10%] w-[260px] md:w-[380px] pointer-events-none select-none z-10 opacity-90">
        <LeftOliveBranch />
      </div>
      <div className="botanical-flank absolute right-[-80px] md:right-[-30px] top-[8%] w-[280px] md:w-[400px] pointer-events-none select-none z-10 opacity-90">
        <RightOliveBranch />
      </div>

      {/* Scattered sparkles */}
      <div className="absolute left-[15%] top-[10%] pointer-events-none select-none z-10 opacity-70">
        <Sparkle />
      </div>
      <div className="absolute left-[8%] bottom-[15%] pointer-events-none select-none z-10 opacity-75">
        <Sparkle />
      </div>
      <div className="absolute right-[20%] top-[12%] pointer-events-none select-none z-10 opacity-70">
        <Sparkle />
      </div>
      <div className="absolute right-[6%] bottom-[12%] pointer-events-none select-none z-10 opacity-60">
        <Sparkle />
      </div>

      <div className="w-full max-w-xl relative z-20">
        {/* Header Badge Plaque */}
        <div className="flex flex-col items-center mb-8">
          <div className="mb-4 flex justify-center">
            <LetterpressCross className="w-6 h-9" />
          </div>

          <div className="mb-4 flex items-center justify-center gap-3">
            <span className="skeu-line w-10" />
            <span className="font-sans text-[10px] font-bold uppercase tracking-[0.18em] text-[#3b2f23]/85">
              Registration Wizard
            </span>
            <span className="skeu-line w-10" />
          </div>

          <h1 className="text-skeu-heading text-4xl font-normal tracking-tight text-center mb-1">
            Member Registration
          </h1>
          
          <p className="font-sans text-[10.5px] uppercase tracking-widest text-[#3b2f23]/60 text-center mt-2 font-semibold">
            Complete your profile details
          </p>
        </div>

        {/* Tactile Plaque Step indicator */}
        <div className="flex items-center mb-8 bg-[#fdfcf9] border border-[#ebdcb9] border-t-[#f7eecf] border-left-[#f7eecf] rounded-lg p-5 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#ebd2a3] via-[#be9d62] to-[#ebd2a3]" />
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center flex-1">
              <div className="flex flex-col items-center mx-auto">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-mono font-bold border transition-all duration-300
                  ${i < step ? 'bg-forest-600 border-forest-600 text-white' :
                    i === step ? 'border-forest-600 text-forest-600 bg-[#f7f6f0] font-bold ring-4 ring-forest-600/10' :
                    'border-[#dfd8cb] text-gray-400 bg-white'}`}>
                  {i < step ? <CheckCircle2 className="w-4 h-4 text-white" /> : i + 1}
                </div>
                <span className={`text-[9px] mt-2 font-mono uppercase tracking-[0.12em] ${i === step ? 'text-[#3b2f23] font-bold' : 'text-gray-400'}`}>
                  {s}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-[1.5px] mb-5 mx-1 ${i < step ? 'bg-forest-600' : 'bg-[#dfd8cb]'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Premium Plaque Form Card */}
        <form onSubmit={handleSubmit(onSubmit as any)}>
          <div className="bg-[#fcfbf9] border border-[#e8e2d5] rounded-xl shadow-xl p-8 relative overflow-hidden">
            {/* Top Gold Ribbon Accent */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#ebd2a3] via-[#be9d62] to-[#76592a]" />

            <div className="space-y-6">
              {/* Step 0: Personal Details */}
              {step === 0 && (
                <>
                  <div className="border-b border-[#dfd8cb] pb-4 mb-5">
                    <h2 className="font-serif text-xl font-bold text-[#3b2f23]">Family Head Details</h2>
                    <p className="text-xs text-[#3b2f23]/60 mt-1 font-sans">Provide primary details for the head of household.</p>
                  </div>
                  
                  <div>
                    <label className="label text-[#3b2f23]/70 font-mono text-[10px] uppercase tracking-wider">
                      Full Name
                    </label>
                    <input 
                      {...register('full_name')} 
                      className="input-field !border-[#dfd8cb] !bg-white/75 focus:!ring-[#3b2f23]/25 focus:!border-[#3b2f23]/50 text-[#3b2f23]" 
                      placeholder="As per official records" 
                    />
                    {errors.full_name && <p className="error-msg text-xs mt-1 text-red-600">{errors.full_name.message}</p>}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label text-[#3b2f23]/70 font-mono text-[10px] uppercase tracking-wider">
                        Age
                      </label>
                      <input 
                        {...register('age')} 
                        type="number" 
                        className="input-field !border-[#dfd8cb] !bg-white/75 focus:!ring-[#3b2f23]/25 focus:!border-[#3b2f23]/50 text-[#3b2f23]" 
                        placeholder="35" 
                      />
                      {errors.age && <p className="error-msg text-xs mt-1 text-red-600">{errors.age.message}</p>}
                    </div>
                    <div>
                      <label className="label text-[#3b2f23]/70 font-mono text-[10px] uppercase tracking-wider">
                        Phone Number
                      </label>
                      <input 
                        {...register('phone')} 
                        className="input-field !border-[#dfd8cb] !bg-white/75 focus:!ring-[#3b2f23]/25 focus:!border-[#3b2f23]/50 text-[#3b2f23]" 
                        placeholder="9876543210" 
                        maxLength={10} 
                      />
                      {errors.phone && <p className="error-msg text-xs mt-1 text-red-600">{errors.phone.message}</p>}
                    </div>
                  </div>
                  
                  <div>
                    <label className="label text-[#3b2f23]/70 font-mono text-[10px] uppercase tracking-wider">
                      Aadhaar Number
                    </label>
                    <input 
                      {...register('aadhaar_number')} 
                      className="input-field !border-[#dfd8cb] !bg-white/75 focus:!ring-[#3b2f23]/25 focus:!border-[#3b2f23]/50 text-[#3b2f23]" 
                      placeholder="12-digit Aadhaar number" 
                      maxLength={12} 
                    />
                    {errors.aadhaar_number && <p className="error-msg text-xs mt-1 text-red-600">{errors.aadhaar_number.message}</p>}
                  </div>
                  
                  <div>
                    <label className="label text-[#3b2f23]/70 font-mono text-[10px] uppercase tracking-wider">
                      Residential Address
                    </label>
                    <textarea 
                      {...register('address')} 
                      className="input-field resize-none !h-auto py-3 !border-[#dfd8cb] !bg-white/75 focus:!ring-[#3b2f23]/25 focus:!border-[#3b2f23]/50 text-[#3b2f23]" 
                      rows={3} 
                      placeholder="House no., street, locality, city, state, PIN" 
                    />
                    {errors.address && <p className="error-msg text-xs mt-1 text-red-600">{errors.address.message}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label text-[#3b2f23]/70 font-mono text-[10px] uppercase tracking-wider">
                        Date of Birth
                      </label>
                      <input 
                        {...register('dob')} 
                        type="date" 
                        className="input-field !border-[#dfd8cb] !bg-white/75 focus:!ring-[#3b2f23]/25 focus:!border-[#3b2f23]/50 text-[#3b2f23] font-mono" 
                      />
                      {errors.dob && <p className="error-msg text-xs mt-1 text-red-600">{errors.dob.message}</p>}
                    </div>
                    <div>
                      <label className="label text-[#3b2f23]/70 font-mono text-[10px] uppercase tracking-wider">
                        Marital Status
                      </label>
                      <select 
                        {...register('marital_status')} 
                        className="input-field select-clean !border-[#dfd8cb] !bg-white/75 focus:!ring-[#3b2f23]/25 focus:!border-[#3b2f23]/50 text-[#3b2f23]"
                      >
                        <option value="">Select</option>
                        <option value="Single">Single</option>
                        <option value="Married">Married</option>
                        <option value="Widowed">Widowed</option>
                        <option value="Divorced">Divorced</option>
                      </select>
                      {errors.marital_status && <p className="error-msg text-xs mt-1 text-red-600">{errors.marital_status.message}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="label text-[#3b2f23]/70 font-mono text-[10px] uppercase tracking-wider">
                        Upload Photo
                      </label>
                      <div className="flex items-center gap-4 mt-1 bg-white/50 p-3 rounded-lg border border-[#dfd8cb] shadow-sm">
                        <div className="w-14 h-14 rounded-full overflow-hidden bg-forest-100 border border-[#dfd8cb]/80 flex items-center justify-center text-[#3b2f23]/40 shrink-0">
                          {watch('avatar_url') ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={watch('avatar_url')} alt="Preview" className="w-full h-full object-cover" />
                          ) : (
                            <Camera className="w-5 h-5" />
                          )}
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <input
                            type="file"
                            accept="image/*"
                            id="head-photo-upload"
                            className="hidden"
                            onChange={(e) => handleFileChange(e, 'avatar_url', 'profile-pictures', 'avatar')}
                          />
                          <label
                            htmlFor="head-photo-upload"
                            className="btn-skeu-clay py-1 px-2.5 text-[10px] font-bold tracking-wider uppercase cursor-pointer flex items-center justify-center gap-1 min-h-[30px] w-fit shadow-sm"
                          >
                            {uploadingField === 'avatar_url' ? <Loader2 className="w-3 h-3 animate-spin text-[#3b2f23]" /> : <Upload className="w-3 h-3" />}
                            {watch('avatar_url') ? 'Change' : 'Upload'}
                          </label>
                          <span className="text-[8px] text-[#3b2f23]/40">Max 2MB (JPG/PNG)</span>
                        </div>
                      </div>
                      {errors.avatar_url && <p className="error-msg text-xs mt-1 text-red-600">{errors.avatar_url.message}</p>}
                    </div>

                    <div>
                      <label className="label text-[#3b2f23]/70 font-mono text-[10px] uppercase tracking-wider">
                        Baptism/Marriage/Birth Certificate
                      </label>
                      <div className="flex flex-col gap-1.5 mt-1 bg-white/50 p-3 rounded-lg border border-[#dfd8cb] shadow-sm min-h-[70px] justify-center">
                        <input
                          type="file"
                          accept=".pdf,image/*"
                          id="head-certificate-upload"
                          className="hidden"
                          onChange={(e) => handleFileChange(e, 'certificate_url', 'member-documents', 'certificate')}
                        />
                        <div className="flex items-center gap-2">
                          <label
                            htmlFor="head-certificate-upload"
                            className="btn-skeu-clay py-1 px-2.5 text-[10px] font-bold tracking-wider uppercase cursor-pointer flex items-center justify-center gap-1 min-h-[30px] w-fit shadow-sm"
                          >
                            {uploadingField === 'certificate_url' ? <Loader2 className="w-3 h-3 animate-spin text-[#3b2f23]" /> : <Upload className="w-3 h-3" />}
                            {watch('certificate_url') ? 'Change' : 'Upload'}
                          </label>
                          {watch('certificate_url') && (
                            <div className="flex items-center gap-1 text-[10px] text-forest-700 font-semibold bg-forest-50 border border-forest-100 rounded px-2 py-0.5">
                              <FileText className="w-3 h-3" />
                              <span>Uploaded</span>
                            </div>
                          )}
                        </div>
                        <span className="text-[8px] text-[#3b2f23]/40">PDF, JPG, PNG (Max 2MB)</span>
                      </div>
                      {errors.certificate_url && <p className="error-msg text-xs mt-1 text-red-600">{errors.certificate_url.message}</p>}
                    </div>
                  </div>
                </>
              )}

              {/* Step 1: Family Members */}
              {step === 1 && (
                <>
                  <div className="flex items-center justify-between border-b border-[#dfd8cb] pb-4 mb-5">
                    <div>
                      <h2 className="font-serif text-xl font-bold text-[#3b2f23]">Family Members</h2>
                      <p className="text-xs text-[#3b2f23]/60 mt-1 font-sans">Add other members in the household.</p>
                    </div>
                    <span className="text-[9px] font-mono uppercase tracking-widest text-[#3b2f23]/50 bg-[#f7f6f0] px-2 py-0.5 rounded border border-[#dfd8cb]/60 font-semibold">
                      Optional
                    </span>
                  </div>

                  {fields.length === 0 && (
                    <div className="text-center py-10 border border-dashed border-[#be9d62]/50 rounded-lg bg-[#f7f6f0]/50 shadow-inner">
                      <p className="text-sm text-[#3b2f23]/60 font-semibold">No family members added yet.</p>
                      <p className="text-xs text-[#3b2f23]/40 mt-1">Click the button below to add household members.</p>
                    </div>
                  )}

                  <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                    {fields.map((field, index) => (
                      <div key={field.id} className="border border-[#dfd8cb] rounded-lg p-5 space-y-4 bg-[#f7f6f0]/40 relative shadow-sm">
                        <div className="flex items-center justify-between border-b border-[#dfd8cb]/60 pb-2">
                          <span className="text-xs font-mono font-bold text-[#3b2f23]/50 uppercase tracking-wider">
                            Member #{index + 1}
                          </span>
                          <button 
                            type="button" 
                            onClick={() => remove(index)} 
                            className="text-red-500 hover:text-red-700 p-1 rounded transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="col-span-2">
                            <label className="label text-[#3b2f23]/70 font-mono text-[10px] uppercase tracking-wider">
                              Name
                            </label>
                            <input 
                              {...register(`family_members.${index}.name`)} 
                              className="input-field !border-[#dfd8cb] !bg-white/75 focus:!ring-[#3b2f23]/25 focus:!border-[#3b2f23]/50 text-[#3b2f23]" 
                              placeholder="Full name" 
                            />
                            {errors.family_members?.[index]?.name && (
                              <p className="error-msg text-xs mt-1 text-red-600">{errors.family_members[index].name?.message}</p>
                            )}
                          </div>
                          
                          <div>
                            <label className="label text-[#3b2f23]/70 font-mono text-[10px] uppercase tracking-wider">
                              Age
                            </label>
                            <input 
                              {...register(`family_members.${index}.age`)} 
                              type="number" 
                              className="input-field !border-[#dfd8cb] !bg-white/75 focus:!ring-[#3b2f23]/25 focus:!border-[#3b2f23]/50 text-[#3b2f23]" 
                              placeholder="Age" 
                            />
                            {errors.family_members?.[index]?.age && (
                              <p className="error-msg text-xs mt-1 text-red-600">{errors.family_members[index].age?.message}</p>
                            )}
                          </div>
                          
                          <div>
                            <label className="label text-[#3b2f23]/70 font-mono text-[10px] uppercase tracking-wider">
                              Relationship
                            </label>
                            <select 
                              {...register(`family_members.${index}.relationship`)} 
                              className="input-field select-clean !border-[#dfd8cb] !bg-white/75 focus:!ring-[#3b2f23]/25 focus:!border-[#3b2f23]/50 text-[#3b2f23]"
                            >
                              <option value="">Select</option>
                              <option>Spouse</option>
                              <option>Son</option>
                              <option>Daughter</option>
                              <option>Father</option>
                              <option>Mother</option>
                              <option>Sibling</option>
                              <option>Other</option>
                            </select>
                            {errors.family_members?.[index]?.relationship && (
                              <p className="error-msg text-xs mt-1 text-red-600">{errors.family_members[index].relationship?.message}</p>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="label text-[#3b2f23]/70 font-mono text-[10px] uppercase tracking-wider">
                              Date of Birth
                            </label>
                            <input 
                              {...register(`family_members.${index}.dob`)} 
                              type="date" 
                              className="input-field !border-[#dfd8cb] !bg-white/75 focus:!ring-[#3b2f23]/25 focus:!border-[#3b2f23]/50 text-[#3b2f23] font-mono" 
                            />
                            {errors.family_members?.[index]?.dob && (
                              <p className="error-msg text-xs mt-1 text-red-600">{errors.family_members[index].dob?.message}</p>
                            )}
                          </div>
                          <div>
                            <label className="label text-[#3b2f23]/70 font-mono text-[10px] uppercase tracking-wider">
                              Marital Status
                            </label>
                            <select 
                              {...register(`family_members.${index}.marital_status`)} 
                              className="input-field select-clean !border-[#dfd8cb] !bg-white/75 focus:!ring-[#3b2f23]/25 focus:!border-[#3b2f23]/50 text-[#3b2f23]"
                            >
                              <option value="">Select</option>
                              <option value="Single">Single</option>
                              <option value="Married">Married</option>
                              <option value="Widowed">Widowed</option>
                              <option value="Divorced">Divorced</option>
                            </select>
                            {errors.family_members?.[index]?.marital_status && (
                              <p className="error-msg text-xs mt-1 text-red-600">{errors.family_members[index].marital_status?.message}</p>
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="label text-[#3b2f23]/70 font-mono text-[10px] uppercase tracking-wider">
                            Aadhaar Number
                          </label>
                          <input 
                            {...register(`family_members.${index}.aadhaar_number`)} 
                            className="input-field !border-[#dfd8cb] !bg-white/75 focus:!ring-[#3b2f23]/25 focus:!border-[#3b2f23]/50 text-[#3b2f23]" 
                            placeholder="12-digit Aadhaar number" 
                            maxLength={12} 
                          />
                          {errors.family_members?.[index]?.aadhaar_number && (
                            <p className="error-msg text-xs mt-1 text-red-600">{errors.family_members[index].aadhaar_number?.message}</p>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                          <div>
                            <label className="label text-[#3b2f23]/70 font-mono text-[10px] uppercase tracking-wider">
                              Upload Photo
                            </label>
                            <div className="flex items-center gap-4 mt-1 bg-white/50 p-3 rounded-lg border border-[#dfd8cb] shadow-sm">
                              <div className="w-14 h-14 rounded-full overflow-hidden bg-forest-100 border border-[#dfd8cb]/80 flex items-center justify-center text-[#3b2f23]/40 shrink-0">
                                {watch(`family_members.${index}.avatar_url`) ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img src={watch(`family_members.${index}.avatar_url`)} alt="Preview" className="w-full h-full object-cover" />
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
                                  className="btn-skeu-clay py-1 px-2.5 text-[10px] font-bold tracking-wider uppercase cursor-pointer flex items-center justify-center gap-1 min-h-[30px] w-fit shadow-sm"
                                >
                                  {uploadingField === `family_members.${index}.avatar_url` ? <Loader2 className="w-3 h-3 animate-spin text-[#3b2f23]" /> : <Upload className="w-3 h-3" />}
                                  {watch(`family_members.${index}.avatar_url`) ? 'Change' : 'Upload'}
                                </label>
                                <span className="text-[8px] text-[#3b2f23]/40">Max 2MB (JPG/PNG)</span>
                              </div>
                            </div>
                          </div>

                          <div>
                            <label className="label text-[#3b2f23]/70 font-mono text-[10px] uppercase tracking-wider">
                              Baptism/Marriage/Birth Certificate
                            </label>
                            <div className="flex flex-col gap-1.5 mt-1 bg-white/50 p-3 rounded-lg border border-[#dfd8cb] shadow-sm min-h-[70px] justify-center">
                              <input
                                type="file"
                                accept=".pdf,image/*"
                                id={`family-certificate-${index}`}
                                className="hidden"
                                onChange={(e) => handleFileChange(e, `family_members.${index}.certificate_url`, 'member-documents', `family_${index}_certificate`)}
                              />
                              <div className="flex items-center gap-2">
                                <label
                                  htmlFor={`family-certificate-${index}`}
                                  className="btn-skeu-clay py-1 px-2.5 text-[10px] font-bold tracking-wider uppercase cursor-pointer flex items-center justify-center gap-1 min-h-[30px] w-fit shadow-sm"
                                >
                                  {uploadingField === `family_members.${index}.certificate_url` ? <Loader2 className="w-3 h-3 animate-spin text-[#3b2f23]" /> : <Upload className="w-3 h-3" />}
                                  {watch(`family_members.${index}.certificate_url`) ? 'Change' : 'Upload'}
                                </label>
                                {watch(`family_members.${index}.certificate_url`) && (
                                  <div className="flex items-center gap-1 text-[10px] text-forest-700 font-semibold bg-forest-50 border border-forest-100 rounded px-2 py-0.5">
                                    <FileText className="w-3 h-3" />
                                    <span>Uploaded</span>
                                  </div>
                                )}
                              </div>
                              <span className="text-[8px] text-[#3b2f23]/40">PDF, JPG, PNG (Max 2MB)</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => append({ name: '', age: 0, relationship: '', dob: '', marital_status: '' as any, aadhaar_number: '', avatar_url: '', certificate_url: '' })}
                    className="w-full flex items-center justify-center gap-2 py-3 border border-dashed border-[#be9d62] text-[#3b2f23] rounded-lg text-sm font-semibold hover:bg-[#f7f6f0] transition-all duration-200 cursor-pointer shadow-sm mt-2"
                  >
                    <PlusCircle className="w-4 h-4 text-[#be9d62]" />
                    <span>Add Family Member</span>
                  </button>
                </>
              )}

              {/* Step 2: Declaration */}
              {step === 2 && (
                <>
                  <div className="border-b border-[#dfd8cb] pb-4 mb-5">
                    <h2 className="font-serif text-xl font-bold text-[#3b2f23]">Declaration & Review</h2>
                    <p className="text-xs text-[#3b2f23]/60 mt-1 font-sans">Please review your details and sign the registration declaration.</p>
                  </div>

                  <div className="space-y-6 mb-6">
                    <div className="bg-[#f7f6f0]/50 border border-[#dfd8cb] rounded-lg p-5 shadow-sm">
                      <h3 className="font-serif text-lg font-bold text-[#3b2f23] mb-3 border-b border-[#dfd8cb]/50 pb-2">Family Head Summary</h3>
                      <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs font-sans">
                        <div><span className="text-[#3b2f23]/50 uppercase tracking-wider text-[9px] block mb-0.5 font-bold">Name</span> <span className="font-semibold text-[#3b2f23]">{watch('full_name') || '-'}</span></div>
                        <div><span className="text-[#3b2f23]/50 uppercase tracking-wider text-[9px] block mb-0.5 font-bold">Age</span> <span className="font-semibold text-[#3b2f23]">{watch('age') || '-'}</span></div>
                        <div><span className="text-[#3b2f23]/50 uppercase tracking-wider text-[9px] block mb-0.5 font-bold">DOB</span> <span className="font-semibold text-[#3b2f23]">{watch('dob') ? new Date(watch('dob')).toLocaleDateString('en-GB') : '-'}</span></div>
                        <div><span className="text-[#3b2f23]/50 uppercase tracking-wider text-[9px] block mb-0.5 font-bold">Marital Status</span> <span className="font-semibold text-[#3b2f23]">{watch('marital_status') || '-'}</span></div>
                        <div className="col-span-2"><span className="text-[#3b2f23]/50 uppercase tracking-wider text-[9px] block mb-0.5 font-bold">Aadhaar</span> <span className="font-semibold text-[#3b2f23] font-mono">{watch('aadhaar_number') || '-'}</span></div>
                        <div><span className="text-[#3b2f23]/50 uppercase tracking-wider text-[9px] block mb-0.5 font-bold">Photo</span> <span className="font-semibold text-[#3b2f23]">{watch('avatar_url') ? '✓ Uploaded' : 'Pending'}</span></div>
                        <div><span className="text-[#3b2f23]/50 uppercase tracking-wider text-[9px] block mb-0.5 font-bold">Certificate</span> <span className="font-semibold text-[#3b2f23]">{watch('certificate_url') ? '✓ Uploaded' : 'Pending'}</span></div>
                      </div>
                    </div>

                    {watch('family_members')?.length > 0 && (
                      <div className="bg-[#f7f6f0]/50 border border-[#dfd8cb] rounded-lg p-5 shadow-sm">
                        <h3 className="font-serif text-lg font-bold text-[#3b2f23] mb-3 border-b border-[#dfd8cb]/50 pb-2">Family Members Summary</h3>
                        <div className="space-y-4">
                          {watch('family_members').map((member, idx) => (
                            <div key={idx} className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs font-sans bg-white/60 p-4 rounded-md border border-[#dfd8cb]/50 shadow-sm relative overflow-hidden">
                              <div className="absolute top-0 left-0 w-1 h-full bg-forest-600/30" />
                              <div><span className="text-[#3b2f23]/50 uppercase tracking-wider text-[9px] block mb-0.5 font-bold">Name</span> <span className="font-semibold text-[#3b2f23]">{member.name || '-'}</span></div>
                              <div><span className="text-[#3b2f23]/50 uppercase tracking-wider text-[9px] block mb-0.5 font-bold">Relation</span> <span className="font-semibold text-[#3b2f23]">{member.relationship || '-'}</span></div>
                              <div><span className="text-[#3b2f23]/50 uppercase tracking-wider text-[9px] block mb-0.5 font-bold">Age</span> <span className="font-semibold text-[#3b2f23]">{member.age || '-'}</span></div>
                              <div><span className="text-[#3b2f23]/50 uppercase tracking-wider text-[9px] block mb-0.5 font-bold">DOB</span> <span className="font-semibold text-[#3b2f23]">{member.dob ? new Date(member.dob).toLocaleDateString('en-GB') : '-'}</span></div>
                              <div><span className="text-[#3b2f23]/50 uppercase tracking-wider text-[9px] block mb-0.5 font-bold">Marital Status</span> <span className="font-semibold text-[#3b2f23]">{member.marital_status || '-'}</span></div>
                              <div className="col-span-2"><span className="text-[#3b2f23]/50 uppercase tracking-wider text-[9px] block mb-0.5 font-bold">Aadhaar</span> <span className="font-semibold text-[#3b2f23] font-mono">{member.aadhaar_number || '-'}</span></div>
                              <div><span className="text-[#3b2f23]/50 uppercase tracking-wider text-[9px] block mb-0.5 font-bold">Photo</span> <span className="font-semibold text-[#3b2f23]">{member.avatar_url ? '✓ Uploaded' : 'Pending'}</span></div>
                              <div><span className="text-[#3b2f23]/50 uppercase tracking-wider text-[9px] block mb-0.5 font-bold">Certificate</span> <span className="font-semibold text-[#3b2f23]">{member.certificate_url ? '✓ Uploaded' : 'Pending'}</span></div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Tactile Parchment Declaration box */}
                  <div className="bg-[#f7f6f0] border border-[#dfd8cb] rounded-lg p-6 text-sm text-[#3b2f23] space-y-3 leading-relaxed font-sans shadow-inner">
                    <p className="font-mono text-xs uppercase tracking-widest text-[#be9d62] font-bold">
                      Member Declaration Form
                    </p>
                    
                    <p>I, <strong>{watch('full_name') || '___________'}</strong>, hereby declare that:</p>
                    
                    <ul className="list-disc list-inside space-y-2 text-[#3b2f23]/80 pl-1 text-xs">
                      <li>All information provided in this registration is true and correct to the best of my knowledge.</li>
                      <li>I am a bonafide member / regular attendee of this church.</li>
                      <li>I will inform the church administration of any changes to my details promptly.</li>
                      <li>I consent to my information being stored in the digital registry for administrative purposes.</li>
                      <li>This information will remain secured and will not be shared with outside third parties.</li>
                    </ul>
                    
                    <p className="text-[10px] text-[#3b2f23]/50 pt-2 border-t border-[#dfd8cb]/50 font-mono">
                      Date: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>

                  <div className="flex items-start gap-3 pt-2">
                    <input
                      {...register('declaration')}
                      type="checkbox"
                      id="declaration"
                      className="mt-1 w-4 h-4 accent-forest-600 rounded border-[#dfd8cb] focus:ring-forest-600 cursor-pointer"
                    />
                    <label htmlFor="declaration" className="text-xs text-[#3b2f23]/80 cursor-pointer select-none leading-snug font-medium">
                      I have read and agree to the above declaration. I confirm that all details entered are accurate.
                    </label>
                  </div>
                  
                  {errors.declaration && <p className="error-msg text-xs text-red-600 mt-1">{errors.declaration.message}</p>}
                  {submitError && <p className="error-msg text-xs text-red-600 text-center font-medium mt-1">{submitError}</p>}
                </>
              )}
            </div>
          </div>

          {/* Navigation buttons - Styled in Plaque Theme */}
          <div className="flex justify-between mt-6">
            {step > 0 ? (
              <button 
                type="button" 
                onClick={() => setStep(s => s - 1)} 
                className="btn-skeu-clay min-h-[44px] flex items-center justify-center gap-1.5 px-6 font-semibold select-none cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
            ) : <div />}

            {step < 2 ? (
              <button 
                type="button" 
                onClick={nextStep} 
                className="btn-skeu-wood min-h-[44px] flex items-center justify-center gap-1.5 px-6 font-semibold select-none cursor-pointer ml-auto"
              >
                Continue <ChevronRight className="w-4 h-4 text-[#ebd096]" />
              </button>
            ) : (
              <button 
                type="submit" 
                disabled={submitting} 
                className="btn-skeu-wood min-h-[44px] flex items-center justify-center gap-2 px-6 font-semibold select-none cursor-pointer ml-auto"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin text-[#ebd096]" />}
                <span>{submitting ? 'Submitting...' : 'Submit Registration'}</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
