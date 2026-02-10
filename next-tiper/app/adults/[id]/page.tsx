/* eslint-disable @next/next/no-img-element */
// @ts-nocheck
/**
 * ==============================================================================
 * 🔞 TIPER Product Detail - Hybrid Cyber Archive (SEO Optimized)
 * ==============================================================================
 */

export const dynamic = 'force-dynamic';

import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import styles from './ProductDetail.module.css';

// ✅ 共通ライブラリ・コンポーネント
import { getAdultProductDetail, getAdultProducts } from '@shared/lib/api/django';
import { constructMetadata } from '@shared/lib/metadata'; 
import AdultProductCard from '@shared/cards/AdultProductCard';
import AdultProductGallery from '@shared/cards/AdultProductGallery';
import MoviePlayerModal from '@shared/product/MoviePlayerModal';

/**
 * 💡 メタデータ生成 (Next.js 15 Async Params 修正)
 * SEOエラーを防ぐため、引数の型定義を厳密に合わせます。
 */
export async function generateMetadata(props: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const params = await props.params;
  const id = params.id;

  if (!id) return constructMetadata("エラー", "IDが見つかりません。");

  try {
    const product = await getAdultProductDetail(id);
    if (!product || product._error) {
      return constructMetadata("作品未検出", "指定のノードは存在しません。");
    }

    const actressNames = product.actresses?.map(a => a.name).join(', ') || '';
    const makerName = product.maker?.name || '解析済み';
    // 説明文を160文字程度に最適化（SEO）
    const description = `【${makerName}】${actressNames ? `出演: ${actressNames}。` : ''} AIスコア: ${product.spec_score ?? 0}点。${product.ai_summary || product.title || ''}`.slice(0, 160);

    return constructMetadata(
      `${product.title || '詳細'} | tiper.live AI Archive`,
      description,
      product.image_url_list?.[0] || product.image_url,
      true
    );
  } catch (error) {
    return constructMetadata("System Error", "データの取得に失敗しました。");
  }
}

/**
 * 🔞 商品詳細ページ メインコンポーネント
 */
export default async function ProductDetailPage(props: { params: Promise<{ id: string }> }) {
  // 1. Next.js 15 準拠の非同期パラメータ解決
  const params = await props.params;
  const id = params.id;
  const currentCategory = 'adults';
  
  let product = null;
  try {
    product = await getAdultProductDetail(id);
  } catch (e) {
    console.error("Fetch product error:", e);
  }

  // --- 🛡️ 404/エラーハンドリング ---
  if (!product || product._error) {
    return (
      <div className={styles.notFound}>
        <div className="relative inline-block mb-8">
          <div className="text-8xl opacity-10 grayscale">🛸</div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-black text-[#ff5e78] animate-pulse">SIGNAL_LOST</span>
          </div>
        </div>
        <h1 className="text-white text-4xl font-black italic tracking-tighter uppercase">Content Offline</h1>
        <p className="text-gray-500 mt-4 uppercase tracking-[0.3em] text-[10px]">Node Identifier: {id}</p>
        <Link href={`/${currentCategory}`} className="mt-12 px-10 py-4 bg-[#1f1f3a] text-[#ff5e78] rounded-sm font-black text-[11px] border border-[#3d3d66] uppercase tracking-[0.2em] transition-all hover:bg-[#ff5e78] hover:text-white">
          « Return to Archive
        </Link>
      </div>
    );
  }

  // 💡 プラットフォーム判定
  const source = (product.api_source || '').toUpperCase();
  const isDuga = source === 'DUGA';
  const isFanza = source === 'FANZA' || source === 'DMM';
  const themeClass = isDuga ? styles.dugaTheme : isFanza ? styles.fanzaTheme : '';

  // --- 🖼️ ビジュアルデータの正規化 ---
  const jacketImage = (Array.isArray(product.image_url_list) && product.image_url_list.length > 0)
    ? product.image_url_list[0] 
    : (product.image_url || '/placeholder.png');

  const galleryImages = Array.isArray(product.image_url_list) ? product.image_url_list : [];

  // --- 🎥 動画データの正規化 ---
  let movieData = null;
  if (product.sample_movie_url) {
    if (typeof product.sample_movie_url === 'object' && product.sample_movie_url !== null) {
      movieData = {
        url: product.sample_movie_url.url || null,
        preview_image: product.sample_movie_url.preview_image || null
      };
    } else {
      movieData = { url: product.sample_movie_url, preview_image: null };
    }
  }

  // --- 📊 スコアデータの安全な取得 ---
  const getSafeScore = (val: any) => {
    if (typeof val === 'number') return val;
    if (typeof val === 'object' && val !== null) return val.score || 0;
    const parsed = parseInt(val);
    return isNaN(parsed) ? 0 : parsed;
  };

  // 2. 関連作品のフェッチ
  let relatedProducts = [];
  try {
    if (product.maker?.id) {
      const response = await getAdultProducts({ 
        maker: product.maker.id, 
        limit: 5,
      });
      // product_id_unique を使って自分自身を除外（SEO的にも重要）
      relatedProducts = response?.results?.filter(p => p.product_id_unique !== product.product_id_unique).slice(0, 4) || [];
    }
  } catch (e) {
    console.warn("Related products fetch failed");
  }

  const title = product.title || 'Untitled Archive';
  const priceDisplay = typeof product.price === 'number' ? product.price.toLocaleString() : '---';

  return (
    <div className={`${styles.wrapper} ${themeClass}`}>
      <nav className={styles.nav}>
        <div className="max-w-[1440px] mx-auto px-[5%] flex justify-between items-center w-full">
          <Link href={`/${currentCategory}`} className={styles.backLink}>
            <span className="opacity-50">«</span> EXPLORE_{source || 'CORE'}_STREAM
          </Link>
          <div className="flex items-center gap-6">
            <span className="hidden md:block text-[9px] text-gray-600 font-mono tracking-widest uppercase">ID_BUFFER: {product.product_id_unique}</span>
            <div className={isDuga ? styles.sourceBadgeDuga : isFanza ? styles.sourceBadgeFanza : styles.sourceBadge}>
              {source || 'AI_VIRTUAL'}
            </div>
          </div>
        </div>
      </nav>

      <main className={styles.mainContainer}>
        <section className={styles.visualHeroSection}>
          <div className={styles.visualGrid}>
            <div className={styles.jacketColumn}>
              <div className={styles.jacketWrapper}>
                <img src={jacketImage} alt={title} className={styles.jacketImage} />
                <div className={styles.jacketOverlay} />
                <div className={styles.scanline} />
                <div className={styles.cornerMarker} />
                <div className={styles.jacketLabel}>DATA_STREAM: SUCCESS_01</div>
              </div>
            </div>
            <div className={styles.galleryColumn}>
              <AdultProductGallery 
                images={galleryImages} 
                title={title} 
                apiSource={source} 
                sampleMovieData={movieData}
              />
            </div>
          </div>
        </section>

        <div className={styles.gridContent}>
          <section className="space-y-8">
            {product.ai_summary && (
              <div className={styles.aiSummaryCard}>
                <div className={styles.aiLabel}>Expert AI_Report</div>
                <p className={styles.aiText}>"{product.ai_summary}"</p>
                <div className={styles.aiReflection} />
              </div>
            )}
            {product.description && (
              <div className="p-8 bg-[#111125]/40 rounded-sm border border-white/5">
                <h4 className="text-[10px] font-black text-gray-500 uppercase mb-6 tracking-[0.4em]">Node_Raw_Description</h4>
                <div className="text-gray-400 text-sm leading-loose line-clamp-6 hover:line-clamp-none transition-all duration-700">
                  {product.description}
                </div>
              </div>
            )}
          </section>

          <section className="flex flex-col">
            <h1 className={styles.detailTitle}>{title}</h1>
            <div className="flex items-center gap-6 mb-10 pb-10 border-b border-white/5">
              <div className={styles.priceContainer}>
                <span className="text-xl mr-2 text-[#e94560] italic font-light opacity-60">¥</span>
                <span className="text-4xl font-black tabular-nums">{priceDisplay}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] text-gray-500 font-black tracking-widest uppercase mb-1">Status</span>
                <span className="text-[11px] text-white font-bold">{isDuga ? 'BITRATE_PRIORITY' : 'LICENSE_READY'}</span>
              </div>
            </div>

            <div className={styles.statsCard}>
              <div className="flex justify-between items-end mb-8">
                <h3 className="text-[10px] font-black text-gray-500 tracking-[0.4em] uppercase">AI_Performance_Matrix</h3>
                <div className="text-right">
                  <span className="text-4xl font-black text-white italic leading-none">{getSafeScore(product.spec_score)}</span>
                  <span className="text-[10px] text-gray-600 ml-2 font-black">/100</span>
                </div>
              </div>
              <div className="space-y-5">
                {[
                  { label: 'VISUAL', val: getSafeScore(product.score_visual), color: 'from-pink-500 to-rose-500' },
                  { label: 'STORY', val: getSafeScore(product.score_story), color: 'from-blue-500 to-indigo-500' },
                  { label: 'EROTIC', val: getSafeScore(product.score_erotic), color: 'from-red-600 to-orange-500' },
                  { label: 'RARITY', val: getSafeScore(product.score_rarity), color: 'from-amber-400 to-yellow-500' },
                ].map((stat) => (
                  <div key={stat.label} className="group">
                    <div className="flex justify-between text-[10px] font-black mb-2 tracking-widest uppercase">
                      <span className="text-gray-500 group-hover:text-white transition-colors">{stat.label}</span>
                      <span className="text-white opacity-40 group-hover:opacity-100">{stat.val}%</span>
                    </div>
                    <div className="h-[3px] w-full bg-white/5 rounded-full overflow-hidden">
                      <div className={`h-full bg-gradient-to-r ${stat.color}`} style={{ width: `${Math.min(stat.val, 100)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.specTableContainer}>
              <table className={styles.specTable}>
                <tbody>
                  <tr className={styles.specRow}>
                    <td className={styles.specKey}>ACTRESS_ID</td>
                    <td className={styles.specValue}>
                      <div className="flex flex-wrap gap-2 justify-end">
                        {product.actresses?.map((act) => (
                          <Link key={act.id} href={`/actress/${act.id}`} className={styles.actressLink}>
                            {act.name}
                          </Link>
                        )) || <span className="text-gray-700">PRIVATE_DATA</span>}
                      </div>
                    </td>
                  </tr>
                  <tr className={styles.specRow}>
                    <td className={styles.specKey}>MAKER_NODE</td>
                    <td className={styles.specValue}>
                      <Link href={`/maker/${product.maker?.id}`} className="text-[#00d1b2] font-black hover:underline uppercase tracking-wider">
                        {product.maker?.name || '---'}
                      </Link>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-12 space-y-4">
              {movieData?.url && (
                <MoviePlayerModal videoUrl={movieData.url} title={title} />
              )}
              <a 
                href={product.affiliate_url || '#'} 
                target="_blank" 
                rel="nofollow noopener noreferrer" 
                className={isDuga ? styles.affiliateBtnDuga : isFanza ? styles.affiliateBtnFanza : styles.affiliateBtn}
              >
                <span>OPEN_RAW_CONTENT_ON_{source || 'PARTNER'}</span>
                <svg className="w-5 h-5 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
            </div>
          </section>
        </div>

        {relatedProducts.length > 0 && (
          <section className="mt-40 pt-20 border-t border-white/5">
            <div className="flex items-center gap-6 mb-16">
              <span className="h-[2px] w-12 bg-[#e94560]"></span>
              <h2 className="text-3xl font-black italic tracking-tighter text-white uppercase">
                Synchronized_Archives_From <span className="text-[#e94560]">{product.maker?.name || 'SOURCE'}</span>
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {relatedProducts.map((p) => (
                <AdultProductCard key={p.product_id_unique || p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </main>
      <div className="mt-40 h-[1px] w-full bg-gradient-to-r from-transparent via-[#e94560]/10 to-transparent"></div>
    </div>
  );
}