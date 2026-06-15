export default function LoadingSpinner({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] gap-3 relative z-10">
      <div className="w-8 h-8 border-[3px] border-cream-200 border-t-forest-600 rounded-full animate-spin" />
      <p className="text-sm text-gray-400 font-mono uppercase tracking-widest text-[10px]">{text}</p>
    </div>
  )
}
