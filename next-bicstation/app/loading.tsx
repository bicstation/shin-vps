// /home/maya/shin-dev/shin-vps/next-bicstation/app/loading.tsx

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] bg-black/20 backdrop-blur-sm rounded-3xl border border-white/5">
      {/* サイバーなアニメーション */}
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 border-4 border-pink-500/10 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-t-pink-500 rounded-full animate-spin"></div>
      </div>
      <p className="mt-6 font-mono text-[10px] text-pink-500 uppercase tracking-[0.4em] animate-pulse">
        Fetching_Encrypted_Data...
      </p>
    </div>
  );
}