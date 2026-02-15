/* eslint-disable @next/next/no-img-element */
// @ts-nocheck
import React from 'react';
import Link from 'next/link';
import MoviePlayerModal from '@shared/product/MoviePlayerModal';
import styles from '../ProductDetail.module.css';

export default function InfoColumn({ product, statsData, movieData, isFanza, source }) {
  return (
    <section className="flex flex-col">
      <h1 className={styles.detailTitle}>{product.title || 'Untitled Archive'}</h1>
      
      <div className={styles.priceContainer}>
        <span className="text-xl mr-2 text-[#e94560] italic opacity-60">¥</span>
        <span className="text-4xl font-black tabular-nums">
          {typeof product.price === 'number' ? product.price.toLocaleString() : '---'}
        </span>
      </div>

      {/* NEURAL DEEP CONTENT */}
      <div className="my-10 p-8 bg-gradient-to-b from-white/[0.03] to-transparent border-t border-white/10 relative">
          <div className="absolute top-0 left-0 w-12 h-[2px] bg-[#e94560]" />
          <h3 className="text-[10px] font-black text-[#00d1b2] mb-6 uppercase tracking-[0.4em] flex items-center gap-2">
            <span className="w-2 h-2 bg-[#00d1b2] animate-pulse" /> Neural_Deep_Analysis_Report
          </h3>
          <div className="text-gray-300 leading-relaxed font-light space-y-4 text-base md:text-lg italic">
            {product.ai_content ? (
              product.ai_content.split('\n').map((p, i) => p && <p key={i}>{p}</p>)
            ) : (
              <p className="opacity-30">No neural expansion data available.</p>
            )}
          </div>
      </div>

      {/* PERFORMANCE MATRIX */}
      <div className={styles.statsCard}>
        <div className="flex justify-between items-end mb-8">
          <h3 className="text-[10px] font-black text-gray-500 tracking-[0.4em] uppercase">AI_Performance_Matrix</h3>
          <div className="text-right">
            <span className="text-4xl font-black text-white italic">{product.spec_score}</span>
            <span className="text-[10px] text-gray-600 ml-2 font-black">/100</span>
          </div>
        </div>
        <div className="space-y-5">
          {statsData.map((stat) => (
            <div key={stat.label}>
              <div className="flex justify-between text-[10px] font-black mb-2 uppercase tracking-widest text-gray-400">
                <span>{stat.label}</span><span className="text-white">{stat.val}%</span>
              </div>
              <div className="h-[3px] w-full bg-white/5 rounded-full overflow-hidden">
                <div className={`h-full bg-gradient-to-r ${stat.color} transition-all duration-1000 ease-out`} style={{ width: `${stat.val}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA SECTION */}
      <div className="mt-12 p-1 bg-gradient-to-br from-[#e94560] via-[#533483] to-[#0f3460] rounded-sm shadow-[0_0_50px_rgba(233,69,96,0.2)]">
        <div className="bg-[#0a0a1a] p-8 rounded-[1px] relative overflow-hidden">
          <div className="mb-8 relative z-10 text-center">
              <span className="text-[10px] font-black text-[#e94560] tracking-[0.3em] uppercase block mb-2 animate-pulse">Connection_Secure</span>
              <h3 className="text-2xl font-black text-white italic tracking-tighter">本編アーカイブを閲覧する</h3>
          </div>
          <div className="space-y-4 relative z-10">
            <a href={product.affiliate_url || '#'} target="_blank" rel="nofollow noopener noreferrer" className={isFanza ? styles.affiliateBtnFanza : styles.affiliateBtn}>
              <span className="text-sm font-black uppercase tracking-[0.4em]">Unlock_Full_Archive</span>
            </a>
            {movieData?.url && (
              <div className="mt-6 border border-white/10 bg-black/40 p-2 relative">
                  <MoviePlayerModal videoUrl={movieData.url} title={product.title} isIframe={isFanza} />
                  <div className={`absolute -top-2 -right-2 px-3 py-1 text-black text-[9px] font-black uppercase skew-x-[-15deg] ${isFanza ? 'bg-[#ff0080]' : 'bg-[#00d1b2]'}`}>MODAL_PREVIEW</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SPEC TABLE */}
      <div className={styles.specTableContainer + " mt-12"}>
        <table className={styles.specTable}>
          <tbody>
            <tr className={styles.specRow}>
              <td className={styles.specKey}>ACTRESS</td>
              <td className={styles.specValue}>
                <div className="flex flex-wrap gap-2 justify-end">
                  {product.actresses?.map((act) => (
                    <Link key={act.id} href={`/actress/${act.slug || act.id}`} className={styles.actressLink}>{act.name}</Link>
                  ))}
                </div>
              </td>
            </tr>
            <tr className={styles.specRow}>
              <td className={styles.specKey}>MAKER</td>
              <td className={styles.specValue}>
                <Link href={`/maker/${product.maker?.slug || product.maker?.id}`} className="text-[#00d1b2] font-black hover:underline uppercase">{product.maker?.name || '---'}</Link>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}