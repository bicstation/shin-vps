/* eslint-disable @next/next/no-img-element */
// @ts-nocheck
import React from 'react';
import Link from 'next/link';
import RadarChart from '@shared/ui/RadarChart';
import styles from '../ProductDetail.module.css';

export default function AnalysisColumn({ product, radarData }) {
  return (
    <section className="space-y-8">
      {/* 🆕 NEURAL DIALOGUE LOG */}
      {product.ai_chat_comments && product.ai_chat_comments.length > 0 && (
        <div className="bg-[#0f0f1a] border border-white/10 p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-2 opacity-10 text-[10px] font-black italic text-[#e94560]">AI_COMM_LOG</div>
          <h4 className="text-[10px] font-black text-[#e94560] mb-6 tracking-[0.3em] uppercase border-b border-[#e94560]/20 pb-2">Neural_Dialogue_Archive</h4>
          <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar font-mono">
            {product.ai_chat_comments.map((chat, idx) => (
              <div key={idx} className={`p-3 text-[11px] leading-relaxed ${idx % 2 === 0 ? 'bg-white/5 border-l border-white/20 text-gray-400' : 'bg-[#e94560]/5 border-l border-[#e94560] text-gray-300'}`}>
                <div className="text-[9px] font-black opacity-50 mb-1">[{chat.user}]</div>
                <div>{chat.comment}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RADAR & SUMMARY */}
      <div className={styles.aiSummaryCard}>
        <div className={styles.aiLabel}>Expert AI_Report</div>
        <p className={styles.aiText}>"{product.ai_summary || 'No summary available.'}"</p>
        <div className="mt-8 p-6 bg-black/40 rounded border border-white/5 flex flex-col items-center justify-center min-h-[280px]">
            <RadarChart data={radarData} />
        </div>
        <div className={styles.aiReflection} />
      </div>

      {/* TAGS */}
      <div className="p-8 bg-[#111125]/40 rounded-sm border border-white/5">
        <h4 className="text-[10px] font-black text-gray-400 uppercase mb-6 tracking-[0.4em]">Semantic_Tags</h4>
        <div className="flex flex-wrap gap-2">
          {product.genres?.map((genre) => (
            <Link key={genre.id} href={`/genre/${genre.slug || genre.id}`} className="px-3 py-1.5 bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-[#e94560] text-[11px] font-black italic uppercase transition-colors">
              #{genre.name}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}