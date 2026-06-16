'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useForm, useFieldArray, type SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { PlusCircle, Trash2, ChevronRight, ChevronLeft, Loader2, CheckCircle2 } from 'lucide-react'

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
})

const formSchema = z.object({
  full_name: z.string().min(2, 'Full name is required'),
  aadhaar_number: z.string().regex(/^\d{12}$/, 'Aadhaar must be exactly 12 digits'),
  address: z.string().min(10, 'Please enter your full address'),
  age: z.coerce.number().min(18, 'Must be 18 or older').max(120),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'),
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

  const { register, control, handleSubmit, trigger, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: { family_members: [] },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'family_members' })

  const stepFields: Record<number, (keyof FormData)[]> = {
    0: ['full_name', 'aadhaar_number', 'address', 'age', 'phone'],
    1: ['family_members'],
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
    <div className="min-h-screen bg-cream-50 py-12 px-4 relative">
      <div className="ambient-glow top-10 left-10" />
      <div className="max-w-xl mx-auto relative z-10">
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-8 h-8 border border-forest-600 rounded-md flex items-center justify-center bg-white shadow-sm text-forest-600">
            <MethodistLogo className="w-5 h-5" />
          </div>
          <h1 className="font-serif text-2xl font-normal text-forest-800">Member Registration</h1>
        </div>

        {/* Step indicator */}
        <div className="flex items-center mb-8 bg-white border border-cream-200 rounded-lg p-5 shadow-sm">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center flex-1">
              <div className="flex flex-col items-center mx-auto">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-mono font-medium border transition-all duration-300
                  ${i < step ? 'bg-forest-600 border-forest-600 text-white' :
                    i === step ? 'border-forest-600 text-forest-600 bg-cream-50 font-semibold ring-4 ring-forest-600/10' :
                    'border-cream-200 text-gray-400 bg-white'}`}>
                  {i < step ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                </div>
                <span className={`text-[9px] mt-2 font-mono uppercase tracking-[0.12em] ${i === step ? 'text-forest-800 font-semibold' : 'text-gray-400'}`}>{s}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-[1px] mb-5 mx-1 ${i < step ? 'bg-forest-600' : 'bg-cream-200'}`} />
              )}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit as any)}>
          <div className="card card-gradient-forest space-y-6">
            {/* Step 0: Personal Details */}
            {step === 0 && (
              <>
                <div className="border-b border-cream-200 pb-4 mb-2">
                  <h2 className="font-serif text-xl font-normal text-forest-800">Family Head Details</h2>
                  <p className="text-xs text-gray-400 mt-1">Provide primary details for the head of household.</p>
                </div>
                
                <div>
                  <label className="label">Full Name</label>
                  <input {...register('full_name')} className="input-field" placeholder="As per official records" />
                  {errors.full_name && <p className="error-msg">{errors.full_name.message}</p>}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Age</label>
                    <input {...register('age')} type="number" className="input-field" placeholder="35" />
                    {errors.age && <p className="error-msg">{errors.age.message}</p>}
                  </div>
                  <div>
                    <label className="label">Phone Number</label>
                    <input {...register('phone')} className="input-field" placeholder="9876543210" maxLength={10} />
                    {errors.phone && <p className="error-msg">{errors.phone.message}</p>}
                  </div>
                </div>
                
                <div>
                  <label className="label">Aadhaar Number</label>
                  <input {...register('aadhaar_number')} className="input-field" placeholder="12-digit Aadhaar number" maxLength={12} />
                  {errors.aadhaar_number && <p className="error-msg">{errors.aadhaar_number.message}</p>}
                </div>
                
                <div>
                  <label className="label">Residential Address</label>
                  <textarea {...register('address')} className="input-field resize-none !h-auto" rows={3} placeholder="House no., street, locality, city, state, PIN" />
                  {errors.address && <p className="error-msg">{errors.address.message}</p>}
                </div>
              </>
            )}

            {/* Step 1: Family Members */}
            {step === 1 && (
              <>
                <div className="flex items-center justify-between border-b border-cream-200 pb-4 mb-2">
                  <div>
                    <h2 className="font-serif text-xl font-normal text-forest-800">Family Members</h2>
                    <p className="text-xs text-gray-400 mt-1">Add other members in the household.</p>
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-gray-400 bg-cream-100 px-2 py-0.5 rounded">Optional</span>
                </div>

                {fields.length === 0 && (
                  <div className="text-center py-10 border border-dashed border-cream-200 rounded-md bg-cream-50/50">
                    <p className="text-sm text-gray-400">No family members added yet.</p>
                    <p className="text-xs text-gray-400 mt-1">Click the button below to add household members.</p>
                  </div>
                )}

                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <div key={field.id} className="border border-cream-200 rounded-md p-5 space-y-4 bg-cream-50/30 relative">
                      <div className="flex items-center justify-between border-b border-cream-200/60 pb-2">
                        <span className="text-xs font-mono font-medium text-gray-500 uppercase tracking-wider">Member #{index + 1}</span>
                        <button type="button" onClick={() => remove(index)} className="text-red-500 hover:text-red-700 p-1 rounded transition-colors cursor-pointer">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                          <label className="label">Name</label>
                          <input {...register(`family_members.${index}.name`)} className="input-field" placeholder="Full name" />
                          {errors.family_members?.[index]?.name && <p className="error-msg">{errors.family_members[index].name?.message}</p>}
                        </div>
                        <div>
                          <label className="label">Age</label>
                          <input {...register(`family_members.${index}.age`)} type="number" className="input-field" placeholder="Age" />
                        </div>
                        <div>
                          <label className="label">Relationship</label>
                          <select {...register(`family_members.${index}.relationship`)} className="input-field select-clean">
                            <option value="">Select</option>
                            <option>Spouse</option>
                            <option>Son</option>
                            <option>Daughter</option>
                            <option>Father</option>
                            <option>Mother</option>
                            <option>Sibling</option>
                            <option>Other</option>
                          </select>
                          {errors.family_members?.[index]?.relationship && <p className="error-msg">{errors.family_members[index].relationship?.message}</p>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => append({ name: '', age: 0, relationship: '' })}
                  className="w-full flex items-center justify-center gap-2 py-3 border border-dashed border-forest-600 text-forest-600 rounded-md text-sm font-medium hover:bg-cream-100 transition-all duration-200 cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  Add Family Member
                </button>
              </>
            )}

            {/* Step 2: Declaration */}
            {step === 2 && (
              <>
                <div className="border-b border-cream-200 pb-4 mb-2">
                  <h2 className="font-serif text-xl font-normal text-forest-800">Declaration</h2>
                  <p className="text-xs text-gray-400 mt-1">Please read and sign the registration declaration.</p>
                </div>

                <div className="bg-cream-100/70 border border-cream-200 rounded-md p-6 text-sm text-forest-800 space-y-3 leading-relaxed font-sans">
                  <p className="font-mono text-xs uppercase tracking-wider text-forest-600 font-semibold">Member Declaration Form</p>
                  <p>I, <strong>{watch('full_name') || '___________'}</strong>, hereby declare that:</p>
                  <ul className="list-disc list-inside space-y-2 text-gray-600 pl-1">
                    <li>All information provided in this registration is true and correct to the best of my knowledge.</li>
                    <li>I am a bonafide member / regular attendee of this church.</li>
                    <li>I will inform the church administration of any changes to my details promptly.</li>
                    <li>I consent to my information being stored in the digital registry for administrative purposes.</li>
                    <li>This information will remain secured and will not be shared with outside third parties.</li>
                  </ul>
                  <p className="text-[11px] text-gray-400 pt-2 font-mono">
                    Date: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>

                <div className="flex items-start gap-3 pt-2">
                  <input
                    {...register('declaration')}
                    type="checkbox"
                    id="declaration"
                    className="mt-1 w-4 h-4 accent-forest-600 rounded border-cream-200 focus:ring-forest-600 cursor-pointer"
                  />
                  <label htmlFor="declaration" className="text-sm text-gray-600 cursor-pointer select-none leading-snug">
                    I have read and agree to the above declaration. I confirm that all details entered are accurate.
                  </label>
                </div>
                {errors.declaration && <p className="error-msg">{errors.declaration.message}</p>}
                {submitError && <p className="error-msg text-center font-medium">{submitError}</p>}
              </>
            )}
          </div>

          {/* Navigation buttons */}
          <div className="flex justify-between mt-6">
            {step > 0 ? (
              <button type="button" onClick={() => setStep(s => s - 1)} className="btn-secondary min-h-[44px] flex items-center gap-1.5 px-6">
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
            ) : <div />}

            {step < 2 ? (
              <button type="button" onClick={nextStep} className="btn-primary min-h-[44px] flex items-center gap-1.5 px-6 ml-auto">
                Continue <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button type="submit" disabled={submitting} className="btn-primary min-h-[44px] flex items-center gap-2 px-6 ml-auto">
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {submitting ? 'Submitting...' : 'Submit Registration'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
