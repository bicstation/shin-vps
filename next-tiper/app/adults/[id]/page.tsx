/* eslint-disable @next/next/no-img-element */
// @ts-nocheck
import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import styles from './ProductDetail.module.css';

import { getAdultProductById, getAdultProductsByMaker } from '@shared/components/lib/api';
import { constructMetadata } from '@shared/components/lib/metadata'; 
import ProductGallery from '@shared/components/cards/AdultProductGallery';

export async function generateMetadata({ params }: { params: Promise<{ category: string, id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const product = await getAdultProductById(id);
  
  if (!product) {
    return constructMetadata("商品未検出", "お探しの商品は見つかりませんでした。");
  }

  return constructMetadata(
    product.title || "商品詳細",
    `${product.maker?.name || '人気メーカー'}の作品: ${product.title}。詳細・価格情報はこちら。`,
    product.image_url_list?.[0]
  );
}

export default async function ProductDetailPage({ params }: { params: Promise<{ category: string, id: string }> }) {
  const { category, id } = await params;
  
  // 💡 商品データの取得
  const product = await getAdultProductById(id);

  if (!product) {
    return (
      <div className={styles.notFound}>
        <div className="text-6xl mb-6">🚫</div>
        <h1 className="text-white text-3xl font-black italic">PRODUCT NOT FOUND</h1>
        <Link href="/products" className="mt-8 px-8 py-3 bg-[#1f1f3a] text-[#00d1b2] rounded-full font-bold border border-[#3d3d66] hover:border-[#00d1b2] no-underline">
          ← BACK TO ARCHIVE
        </Link>
      </div>
    );
  }

  const imageList = Array.isArray(product.image_url_list) ? product.image_url_list : [];
  const actresses = product.actresses || []; 
  const genres = product.genres || [];

  // 💡 関連商品の取得
  let relatedProducts = [];
  try {
    if (product.maker?.id) {
      const response = await getAdultProductsByMaker(product.maker.id, 8);
      relatedProducts = Array.isArray(response) ? response : (response?.results || []);
    }
  } catch (e) {
    relatedProducts = [];
  }

  return (
    <div className={styles.wrapper}>
      <nav className={styles.nav}>
        <Link href="/products" className={styles.backLink}>
          « BACK TO ALL MOVIES
        </Link>
        <span className={styles.productId}>UID: {id}</span>
      </nav>

      <main className={styles.mainContainer}>
        <div className={styles.gridContent}>
          
          {/* 左側：ギャラリー（画像リストを渡すとスライダーやタイル表示する共通部品） */}
          <section className="sticky top-24">
            {imageList.length > 0 ? (
              <ProductGallery images={imageList} title={product.title} />
            ) : (
              <div className="aspect-[3/4] w-full bg-[#1f1f3a] flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#3d3d66]">
                <span className="text-4xl mb-4">🖼️</span>
                <p className="text-gray-600 font-bold">NO IMAGE DATA</p>
              </div>
            )}
          </section>

          {/* 右側：コンテンツ詳細 */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <span className={styles.sourceBadge}>
                {product.api_source || 'EXCLUSIVE'}
              </span>
              <span className="text-[10px] font-mono text-gray-600 tracking-tighter uppercase">
                Release: {product.release_date || 'TBA'}
              </span>
            </div>
            
            <h1 className={styles.title}>
              {product.title}
            </h1>
            
            <div className={styles.priceContainer}>
              <span className="text-lg mt-2 italic text-[#e94560]">¥</span>
              {(product.price || 0).toLocaleString()}
              <span className={styles.priceLabel}>TAX INCL.</span>
            </div>

            <div className={styles.specTableContainer}>
              <table className={styles.specTable}>
                <tbody>
                  <tr className={styles.specRow}>
                    <td className={styles.specKey}>ACTRESS</td>
                    <td className={styles.specValue}>
                      {actresses.length > 0 ? (
                        <div className="flex flex-wrap gap-2 justify-end">
                          {actresses.map((act) => (
                            <Link key={act.id} href={`/actress/${act.id}`} className={styles.actressLink}>
                              {act.name}
                            </Link>
                          ))}
                        </div>
                      ) : '---'}
                    </td>
                  </tr>
                  <tr className={styles.specRow}>
                    <td className={styles.specKey}>MAKER</td>
                    <td className={styles.specValue}>
                      <Link href={`/maker/${product.maker?.id}`} className="text-[#00d1b2] hover:underline">
                        {product.maker?.name || '---'}
                      </Link>
                    </td>
                  </tr>
                  <tr className={styles.specRow}>
                    <td className={styles.specKey}>SERIES</td>
                    <td className={styles.specValue}>
                      {product.series ? (
                        <span className="text-gray-300">{product.series.name}</span>
                      ) : 'SINGLE WORK'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {genres.length > 0 && (
              <div className={styles.genreSection}>
                <h3 className={styles.sectionLabel}>Tags / Genres</h3>
                <div className={styles.genreGrid}>
                  {genres.map((genre) => (
                    <Link key={genre.id} href={`/genre/${genre.id}`} className={styles.genreTag}>
                      #{genre.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <a href={product.affiliate_url} target="_blank" rel="nofollow noopener noreferrer" className={styles.affiliateBtn}>
              DOWNLOAD / WATCH NOW
            </a>

            <p className="mt-6 text-[10px] text-center text-gray-600 leading-relaxed font-bold italic uppercase tracking-tighter">
              ※ 外部配信サイトへ移動します。18歳未満の方の閲覧は固く禁止されています。
            </p>
          </section>
        </div>

        {/* 関連商品：メーカーつながり */}
        {relatedProducts.length > 0 && (
          <section className={styles.relatedSection}>
            <h2 className={styles.relatedTitle}>
              MORE FROM {product.maker?.name || 'THIS MAKER'}
            </h2>
            <div className={styles.relatedGrid}>
              {relatedProducts.slice(0, 4).map((p) => (
                <Link key={p.id} href={`/${category}/${p.id}`} className="no-underline group">
                  <div className={styles.relatedCard}>
                    <div className="aspect-[16/10] overflow-hidden bg-black">
                      <img 
                        src={p.image_url_list?.[0] || '/no-image.png'} 
                        alt={p.title} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-80 group-hover:opacity-100" 
                      />
                    </div>
                    <div className="p-4 bg-[#1f1f3a]">
                      <p className="text-[9px] text-[#e94560] font-black uppercase mb-1 tracking-widest">{p.maker?.name || '---'}</p>
                      <p className="text-[12px] font-bold text-gray-300 group-hover:text-white line-clamp-2 h-9 leading-snug">
                        {p.title}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}