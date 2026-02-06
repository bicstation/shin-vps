/* eslint-disable @next/next/no-img-element */
// @ts-nocheck
import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import styles from './ProductDetail.module.css';

// ✅ 共通ライブラリ・コンポーネント
import { getAdultProductDetail, getAdultProducts } from '@shared/lib/api/django';
import { constructMetadata } from '@shared/lib/metadata'; 

// ✅ コンポーネントのインポート
// 注: これらのコンポーネント自体が内部で "use client" を持ち、
// 必要に応じて内部で dynamic(() => ..., { ssr: false }) を使用している前提です。
import AdultProductGallery from '@shared/cards/AdultProductGallery';
import MoviePlayerModal from '@shared/product/MoviePlayerModal';

/**
 * 💡 メタデータ生成 (SEO最適化)
 */
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  // Next.js 15以降、paramsはPromiseとして扱う必要があります
  const resolvedParams = await params;
  const id = resolvedParams?.id;
  
  if (!id) return constructMetadata("エラー", "IDが見つかりません。");

  try {
    const product = await getAdultProductDetail(id);
    
    if (!product) {
      return constructMetadata("作品が見つかりません", "お探しの動画コンテンツは削除されたか、URLが変更された可能性があります。");
    }

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
export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  const resolvedParams = await params;
  const id = resolvedParams?.id;
  const currentCategory = 'adults';
  
  // 💡 商品データの取得
  let product = null;
  try {
    product = await getAdultProductDetail(id);
  } catch (e) {
    console.error("Fetch product error:", e);
  }

  // ✅ データが存在しない、または型が不正な場合のガード
  if (!product || typeof product !== 'object') {
    return (
      <div className={styles.notFound}>
        <div className="text-6xl mb-6">🚫</div>
        <h1 className="text-white text-3xl font-black italic tracking-tighter">CONTENT NOT FOUND</h1>
        <p className="text-gray-500 mb-8">指定されたコンテンツの解析データが存在しないか、取得に失敗しました。</p>
        <Link href={`/${currentCategory}`} className="px-8 py-3 bg-[#1f1f3a] text-[#ff5e78] rounded-full font-bold border border-[#3d3d66] hover:border-[#ff5e78] transition-all no-underline">
          ← BACK TO ARCHIVE
        </Link>
      </div>
    );
  }

  // ✅ デフォルト値の徹底
  const imageList = product.image_url_list || [];
  const actresses = product.actresses || []; 
  const genres = product.genres || [];
  const attributes = product.attributes || [];
  const title = product.title || 'Untitled';
  const price = typeof product.price === 'number' ? product.price.toLocaleString() : '---';
  const specScore = product.spec_score ?? 0;

  // 💡 関連作品の取得
  let relatedProducts = [];
  try {
    if (product.maker?.id) {
      const response = await getAdultProducts({ maker: product.maker.id, limit: 4 });
      relatedProducts = response?.results || [];
    }
  } catch (e) {
    console.error("Related products fetch failed");
  }

  return (
    <div className={styles.wrapper}>
      {/* 🛠️ ナビゲーション */}
      <nav className={styles.nav}>
        <Link href={`/${currentCategory}`} className={styles.backLink}>
          « EXPLORE ALL MOVIES
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-[10px] text-gray-600 font-mono">ID: {product.product_id_unique || '---'}</span>
          <span className={styles.sourceBadge}>{product.api_source || 'AI'}</span>
        </div>
      </nav>

      <main className={styles.mainContainer}>
        <div className={styles.gridContent}>
          
          {/* 左カラム：ビジュアルエリア */}
          <section className="space-y-6">
            <div className="sticky top-24">
              {imageList.length > 0 ? (
                <AdultProductGallery images={imageList} title={title} />
              ) : (
                <div className="aspect-video w-full bg-[#111122] flex flex-col items-center justify-center rounded-2xl border border-[#222244]">
                  <span className="text-4xl mb-4 opacity-20">🎞️</span>
                  <p className="text-gray-600 font-bold text-xs">IMAGE UNAVAILABLE</p>
                </div>
              )}

              {/* 🧠 AI解析サマリー */}
              {product.ai_summary && (
                <div className="mt-6 p-6 bg-gradient-to-br from-[#1f1f3a] to-[#16162d] rounded-2xl border-l-4 border-[#ff5e78] shadow-xl">
                  <h3 className="text-[10px] font-black text-[#ff5e78] mb-2 tracking-widest uppercase">AI Expert Analysis</h3>
                  <p className="text-gray-200 text-sm leading-relaxed italic">
                    "{product.ai_summary}"
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* 右カラム：データ詳細エリア */}
          <section className="flex flex-col">
            <h1 className={styles.title}>{title}</h1>
            
            <div className="flex items-baseline gap-4 mb-8">
              <div className={styles.priceContainer}>
                <span className="text-xl mr-1 text-[#ff5e78] italic font-light">¥</span>
                {price}
              </div>
              <span className="text-[10px] text-gray-500 font-bold tracking-widest uppercase">Tax Included</span>
            </div>

            {/* 📊 5軸評価 */}
            <div className="mb-10 p-6 bg-[#0f0f1e] rounded-2xl border border-[#222244]">
              <div className="flex justify-between items-end mb-6">
                <h3 className="text-xs font-black text-gray-400 tracking-widest uppercase">Performance Stats</h3>
                <div className="text-right">
                  <span className="text-3xl font-black text-white italic">{specScore}</span>
                  <span className="text-xs text-gray-600 ml-1">/100</span>
                </div>
              </div>
              
              <div className="space-y-4">
                {[
                  { label: 'VISUAL', val: product.score_visual ?? 0, color: 'from-pink-500 to-rose-500' },
                  { label: 'STORY', val: product.score_story ?? 0, color: 'from-purple-500 to-indigo-500' },
                  { label: 'EROTIC', val: product.score_erotic ?? 0, color: 'from-red-500 to-orange-500' },
                  { label: 'RARITY', val: product.score_rarity ?? 0, color: 'from-amber-500 to-yellow-500' },
                  { label: 'COST', val: product.score_cost ?? 0, color: 'from-emerald-500 to-teal-500' },
                ].map((stat) => (
                  <div key={stat.label}>
                    <div className="flex justify-between text-[9px] font-black mb-1.5 tracking-tighter">
                      <span className="text-gray-400">{stat.label}</span>
                      <span className="text-white">{stat.val}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-900 rounded-full overflow-hidden">
                      <div className={`h-full bg-gradient-to-r ${stat.color}`} style={{ width: `${Math.min(stat.val, 100)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 📋 仕様表 */}
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
                      ) : <span className="text-gray-600 italic">No Data</span>}
                    </td>
                  </tr>
                  <tr className={styles.specRow}>
                    <td className={styles.specKey}>MAKER</td>
                    <td className={styles.specValue}>
                      {product.maker?.id ? (
                        <Link href={`/maker/${product.maker.id}`} className="text-[#99e0ff] hover:text-white font-bold transition-colors">
                          {product.maker?.name || '---'}
                        </Link>
                      ) : (
                        <span className="text-gray-400">{product.maker?.name || '---'}</span>
                      )}
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

            {/* 🏷️ 特徴タグ */}
            {attributes.length > 0 && (
              <div className="mt-8">
                <h3 className="text-[10px] font-black text-gray-500 mb-3 tracking-widest uppercase">Physical & Setting</h3>
                <div className="flex flex-wrap gap-2">
                  {attributes.map((attr) => (
                    <span key={attr.id} className="text-[10px] px-3 py-1 bg-rose-950/30 text-rose-300 border border-rose-500/20 rounded-md font-bold">
                      {attr.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 🏷️ ジャンル */}
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

            {/* 🚀 アクションボタン */}
            <div className="mt-12 space-y-4">
              {product.sample_movie_url && (
                <MoviePlayerModal 
                  videoUrl={product.sample_movie_url} 
                  title={title} 
                />
              )}

              <a href={product.affiliate_url || '#'} target="_blank" rel="nofollow noopener noreferrer" className={styles.affiliateBtn}>
                <span>WATCH FULL CONTENT</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
              
              <p className="text-[9px] text-center text-gray-600 font-bold italic uppercase tracking-tight">
                ※ 移動先の外部サイトにて年齢確認が必要です。18歳未満の方はご利用いただけません。
              </p>
            </div>
          </section>
        </div>

        {/* 関連作品 */}
        {relatedProducts.length > 0 && (
          <section className={styles.relatedSection}>
            <div className="flex items-center justify-between mb-8">
              <h2 className={styles.relatedTitle}>
                MORE FROM <span className="text-[#ff5e78] ml-2">{product.maker?.name || 'MAKER'}</span>
              </h2>
              {product.maker?.id && (
                <Link href={`/maker/${product.maker.id}`} className="text-[10px] font-black text-gray-500 hover:text-white transition-all uppercase tracking-widest">
                  View All Works »
                </Link>
              )}
            </div>
            <div className={styles.relatedGrid}>
              {relatedProducts.map((p) => (
                <Link key={p.id} href={`/${currentCategory}/${p.id}`} className="no-underline group">
                  <div className={styles.relatedCard}>
                    <div className="aspect-video overflow-hidden bg-black relative">
                      <img 
                        src={p.image_url_list?.[0] || '/no-image.png'} 
                        alt={p.title || ''} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-70 group-hover:opacity-100" 
                      />
                      <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-black/60 backdrop-blur-md border border-white/10 rounded text-[9px] font-bold text-white">
                        ★ {p.spec_score ?? 0}
                      </div>
                    </div>
                    <div className="p-4 bg-[#16162d]">
                      <p className="text-[11px] font-bold text-gray-400 group-hover:text-white line-clamp-2 leading-snug transition-colors">
                        {p.title || 'Untitled'}
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