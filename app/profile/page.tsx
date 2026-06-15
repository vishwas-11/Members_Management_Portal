'use client'
import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/ui/Navbar'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { useForm, useFieldArray, type SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { PlusCircle, Trash2, Loader2, CheckCircle2, Camera } from 'lucide-react'
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
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null)

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
      setAvatarUrl(data.avatar_url || null)
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
      setCropImageSrc(null)
    } catch (err: any) {
      setUploadError(err.message || 'Failed to upload cropped image')
    } finally {
      setUploading(false)
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
            
            {/* Avatar Upload Section */}
            <div className="flex flex-col sm:flex-row items-center gap-5 pb-5 border-b border-cream-100/60">
              <div 
                onClick={() => avatarUrl && setCropImageSrc(avatarUrl)}
                className={`relative group w-20 h-20 rounded-full overflow-hidden bg-gradient-to-br from-forest-600 to-forest-800 flex items-center justify-center text-white border-2 border-cream-200 shadow-md flex-shrink-0 ${avatarUrl ? 'cursor-pointer hover:border-forest-400 transition-all' : ''}`}
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
                  <span className="font-serif text-2xl font-light tracking-wide">{member ? getInitials(member.full_name) : ''}</span>
                )}
                
                {uploading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Loader2 className="w-5 h-5 animate-spin text-white" />
                  </div>
                )}
              </div>

              <div className="flex flex-col items-center sm:items-start gap-1">
                <label htmlFor="avatar-upload" className="btn-primary text-xs px-3.5 py-1.5 flex items-center gap-1.5 cursor-pointer min-h-[36px] w-fit shadow-sm">
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
                <p className="text-[10px] text-gray-400 font-sans mt-1">
                  JPG, JPEG or PNG. Max 2MB.
                </p>
                {uploadError && <p className="text-xs text-red-500 font-medium mt-1">{uploadError}</p>}
              </div>
            </div>

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
    <div className="fixed inset-0 z-55 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="bg-white rounded-lg border border-cream-200 shadow-xl w-full max-w-sm p-6 relative overflow-hidden flex flex-col items-center animate-in fade-in zoom-in duration-200">
        <h3 className="font-serif text-lg font-normal text-forest-800 border-b border-cream-100 pb-2.5 w-full text-center mb-5">
          Adjust Profile Picture
        </h3>
        
        {/* Cropper Viewport */}
        <div 
          className="relative w-[250px] h-[250px] rounded-full overflow-hidden bg-cream-100 border border-cream-200 shadow-inner cursor-move select-none flex items-center justify-center touch-none"
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
              <Loader2 className="w-6 h-6 animate-spin text-forest-600" />
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
          <div className="flex justify-between items-center text-[10px] font-mono text-gray-400 uppercase tracking-wider">
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
            className="w-full h-1.5 bg-cream-200 rounded-lg appearance-none cursor-pointer accent-forest-600 focus:outline-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 w-full mt-7">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-cream-200 hover:border-gray-400 text-gray-500 rounded-md text-xs font-medium bg-white transition-all cursor-pointer min-h-[36px]"
          >
            Cancel
          </button>
          <button
            onClick={handleCrop}
            className="flex-1 btn-primary text-xs px-4 py-2 flex items-center justify-center gap-1.5 min-h-[36px]"
          >
            Crop & Save
          </button>
        </div>
      </div>
    </div>
  )
}
