import React from 'react';
import { resolveApiUrl, getDjangoHeaders, getAdultProducts } from '@shared/lib/api/django';
import AdultProductCard from '@shared/cards/AdultProductCard';
import styles from './ProductDetail.module.css';

export default async function RelatedArchives({ product }: { product: any }) {
  let relatedProducts = [];

  try {
    const targetId = product.product_id_unique || product.display_id || product.unique_id;
    const targetApiUrl = resolveApiUrl(`/api/unified-adult-products/?related_to_id=${targetId}&page_size=12`);

    const response = await fetch(targetApiUrl, {
      method: 'GET',
      headers: getDjangoHeaders(),
      next: { revalidate: 3600 } 
    });

    if (response.ok) {
      const data = await response.ok ? await response.json() : { results: [] };
      relatedProducts = data.results || [];
    } else {
      // フォールバック
      const fallback = await getAdultProducts({ 
        related_to_id: product.display_id || product.product_id_unique, 
        limit: 12 
      });
      relatedProducts = fallback?.results || [];
    }
  } catch (e) {
    console.error("Related products fetch failed:", e);
  }

  if (relatedProducts.length === 0) return null;

  return (
    <section className="mt-40 pt-20 border-t border-white/5">
      <div className="flex justify-between items-end mb-12">
        <div>
          <h2 className={styles.relatedTitle}>Synchronized_Archives</h2>
          <p className="text-[10px] text-gray-500 font-mono mt-2 tracking-widest uppercase">Hybrid Intelligence Recommendation</p>
        </div>
        <div className="text-[10px] font-mono text-[#e94560] border border-[#e94560]/30 px-3 py-1">RELATION_SCORE: ACTIVE</div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8">
        {relatedProducts.map((p) => (
          <div key={p.id} className="transition-transform duration-500 hover:translate-y-[-8px]">
            <AdultProductCard product={p} />
          </div>
        ))}
      </div>
    </section>
  );
}