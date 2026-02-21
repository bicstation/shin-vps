/* /app/brand/[platform]/products/[id]/_components/InfoColumn.tsx */
// @ts-nocheck
import React from 'react';
import Link from 'next/link';
import styles from '../ProductDetail.module.css';

export default function InfoColumn({ product, statsData, isFanza, source }) {
  return (
    <section className="flex flex-col h-full">
      {/* PERFORMANCE MATRIX (AIスコア) */}
      <div className={styles.statsCard}>
        <div className="flex justify-between items-end mb-8">
          <h3 className="text-[10px] font-black text-gray-500 tracking-[0.4em] uppercase">AI_Performance_Matrix</h3>
          <div className="text-right">
            <span className="text-4xl font-black text-white italic">{product.spec_score || '??'}</span>
            <span className="text-[10px] text-gray-600 ml-2 font-black">/100</span>
          </div>
        </div>
        <div className="space-y-5">
          {statsData.map((stat) => (
            <div key={stat.label}>
              <div className="flex justify-between text-[10px] font-black mb-2 uppercase tracking-widest text-gray-400">
                <span>{stat.label}</span><span className="text-white">{stat.val}%</span>
              </div>
              <div className={styles.statBarContainer}>
                <div className={`${styles.statBarFill} bg-gradient-to-r ${stat.color}`} style={{ width: `${stat.val}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA SECTION (アフィリエイト) */}
      <div className="mt-8">
        <div className="p-[1px] bg-gradient-to-r from-transparent via-[#e94560]/50 to-transparent mb-4" />
        <a 
          href={product.affiliate_url || '#'} 
          target="_blank" 
          rel="nofollow noopener noreferrer" 
          className={isFanza ? styles.affiliateBtnFanza : styles.affiliateBtn}
        >
          <span className="text-sm font-black uppercase tracking-[0.4em]">Unlock_Full_Archive</span>
        </a>
      </div>

      {/* SPEC TABLE */}
      <div className={styles.specTableContainer}>
        <table className={styles.specTable}>
          <tbody>
            <tr className={styles.specRow}>
              <td className={styles.specKey}>ACTRESS</td>
              <td className={styles.specValue}>
                <div className="flex flex-wrap gap-2 justify-end">
                  {product.actresses?.length > 0 ? (
                    product.actresses.map((act) => (
                      <Link key={act.id} href={`/actresses/${act.slug || act.id}`} className={styles.actressLink}>
                        {act.name}
                      </Link>
                    ))
                  ) : (
                    <span className="opacity-30 italic">Unknown</span>
                  )}
                </div>
              </td>
            </tr>
            <tr className={styles.specRow}>
              <td className={styles.specKey}>MAKER</td>
              <td className={styles.specValue}>
                <Link href={`/maker/${product.maker?.slug || product.maker?.id}`} className="text-[#00d1b2] font-black hover:underline uppercase transition-all">
                  {product.maker_name || product.maker?.name || '---'}
                </Link>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}