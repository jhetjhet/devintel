export default function Loading() {
  return (
    <div className="min-h-screen bg-[#05070d] flex flex-col items-center justify-center gap-6">
      <div className="relative w-10 h-10">
        <div className="absolute inset-0 rounded-full border-2 border-white/5" />
        <div className="absolute inset-0 rounded-full border-2 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin" />
      </div>
      <p className="text-[12px] font-mono text-white/20 uppercase tracking-[0.2em]">
        Loading
      </p>
    </div>
  );
}
