/* TechnicalMeta.tsx */
import Link from 'next/link';

export default function TechnicalMeta({ product, getIdentifier }) {
  if (!product) return null;

  const source = (product.api_source || '').toUpperCase();
  const isFanza = source === 'FANZA' || source === 'DMM';

  // 💡 サービスやソースに応じた「ラベル名」の動的定義
  const labelMap = {
    cast: isFanza ? "Archive_Cast" : "Featured_Talent",
    tags: isFanza ? "Semantic_Tags" : "Content_Classification",
    production: isFanza ? "Production_Source" : "Publisher_Origin",
    director: "Creative_Director",
    author: "Primary_Author",
    series: "Structural_Series"
  };

  return (
    <div className="bg-white/[0.02] p-8 border border-white/5 rounded-2xl space-y-10 relative overflow-hidden">
      {/* 背景のグリッド装飾（サービスごとに色を変えることも可能） */}
      <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
        <span className="text-[40px] font-black italic">{source}</span>
      </div>

      {/* 1. 出演者 (Cast) */}
      {product.actresses?.length > 0 && (
        <div className="pb-8 border-b border-white/5 last:border-0 last:pb-0 relative z-10">
          <span className="text-[10px] text-[#e94560] font-black uppercase tracking-widest block mb-4 italic">
            {labelMap.cast}
          </span>
          <div className="flex flex-wrap gap-3">
            {product.actresses.map((a) => (
              <Link key={a.id} href={`/actress/${getIdentifier(a)}`} 
                className="px-4 py-2 bg-white/5 border border-white/10 text-white text-sm font-bold hover:bg-[#e94560] hover:border-[#e94560] transition-all rounded-full shadow-lg">
                {a.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 2. 著者/監督 (Author/Director) - サービスに応じて切り替え */}
      {(product.author || product.director) && (
        <div className="pb-8 border-b border-white/5 last:border-0 last:pb-0 relative z-10">
          <span className="text-[10px] text-[#e94560] font-black uppercase tracking-widest block mb-4 italic">
            {product.author ? labelMap.author : labelMap.director}
          </span>
          <div className="flex flex-wrap gap-3">
            {/* 著者または監督を表示 */}
            {product.author && (
              <Link href={`/author/${getIdentifier(product.author)}`} className="text-xl font-bold text-white hover:text-[#00d1b2] transition-colors">
                {product.author.name}
              </Link>
            )}
            {product.director && (
              <Link href={`/director/${getIdentifier(product.director)}`} className="text-xl font-bold text-white hover:text-[#00d1b2] transition-colors">
                {product.director.name}
              </Link>
            )}
          </div>
        </div>
      )}

      {/* 3. シリーズ (Series) */}
      {product.series && (
        <div className="pb-8 border-b border-white/5 last:border-0 last:pb-0 relative z-10">
          <span className="text-[10px] text-[#e94560] font-black uppercase tracking-widest block mb-2 italic">
            {labelMap.series}
          </span>
          <Link href={`/series/${getIdentifier(product.series)}`} 
            className="text-lg font-bold text-gray-300 hover:text-white transition-colors border-l-4 border-[#e94560] pl-4">
            {product.series.name}
          </Link>
        </div>
      )}

      {/* 4. ジャンルタグ (Genres) */}
      {product.genres?.length > 0 && (
        <div className="pb-8 border-b border-white/5 last:border-0 last:pb-0 relative z-10">
          <span className="text-[10px] text-[#e94560] font-black uppercase tracking-widest block mb-4 italic">
            {labelMap.tags}
          </span>
          <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm">
            {product.genres.map((g) => (
              <Link key={g.id} href={`/genre/${getIdentifier(g)}`} 
                className="text-gray-400 hover:text-[#00d1b2] font-mono tracking-tighter transition-colors uppercase flex items-center gap-1">
                <span className="text-[#00d1b2] opacity-50">/</span>{g.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 5. メーカー (Maker) */}
      {product.maker && (
        <div className="relative z-10 pt-4">
          <span className="text-[10px] text-[#e94560] font-black uppercase tracking-widest block mb-2 italic">
            {labelMap.production}
          </span>
          <Link href={`/maker/${getIdentifier(product.maker)}`} 
            className="text-3xl font-black text-white hover:text-[#e94560] transition-colors italic uppercase tracking-tighter inline-block border-b-2 border-transparent hover:border-[#e94560]">
            {product.maker.name}
          </Link>
        </div>
      )}
    </div>
  );
}