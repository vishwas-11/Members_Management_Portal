'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { IndianRupee, Upload, FileText, Loader2, CheckCircle2, Clock } from 'lucide-react'
import type { Due } from '@/types'

export default function MemberDuesClient({ initialDues, userId }: { initialDues: Due[], userId: string }) {
  const [dues, setDues] = useState(initialDues)
  const [uploadingFor, setUploadingFor] = useState<string | null>(null)
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null)
  const supabase = createClient()

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    due: Due
  ) => {
    try {
      const file = e.target.files?.[0]
      if (!file) return

      if (file.size > 2 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'File size must be less than 2MB.' })
        return
      }

      setUploadingFor(due.id)
      
      const fileExt = file.name.split('.').pop()
      const randomId = Math.random().toString(36).substring(2, 9)
      const filePath = `${userId}/payment_proof_${due.id}_${randomId}.${fileExt}`

      const { error: uploadErr } = await supabase.storage
        .from('member-documents')
        .upload(filePath, file, { upsert: true })

      if (uploadErr) throw uploadErr

      const { data: { publicUrl } } = supabase.storage
        .from('member-documents')
        .getPublicUrl(filePath)

      const note = notes[due.id] || ''

      const { error: updateErr } = await supabase
        .from('dues')
        .update({ 
          payment_proof_url: publicUrl,
          payment_note: note,
          status: 'submitted'
        })
        .eq('id', due.id)

      if (updateErr) throw updateErr

      setDues(prev => prev.map(d => d.id === due.id ? { ...d, payment_proof_url: publicUrl, payment_note: note, status: 'submitted' } : d))
      setMessage({ type: 'success', text: 'Your payment proof has been successfully submitted and is currently under review by the administration.' })
      
    } catch (err: any) {
      console.error(err)
      setMessage({ type: 'error', text: err.message || 'Failed to submit payment proof' })
    } finally {
      setUploadingFor(null)
    }
  }

  const handleNoteChange = (dueId: string, value: string) => {
    setNotes(prev => ({ ...prev, [dueId]: value }))
  }

  return (
    <div className="bg-[#fcfbf9] border border-[#e8e2d5] rounded-xl shadow-md p-8 relative overflow-hidden">
      {message && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-[#fcfbf9] rounded-xl border border-[#dfd8cb] shadow-2xl w-full max-w-sm p-8 relative overflow-hidden flex flex-col items-center text-center animate-in fade-in zoom-in duration-200">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${message.type === 'success' ? 'bg-emerald-100' : 'bg-red-100'}`}>
              {message.type === 'success' ? (
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              ) : (
                <div className="text-red-600 text-3xl font-bold">!</div>
              )}
            </div>
            <h3 className="font-serif text-xl font-bold text-[#3b2f23] mb-2">
              {message.type === 'success' ? 'Proof Uploaded' : 'Upload Failed'}
            </h3>
            <p className="text-sm text-[#3b2f23]/70 mb-6 font-medium">{message.text}</p>
            <button
              onClick={() => setMessage(null)}
              className="btn-skeu-wood w-full py-2.5 text-sm cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
      {!dues || dues.length === 0 ? (
        <p className="text-sm text-[#3b2f23]/50 text-center py-8 font-medium">No contribution history found.</p>
      ) : (
        <div className="divide-y divide-[#dfd8cb] space-y-5">
          {dues.map((due, i) => (
            <div key={due.id} className={`flex flex-col sm:flex-row sm:items-start justify-between gap-4 ${i > 0 ? 'pt-5' : ''}`}>
              <div className="flex-1">
                <p className="text-sm font-bold text-[#3b2f23]">{due.title}</p>
                <p className="text-[10px] font-mono font-medium tracking-wider text-[#3b2f23]/50 mt-0.5 uppercase">Due: {new Date(due.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                
                {due.status === 'submitted' && (
                  <div className="mt-3 bg-[#e8e2d5]/30 p-3 rounded-lg border border-[#dfd8cb]/50 inline-block">
                    <p className="text-[10px] font-mono uppercase tracking-widest text-[#3b2f23]/60 mb-1 font-bold">Submitted Details</p>
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
                    <p className="text-[11px] text-red-700 font-medium">Please re-upload a valid proof document below.</p>
                  </div>
                )}
              </div>
              
              <div className="flex flex-col items-end gap-3 min-w-[200px]">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-bold text-[#3b2f23]">₹{due.amount.toLocaleString('en-IN')}</span>
                  <span className={`text-[10px] px-3 py-1 rounded-full font-mono uppercase tracking-wider font-bold border shadow-sm ${
                    due.status === 'paid' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 
                    due.status === 'submitted' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                    'bg-rose-50 text-rose-800 border-rose-200'
                  }`}>
                    {due.status}
                  </span>
                </div>
                
                {(due.status === 'pending' || due.status === 'rejected') && (
                  <div className="w-full flex flex-col gap-2 mt-2 bg-white/50 p-3 rounded-lg border border-[#dfd8cb] shadow-sm">
                    <input 
                      type="text" 
                      placeholder="Add a note (optional)..."
                      className="text-xs w-full bg-transparent border-b border-[#dfd8cb] focus:border-[#4a3820] pb-1.5 focus:outline-none transition-colors text-[#3b2f23] placeholder:text-[#3b2f23]/40"
                      value={notes[due.id] || ''}
                      onChange={(e) => handleNoteChange(due.id, e.target.value)}
                    />
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[9px] font-mono uppercase text-[#3b2f23]/40">Max 2MB</span>
                      <input
                        type="file"
                        accept=".pdf,image/*"
                        id={`proof-upload-${due.id}`}
                        className="hidden"
                        onChange={(e) => handleFileChange(e, due)}
                        disabled={uploadingFor === due.id}
                      />
                      <label
                        htmlFor={`proof-upload-${due.id}`}
                        className={`text-[10px] px-3 py-1.5 flex items-center justify-center gap-1.5 rounded-md border font-bold transition-all shadow-sm ${
                          uploadingFor === due.id 
                            ? 'bg-[#dfd8cb] text-[#3b2f23]/50 border-[#dfd8cb] cursor-not-allowed'
                            : 'btn-skeu-clay cursor-pointer'
                        }`}
                      >
                        {uploadingFor === due.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3 h-3" />}
                        {uploadingFor === due.id ? 'Uploading...' : 'Submit Proof'}
                      </label>
                    </div>
                  </div>
                )}
                {due.status === 'submitted' && (
                  <div className="flex items-center gap-1.5 text-amber-700 text-[10px] font-bold mt-1 bg-amber-50/50 px-2 py-1 rounded">
                    <Clock className="w-3 h-3" /> Under Review
                  </div>
                )}
                {due.status === 'paid' && (
                  <div className="flex items-center gap-1.5 text-emerald-700 text-[10px] font-bold mt-1 bg-emerald-50/50 px-2 py-1 rounded">
                    <CheckCircle2 className="w-3 h-3" /> Payment Verified
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
