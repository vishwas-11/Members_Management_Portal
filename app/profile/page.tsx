'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/ui/Navbar'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { useForm, useFieldArray, type SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { PlusCircle, Trash2, Loader2, CheckCircle2 } from 'lucide-react'
import type { Member } from '@/types'

const schema = z.object({
  full_name: z.string().min(2),
  address: z.string().min(10),
  age: z.coerce.number().min(18).max(120),
  phone: z.string().regex(/^[6-9]\d{9}$/),
  family_members: z.array(z.object({
    name: z.string().min(2),
    age: z.coerce.number().min(1).max(120),
    relationship: z.string().min(2),
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

  const { register, control, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
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
      reset({
        full_name: data.full_name,
        address: data.address,
        age: data.age,
        phone: data.phone,
        family_members: data.family_members ?? [],
      })
      setLoading(false)
    }
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
    <div className="min-h-screen bg-cream-50">
      <Navbar role={member?.role} />
      <LoadingSpinner />
    </div>
  )

  return (
    <div className="min-h-screen bg-cream-50 relative overflow-hidden pb-12">
      <div className="ambient-glow top-0 right-1/4" />
      <Navbar role={member?.role} userName={member?.full_name} />
      
      <div className="max-w-2xl mx-auto px-6 py-12 relative z-10">
        <div className="border-b border-cream-200 pb-4 mb-8">
          <h1 className="font-serif text-3xl font-normal text-forest-800 tracking-tight">Edit Profile</h1>
          <p className="text-xs text-gray-400 mt-1 font-sans">Update your household registration information and family connections.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-6">
          <div className="card card-gradient-forest space-y-5">
            <h2 className="font-serif text-xl font-normal text-forest-800 border-b border-cream-100 pb-3">Personal Details</h2>
            
            <div>
              <label className="label">Full Name</label>
              <input {...register('full_name')} className="input-field" />
              {errors.full_name && <p className="error-msg">Full name is required</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Age</label>
                <input {...register('age')} type="number" className="input-field" />
                {errors.age && <p className="error-msg">Must be 18+</p>}
              </div>
              <div>
                <label className="label">Phone</label>
                <input {...register('phone')} className="input-field" maxLength={10} />
                {errors.phone && <p className="error-msg">Enter a valid mobile number</p>}
              </div>
            </div>

            <div>
              <label className="label">Aadhaar Number (Read Only)</label>
              <input value={`XXXX XXXX ${member?.aadhaar_number.slice(-4)}`} disabled className="input-field bg-cream-100 text-gray-400 border-cream-200 cursor-not-allowed" />
              <p className="text-[10px] text-gray-400 mt-1.5 font-sans">Aadhaar cannot be changed. Contact administration if corrections are required.</p>
            </div>

            <div>
              <label className="label">Address</label>
              <textarea {...register('address')} className="input-field resize-none !h-auto" rows={3} />
              {errors.address && <p className="error-msg">Enter a valid address</p>}
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
                </div>
              ))}
            </div>

            <button type="button" onClick={() => append({ name: '', age: 0, relationship: '' })}
              className="w-full flex items-center justify-center gap-2 py-3 border border-dashed border-forest-600 text-forest-600 rounded-md text-sm font-medium hover:bg-cream-100 transition-all duration-200 cursor-pointer">
              <PlusCircle className="w-4 h-4" /> Add Family Member
            </button>
          </div>

          {error && <p className="error-msg text-center font-medium">{error}</p>}
          {saved && (
            <div className="flex items-center justify-center gap-2 text-forest-600 text-sm font-medium">
              <CheckCircle2 className="w-4 h-4 animate-bounce" /> Profile updated successfully
            </div>
          )}
          
          <button type="submit" disabled={saving} className="btn-primary w-full flex items-center justify-center gap-2 min-h-[44px]">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {saving ? 'Saving changes...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  )
}
