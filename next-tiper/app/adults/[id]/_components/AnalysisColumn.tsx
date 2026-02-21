/* /app/brand/[platform]/products/[id]/_components/AnalysisColumn.tsx */
// @ts-nocheck
import React from 'react';
import Link from 'next/link';
import RadarChart from '@shared/ui/RadarChart';
import styles from '../ProductDetail.module.css';

export default function AnalysisColumn({ product, radarData }) {
  return (
    <section className="space-y-12">
      {/* NEURAL DEEP CONTENT */}
      <div className="relative p-8 bg-gradient-to-b from-white/[0.03] to-transparent border-t border-white/10">
        <div className="absolute top-0 left-0 w-12 h-[2px] bg-[#00d1b2]" />
        <h3 className="text-[10px] font-black text-[#00d1b2] mb-6 uppercase tracking-[0.4em] flex items-center gap-2">
          <span className="w-2 h-2 bg-[#00d1b2] animate-pulse" /> Neural_Deep_Analysis_Report
        </h3>
        <div className="text-gray-300 leading-relaxed font-light space-y-4 text-base italic">
          {product.ai_content ? (
            product.ai_content.split('\n').map((p, i) => p && <p key={i}>{p}</p>)
          ) : (
            <p className="opacity-30 uppercase tracking-widest text-xs">Waiting for neural expansion data...</p>
          )}
        </div>
      </div>

      {/* RADAR CHART UNIT */}
      <div className="bg-[#0a0a0f] border border-white/5 p-8 flex flex-col items-center">
        <h4 className="text-[9px] font-black text-zinc-500 uppercase mb-8 tracking-[0.5em] w-full text-left">Volatility_Spectrum_Analysis</h4>
        <div className="w-full max-w-[400px] aspect-square flex items-center justify-center">
          <RadarChart data={radarData} />
        </div>
      </div>

      {/* TAGS */}
      <div className="p-8 bg-white/[0.02] border border-white/5">
        <h4 className="text-[10px] font-black text-gray-500 uppercase mb-6 tracking-[0.4em]">Semantic_Tags</h4>
        <div className="flex flex-wrap gap-2">
          {product.genres?.map((genre) => (
            <Link key={genre.id} href={`/genre/${genre.slug || genre.id}`} className="px-3 py-1.5 bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-[#e94560] text-[10px] font-black italic uppercase transition-all duration-300">
              #{genre.name}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}