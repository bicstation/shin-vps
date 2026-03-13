/* ActionArea.tsx */
import MoviePlayerModal from '@/shared/components/organisms/product/MoviePlayerModal';

export default function ActionArea({ product, movieData, isFanza, id, source }) {
  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <a href={product.affiliate_url} target="_blank" rel="nofollow" 
          className="flex items-center justify-center bg-[#e94560] text-white py-6 text-xl font-black italic tracking-widest uppercase hover:bg-white hover:text-[#e94560] transition-all shadow-[0_0_30px_rgba(233,69,96,0.3)] rounded-sm">
          Unlock_Access_Key
        </a>
        {movieData && <MoviePlayerModal videoUrl={movieData.url} title={product.title} isIframe={isFanza} />}
      </div>

      <footer className="pt-10 border-t border-white/10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { label: "Release", val: product.release_date || 'Unknown' },
            { label: "Runtime", val: product.duration ? `${product.duration}m` : '---' },
            { label: "Code", val: product.display_id || id },
            { label: "Origin", val: source }
          ].map((stat, i) => (
            <div key={i}>
              <span className="text-[10px] font-black text-[#e94560] tracking-widest uppercase block mb-1 opacity-60">{stat.label}</span>
              <span className="text-sm font-mono text-white font-bold">{stat.val}</span>
            </div>
          ))}
        </div>
      </footer>
    </div>
  );
}