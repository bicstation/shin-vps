/* eslint-disable @next/next/no-img-element */
// @ts-nocheck
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
 * 💡 メタデータ生成
 */
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  if (!id) return constructMetadata("エラー", "IDが見つかりません。");

  try {
    const product = await getAdultProductDetail(id);
    if (!product) return constructMetadata("作品が見つかりません", "お探しのコンテンツは存在しません。");

    const actressNames = product.actresses?.map(a => a.name).join(', ') || '';
    const description = `${product.maker?.name || '人気メーカー'}作品。${actressNames ? `出演: ${actressNames}。` : ''} AI解析スコア: ${product.spec_score ?? 0}点。${product.ai_summary || product.title || ''}`;

    return constructMetadata(
      `${product.title || '詳細'} | tiper.live AI解析詳細`,
      description,
      product.image_url_list?.[0],
      true
    );
  } catch (error) {
    return constructMetadata("エラー", "データの取得中にエラーが発生しました。");
  }
}

/**
 * 🔞 商品詳細ページ メインコンポーネント
 */
export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const currentCategory = 'adults';
  
  // 1. 商品データの取得
  let product = null;
  try {
    product = await getAdultProductDetail(id);
  } catch (e) {
    console.error("Fetch product error:", e);
  }

  // データがない場合は404風の表示
  if (!product) {
    return (
      <div className={styles.notFound}>
        <div className="text-6xl mb-6">🚫</div>
        <h1 className="text-white text-3xl font-black italic tracking-tighter">CONTENT NOT FOUND</h1>
        <Link href={`/${currentCategory}`} className="mt-8 px-8 py-3 bg-[#1f1f3a] text-[#ff5e78] rounded-full font-bold border border-[#3d3d66] no-underline transition-all hover:border-[#ff5e78]">
          ← BACK TO ARCHIVE
        </Link>
      </div>
    );
  }

  // 💡 DUGA判定
  const isDuga = product.api_source === 'DUGA';

  // --- 🖼️ ビジュアル抽出ロジックの強化 ---
  const jacketImage = (Array.isArray(product.image_url_list) && product.image_url_list.length > 0)
    ? product.image_url_list[0] 
    : (product.image_url || '/placeholder.png');

  const galleryImages = Array.isArray(product.image_url_list) ? product.image_url_list : [];

  // --- 🎥 動画データの正規化 (Server Componentのため useMemo は削除) ---
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

  // --- 📊 スコアデータの安全な数値変換 (JSONField対策) ---
  const getSafeScore = (val: any) => {
    if (typeof val === 'number') return val;
    if (typeof val === 'object' && val !== null) return val.score || 0;
    const parsed = parseInt(val);
    return isNaN(parsed) ? 0 : parsed;
  };

  // 2. 関連作品の取得
  let relatedProducts = [];
  try {
    if (product.maker?.id) {
      const response = await getAdultProducts({ 
        maker: product.maker.id, 
        limit: 4,
        exclude: id
      });
      relatedProducts = response?.results || [];
    }
  } catch (e) {
    console.error("Related products fetch failed");
  }

  const title = product.title || 'Untitled';
  const price = typeof product.price === 'number' ? product.price.toLocaleString() : '---';

  return (
    <div className={styles.wrapper}>
      {/* 🛠️ ナビゲーションバー */}
      <nav className={styles.nav}>
        <Link href={`/${currentCategory}`} className={styles.backLink}>
          « EXPLORE {isDuga ? 'DUGA' : 'ALL'} ARCHIVE
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-[10px] text-gray-600 font-mono tracking-tighter">ID: {product.product_id_unique || id}</span>
          <span className={isDuga ? styles.sourceBadgeDuga : styles.sourceBadge}>
            {product.api_source || 'AI PREMIUM'}
          </span>
        </div>
      </nav>

      <main className={styles.mainContainer}>
        
        {/* 💡 ビジュアル・ヒーロー・セクション */}
        <section className={styles.visualHeroSection}>
          <div className={styles.visualGrid}>
            
            {/* 左: 縦長ジャケット画像 */}
            <div className={styles.jacketColumn}>
              <div className={styles.jacketWrapper}>
                <img 
                  src={jacketImage} 
                  alt={`${title} Jacket`} 
                  className={styles.jacketImage}
                  style={{ imageRendering: 'crisp-edges' }}
                />
                <div className={styles.jacketOverlay} />
                <div className={styles.scanline} />
                <div className={styles.jacketLabel}>PRIMARY ARCHIVE: JACKET</div>
              </div>
            </div>

            {/* 右: メインギャラリー（動画統合版） */}
            <div className={styles.galleryColumn}>
              <AdultProductGallery 
                images={galleryImages} 
                title={title} 
                apiSource={product.api_source} 
                sampleMovieData={movieData}
              />
            </div>

          </div>
        </section>

        {/* 💡 コンテンツ詳細エリア */}
        <div className={styles.gridContent}>
          
          {/* 左側：AIサマリー */}
          <section className="space-y-6">
            {product.ai_summary && (
              <div className="p-8 bg-gradient-to-br from-[#1f1f3a] to-[#0a0a14] rounded-2xl border-l-4 border-[#e94560] shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2 opacity-5 font-black text-6xl italic">AI</div>
                <h3 className="text-[11px] font-black text-[#e94560] mb-4 tracking-widest uppercase">Expert Analysis</h3>
                <p className="text-gray-200 text-base leading-relaxed italic relative z-10">
                  "{product.ai_summary}"
                </p>
              </div>
            )}
          </section>

          {/* 右側：スペック・評価・購入ボタン */}
          <section className="flex flex-col">
            <h1 className={styles.detailTitle}>{title}</h1>
            
            <div className="flex items-baseline gap-4 mb-8">
              <div className={styles.priceContainer}>
                <span className="text-xl mr-1 text-[#e94560] italic font-light">¥</span>
                {price}
              </div>
              <span className="text-[10px] text-gray-500 font-bold tracking-widest uppercase">
                {isDuga ? 'DUGA High Quality Stream' : 'Digital Version'}
              </span>
            </div>

            {/* 📊 解析評価グラフ (安全な数値変換を適用) */}
            <div className="mb-10 p-6 bg-[#0f0f1e]/80 backdrop-blur-sm rounded-2xl border border-white/5 shadow-inner">
              <div className="flex justify-between items-end mb-6">
                <h3 className="text-xs font-black text-gray-500 tracking-[0.2em] uppercase">Performance Stats</h3>
                <div className="text-right">
                  <span className="text-3xl font-black text-white italic">{getSafeScore(product.spec_score)}</span>
                  <span className="text-xs text-gray-600 ml-1">/100</span>
                </div>
              </div>
              
              <div className="space-y-4">
                {[
                  { label: 'VISUAL', val: getSafeScore(product.score_visual), color: 'from-pink-500 to-rose-500' },
                  { label: 'STORY', val: getSafeScore(product.score_story), color: 'from-purple-500 to-indigo-500' },
                  { label: 'EROTIC', val: getSafeScore(product.score_erotic), color: 'from-red-500 to-orange-500' },
                  { label: 'RARITY', val: getSafeScore(product.score_rarity), color: 'from-amber-500 to-yellow-500' },
                  { label: 'COST', val: getSafeScore(product.score_cost), color: 'from-emerald-500 to-teal-500' },
                ].map((stat) => (
                  <div key={stat.label}>
                    <div className="flex justify-between text-[9px] font-black mb-1.5 tracking-tighter uppercase">
                      <span className="text-gray-400">{stat.label}</span>
                      <span className="text-white">{stat.val}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-900 rounded-full overflow-hidden">
                      <div className={`h-full bg-gradient-to-r ${stat.color} shadow-[0_0_8px_rgba(255,255,255,0.1)]`} style={{ width: `${Math.min(stat.val, 100)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 📋 スペックテーブル */}
            <div className={styles.specTableContainer}>
              <table className={styles.specTable}>
                <tbody>
                  <tr className={styles.specRow}>
                    <td className={styles.specKey}>ACTRESS</td>
                    <td className={styles.specValue}>
                      <div className="flex flex-wrap gap-2 justify-end">
                        {product.actresses?.map((act) => (
                          <Link key={act.id} href={`/actress/${act.id}`} className={styles.actressLink}>
                            👤 {act.name}
                          </Link>
                        )) || <span className="text-gray-600">Unknown</span>}
                      </div>
                    </td>
                  </tr>
                  <tr className={styles.specRow}>
                    <td className={styles.specKey}>MAKER</td>
                    <td className={styles.specValue}>
                      <Link href={`/maker/${product.maker?.id}`} className="text-cyan-400 font-bold hover:underline">
                        {product.maker?.name || '---'}
                      </Link>
                    </td>
                  </tr>
                  <tr className={styles.specRow}>
                    <td className={styles.specKey}>RELEASE</td>
                    <td className={styles.specValue + " font-mono text-gray-400"}>
                      {product.release_date || 'TBA'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 🚀 アクションボタン */}
            <div className="mt-12 space-y-4">
              {movieData?.url && (
                <MoviePlayerModal 
                  videoUrl={movieData.url} 
                  title={title} 
                />
              )}

              <a 
                href={product.affiliate_url || '#'} 
                target="_blank" 
                rel="nofollow noopener noreferrer" 
                className={isDuga ? styles.affiliateBtnDuga : styles.affiliateBtn}
              >
                <span>WATCH FULL CONTENT ON {isDuga ? 'DUGA' : 'FANZA'}</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
            </div>
          </section>
        </div>

        {/* --- 💡 関連作品セクション --- */}
        {relatedProducts.length > 0 && (
          <section className="mt-32 pt-16 border-t border-white/5">
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-2xl md:text-3xl font-black italic tracking-tighter text-white uppercase">
                MORE FROM <span className="text-[#e94560] ml-2">{product.maker?.name || 'MAKER'}</span>
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <AdultProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}