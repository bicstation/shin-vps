/* TechnicalMeta.tsx */
import Link from 'next/link';

export default function TechnicalMeta({ product, getIdentifier }) {
  return (
    <div className="bg-white/[0.02] p-8 border border-white/5 rounded-2xl space-y-10">
      {product.actresses?.length > 0 && (
        <div className="pb-8 border-b border-white/5 last:border-0 last:pb-0">
          <span className="text-[10px] text-[#e94560] font-black uppercase tracking-widest block mb-4 italic">Archive_Cast</span>
          <div className="flex flex-wrap gap-3">
            {product.actresses.map((a) => (
              <Link key={a.id} href={`/actress/${getIdentifier(a)}`} 
                className="px-4 py-2 bg-white/5 border border-white/10 text-white text-sm font-bold hover:bg-[#e94560] hover:border-[#e94560] transition-all rounded-full">
                {a.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {product.genres?.length > 0 && (
        <div className="pb-8 border-b border-white/5 last:border-0 last:pb-0">
          <span className="text-[10px] text-[#e94560] font-black uppercase tracking-widest block mb-4 italic">Semantic_Tags</span>
          <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm">
            {product.genres.map((g) => (
              <Link key={g.id} href={`/genre/${getIdentifier(g)}`} 
                className="text-gray-400 hover:text-[#00d1b2] font-mono tracking-tighter transition-colors uppercase">
                #{g.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {product.maker && (
        <div>
          <span className="text-[10px] text-[#e94560] font-black uppercase tracking-widest block mb-2 italic">Production_Source</span>
          <Link href={`/maker/${getIdentifier(product.maker)}`} 
            className="text-2xl font-black text-white hover:text-[#e94560] transition-colors italic uppercase tracking-tighter">
            {product.maker.name}
          </Link>
        </div>
      )}
    </div>
  );
}