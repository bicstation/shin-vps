/* ProductHeader.tsx */
import React from 'react';

export default function ProductHeader({ product, source }) {
  const getSafeScore = (val: any) => (typeof val === 'number' ? val : (parseInt(val) || 0));

  return (
    <header className="space-y-8">
      <div>
        <div className="mb-4 inline-block bg-[#e94560]/10 border border-[#e94560]/30 px-3 py-1 rounded-sm">
          <span className="text-[10px] font-black text-[#e94560] italic tracking-widest uppercase">
            {product.ai_summary || "PREMIUM_ANALYSIS_NODE"}
          </span>
        </div>
        <h1 className="text-3xl md:text-6xl font-black italic tracking-tighter text-white leading-[1.1] uppercase mb-8 break-words">
          {product.title}
        </h1>
        
        <div className="flex items-center gap-8 bg-white/[0.03] p-6 md:p-10 border-l-4 border-[#e94560] relative rounded-r-xl">
          <div className="absolute top-2 right-4 text-[8px] font-mono text-gray-600 uppercase">Price_Index_Synced</div>
          <div>
            <span className="text-[10px] text-gray-500 font-black block mb-2 uppercase tracking-widest">Market_Value</span>
            <div className="flex items-baseline text-[#e94560]">
              <span className="text-2xl italic mr-1">¥</span>
              <span className="text-4xl md:text-7xl font-black tabular-nums">{product.price?.toLocaleString() || '---'}</span>
            </div>
          </div>
          <div className="ml-auto text-right border-l border-white/10 pl-8">
            <span className="text-[10px] text-gray-500 font-black block mb-2 uppercase tracking-widest">Efficiency_Rating</span>
            <div className="text-4xl md:text-6xl font-black text-white italic">{getSafeScore(product.spec_score)}</div>
          </div>
        </div>
      </div>

      {product.target_segment && (
        <div className="bg-[#00d1b2]/5 border-l-2 border-[#00d1b2] p-4 rounded-r-lg">
          <span className="text-[9px] font-black text-[#00d1b2] uppercase tracking-[0.3em] block mb-1">Optimal_User_Segment</span>
          <span className="text-white text-lg font-bold italic">「{product.target_segment}」</span>
        </div>
      )}
    </header>
  );
}