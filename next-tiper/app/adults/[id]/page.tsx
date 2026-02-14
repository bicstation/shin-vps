/* eslint-disable @next/next/no-img-element */
// @ts-nocheck
/**
 * ==============================================================================
 * 🌌 TIPER Product Detail - Full Spectrum Matrix (V8.1)
 * [DEBUG_TOP_BRIDGE + AI_SEO_ENHANCED + SIDEBAR_API_MONITOR + FULL_DENSITY]
 * ==============================================================================
 * 🚀 FIXED: API Endpoint resolution via resolveApiUrl for internal/external sync
 */

export const dynamic = 'force-dynamic';

import React, { Suspense } from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import styles from './ProductDetail.module.css';

// ✅ 共通ライブラリ・コンポーネント
import { 
  getAdultProductDetail, 
  getAdultProducts, 
  resolveApiUrl, 
  getDjangoHeaders 
} from '@shared/lib/api/django';
import { constructMetadata } from '@shared/lib/metadata'; 
import AdultProductCard from '@shared/cards/AdultProductCard';
import AdultProductGallery from '@shared/cards/AdultProductGallery';
import MoviePlayerModal from '@shared/product/MoviePlayerModal';
import RadarChart from '@shared/ui/RadarChart';
import SystemDiagnostic from '@shared/ui/SystemDiagnostic'; // 🛰️ デバッグコンポーネント

const getIdentifier = (item: any) => {
  if (!item) return '';
  return item.slug && item.slug !== "null" ? item.slug : item.id;
};

/**
 * 💡 AI自律型メタデータ生成 (SEO強化版)
 */
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  try {
    const product = await getAdultProductDetail(id);
    if (!product || product._error) return constructMetadata("作品未検出", "Node Not Found");

    const actressNames = product.actresses?.map(a => a.name).join(', ') || '';
    const makerName = product.maker?.name || 'メーカー不明';
    const score = product.spec_score ?? 0;
    
    // AI SEOタイトルロジック
    let aiPrefix = '';
    if (score >= 95) aiPrefix = '【究極神作】';
    else if (score >= 85) aiPrefix = '【超高評価】';
    else if (product.score_rarity > 80) aiPrefix = '【激レア】';
    
    const seoTitle = `${aiPrefix}${product.title || '詳細'} | ${actressNames ? `${actressNames}出演 | ` : ''}${makerName} | tiper.live`;
    const seoDescription = `【${makerName}】${actressNames ? `出演：${actressNames}。` : ''} AI解析スコア${score}点。${product.ai_summary || product.title}`.slice(0, 160);

    let ogImage = product.image_url_list?.[0] || product.image_url;
    return constructMetadata(seoTitle, seoDescription, ogImage, true);
  } catch (error) {
    return constructMetadata("System Error", "Connection Lost");
  }
}

/**
 * 🌀 ローディング・フォールバック
 */
function DetailLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0a1a] font-mono">
      <div className="text-[#e94560] text-sm animate-pulse tracking-[0.5em] mb-4">INITIALIZING_DATA_STREAM...</div>
      <div className="w-64 h-[2px] bg-white/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-[#e94560] animate-[shimmer_2s_infinite]" style={{ width: '100%' }} />
      </div>
      <p className="mt-4 text-[10px] text-gray-600">PLEASE_WAIT_WHILE_DECRYPTING_NODE</p>
    </div>
  );
}

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<DetailLoading />}>
      <DetailContent params={params} />
    </Suspense>
  );
}

/**
 * 🛠️ 内部コンテンツレンダラー
 */
async function DetailContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const currentCategory = 'adults';
  const isDebugVisible = true; 

  let product = null;
  let fetchError = null;
  try {
    product = await getAdultProductDetail(id);
  } catch (e) { 
    fetchError = e.message;
    console.error("Fetch error:", e); 
  }

  // --- 🛰️ [DEBUG_MATRIX] 最上部デバッグレイヤー ---
  const debugLayer = isDebugVisible && (
    <section className="w-full bg-[#050510] border-b-2 border-yellow-500 p-6 font-mono text-[10px] text-yellow-500 z-[9999] relative">
      <div className="max-w-[1440px] mx-auto">
        <div className="flex justify-between items-center mb-4 border-b border-yellow-500/30 pb-2">
          <h3 className="text-sm font-black italic tracking-widest uppercase">📡 SYSTEM_DEBUG_TOP_BRIDGE // STATUS: {product ? 'ONLINE' : 'ERROR'}</h3>
          <span className="bg-yellow-500 text-black px-2 py-0.5 font-black tracking-tighter">DEV_STREAM_ACTIVE</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2 bg-black/40 p-4 border border-white/5">
            <p className="text-gray-500 uppercase font-black text-[9px]">Archive_Metrics</p>
            <p>ID: <span className="text-white">{id}</span></p>
            <p>SOURCE: <span className="text-white">{(product?.api_source || 'NULL').toUpperCase()}</span></p>
            <p>IMG_COUNT: <span className="text-white">{product?.image_url_list?.length || 0}</span></p>
            <p>ERROR_LOG: <span className="text-red-500">{fetchError || 'NONE'}</span></p>
          </div>
          <div className="md:col-span-2 bg-black/80 p-4 border border-white/5 overflow-auto max-h-[220px]">
            <p className="text-gray-500 uppercase mb-2 font-black text-[9px]">RAW_JSON_PREVIEW</p>
            <pre className="text-blue-300 whitespace-pre-wrap leading-tight text-[9px]">
              {JSON.stringify(product, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </section>
  );

  if (!product || product._error) {
    return (
      <div className="min-h-screen bg-[#0a0a1a]">
        {debugLayer}
        <div className={styles.notFound}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-900/10 via-transparent to-transparent opacity-50" />
          <h1 className="text-white text-4xl font-black italic uppercase relative z-10">Signal Lost_</h1>
          <p className="text-gray-500 font-mono mt-2 relative z-10 uppercase tracking-widest text-xs">Error: Content_Not_Found_In_Archive</p>
          <Link href={`/${currentCategory}`} className="mt-12 px-8 py-3 border border-[#e94560] text-[#e94560] hover:bg-[#e94560] hover:text-white transition-all relative z-10 font-black italic">
            « RE-ESTABLISH CONNECTION
          </Link>
        </div>
      </div>
    );
  }

  const source = (product.api_source || '').toUpperCase();
  const isDuga = source === 'DUGA';
  const isFanza = source === 'FANZA' || source === 'DMM';
  const themeClass = isDuga ? styles.dugaTheme : isFanza ? styles.fanzaTheme : '';

  // --- 🖼️ 画像最適化ロジック (Jacket & Gallery) ---
  let jacketImage = product.image_url_list?.[0] || product.image_url || '/placeholder.png';
  if (isDuga) {
    jacketImage = jacketImage.replace(/(\/|\d+x\d+|jacket_)\d+(x\d+)?\.jpg/i, '/jacket.jpg').replace(/jacket_\d+\.jpg/i, 'jacket.jpg');
  } else if (isFanza) {
    jacketImage = jacketImage.replace(/p[s|t|m]\.jpg/i, 'pl.jpg').replace(/_[s|m]\.jpg/i, '_l.jpg');
  }

  const galleryImages = Array.isArray(product.image_url_list) && product.image_url_list.length > 0 
    ? product.image_url_list 
    : [jacketImage];
  
  let movieData = null;
  if (product.sample_movie_url) {
    if (typeof product.sample_movie_url === 'object' && product.sample_movie_url !== null) {
      movieData = { 
        url: product.sample_movie_url.url || '', 
        preview_image: product.sample_movie_url.preview_image || jacketImage 
      };
    } else if (typeof product.sample_movie_url === 'string' && product.sample_movie_url.length > 0) {
      movieData = { 
        url: product.sample_movie_url, 
        preview_image: jacketImage 
      };
    }
  }

  // --- 📊 統計データ ---
  const getSafeScore = (val: any) => (typeof val === 'number' ? val : (parseInt(val) || 0));
  const statsData = [
    { label: 'VISUAL', val: getSafeScore(product.score_visual), color: 'from-pink-500 to-rose-500' },
    { label: 'STORY', val: getSafeScore(product.score_story), color: 'from-blue-500 to-indigo-500' },
    { label: 'EROTIC', val: getSafeScore(product.score_erotic), color: 'from-red-600 to-orange-500' },
    { label: 'RARITY', val: getSafeScore(product.score_rarity), color: 'from-amber-400 to-yellow-500' },
    { label: 'COST',   val: getSafeScore(product.score_cost),   color: 'from-emerald-400 to-teal-500' }, 
  ];
  const radarData = statsData.map(s => ({ subject: s.label, value: s.val, A: s.val, fullMark: 100 }));
  
  const rankingTrend = [
    { day: '7D', val: 82 }, { day: '6D', val: 75 }, { day: '5D', val: 90 },
    { day: '4D', val: 40 }, { day: '3D', val: 25 }, { day: '2D', val: 12 }, { day: 'NOW', val: 8 }
  ];

  // --- 🧬 内部AI：短評生成 ---
  const generateAiShortComment = (p) => {
    const s = getSafeScore(p.spec_score);
    if (s >= 90) return "【AI最高評価】業界標準を凌駕するパラメータを計測。即時アーカイブ推奨。";
    if (getSafeScore(p.score_visual) >= 90) return "【映像美極致】高精細なビジュアルデータが深層心理にダイレクトに介入します。";
    if (getSafeScore(p.score_rarity) >= 85) return "【希少アーカイブ】再構成の困難な独自の属性を保持したレア・ノードです。";
    return "【標準適合】全システムにおいて安定した出力を確認。高品質なアーカイブです。";
  };

  // --- 🔗 関連商品API：統合レコメンドエンジン(Unified)の強制発動 ---
  let relatedProducts = [];
  let relatedError = null;

  try {
    const targetId = product.product_id_unique || product.display_id || product.unique_id;

    // 💡 修正ポイント: resolveApiUrl を使用して内部/外部のURL解決を安全に行う
    const targetApiUrl = resolveApiUrl(`/api/unified-adult-products/?related_to_id=${targetId}&page_size=12`);

    const response = await fetch(targetApiUrl, {
      method: 'GET',
      headers: getDjangoHeaders(), // ヘッダーも共通関数から取得
      cache: 'no-store' 
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
    const data = await response.json();
    relatedProducts = data.results || [];

    console.log(`[RELATION_SYNC_COMPLETE] NODE: ${targetId} | SCORE_BASED_ALIGNMENT: ${relatedProducts.length} ITEMS`);

  } catch (e) { 
    relatedError = e.message;
    console.warn("⚠️ Related fetch failed (Unified engine bypass):", e); 
    
    try {
      const fallback = await getAdultProducts({ 
        related_to_id: product.display_id || product.product_id_unique, 
        limit: 12 
      });
      relatedProducts = fallback?.results || [];
    } catch (fallbackError) {
      console.error("Critical: All relation paths failed.");
    }
  }

  const displayTitle = product.title || 'Untitled Archive';
  const priceDisplay = typeof product.price === 'number' ? product.price.toLocaleString() : '---';

  return (
    <div className={`${styles.wrapper} ${themeClass}`}>
      {debugLayer}

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org", "@type": "Product", "name": displayTitle, "image": jacketImage,
        "description": product.ai_summary || product.title, "brand": { "@type": "Brand", "name": product.maker?.name },
        "aggregateRating": { "@type": "AggregateRating", "ratingValue": (getSafeScore(product.spec_score)/20).toFixed(1), "reviewCount": "1" }
      }) }} />

      <nav className={styles.nav}>
        <div className="max-w-[1440px] mx-auto px-[5%] flex justify-between items-center w-full">
          <Link href={`/${currentCategory}`} className={styles.backLink}>« EXPLORE_{source || 'CORE'}_STREAM</Link>
          <div className={isDuga ? styles.sourceBadgeDuga : isFanza ? styles.sourceBadgeFanza : styles.sourceBadge}>{source || 'AI_VIRTUAL'}</div>
        </div>
      </nav>

      <main className={styles.mainContainer}>
        {/* HERO SECTION */}
        <section className={styles.visualHeroSection}>
          <div className={styles.visualGrid}>
            <div className={styles.jacketColumn}>
              <div className={styles.jacketWrapper}>
                <img src={jacketImage} alt={displayTitle} className={styles.jacketImage} />
                <div className={styles.jacketOverlay} /><div className={styles.scanline} /><div className={styles.cornerMarker} />
                <div className={styles.jacketLabel}>NODE_ACTIVE</div>
              </div>
            </div>
            <div className={styles.galleryColumn}>
              <AdultProductGallery 
                images={galleryImages} 
                title={displayTitle} 
                apiSource={source} 
                sampleMovieData={movieData} 
              />
            </div>
          </div>
        </section>

        <div className={styles.gridContent}>
          {/* LEFT COLUMN */}
          <section className="space-y-8">
            <div className="bg-[#e94560]/10 border-l-4 border-[#e94560] p-6 relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-2 opacity-20 text-[20px] font-black italic">AI_REPORT</div>
               <span className="text-[10px] font-black text-[#e94560] block mb-2 tracking-[0.3em]">AI_QUICK_VERDICT:</span>
               <p className="text-sm italic text-white/90 relative z-10 leading-relaxed">"{generateAiShortComment(product)}"</p>
               <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#e94560]/50 to-transparent" />
            </div>

            {product.ai_summary && (
              <div className={styles.aiSummaryCard}>
                <div className={styles.aiLabel}>Expert AI_Report</div>
                <p className={styles.aiText}>"{product.ai_summary}"</p>
                <div className="mt-8 p-6 bg-black/40 rounded border border-white/5 flex flex-col items-center justify-center min-h-[280px]">
                    <RadarChart data={radarData} />
                </div>
                <div className={styles.aiReflection} />
              </div>
            )}

            <div className="p-8 bg-[#111125]/40 rounded-sm border border-white/5">
              <h4 className="text-[10px] font-black text-gray-400 uppercase mb-8 tracking-[0.4em]">Node_Market_Volatility</h4>
              <div className="flex items-end justify-between h-20 gap-1.5 px-2">
                {rankingTrend.map((t, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center group">
                    <div className="w-full bg-white/5 relative flex items-end h-full">
                      <div className="w-full bg-gradient-to-t from-[#e94560]/20 to-[#e94560] transition-all duration-1000" style={{ height: `${100 - t.val}%` }} />
                    </div>
                    <span className="text-[7px] font-mono text-gray-500 mt-2">{t.day}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-8 bg-[#111125]/40 rounded-sm border border-white/5">
              <h4 className="text-[10px] font-black text-gray-400 uppercase mb-6 tracking-[0.4em]">Semantic_Tags</h4>
              <div className="flex flex-wrap gap-2">
                {product.attributes?.map((attr) => (
                   <span key={attr.id} className="px-3 py-1.5 bg-[#e94560]/10 border border-[#e94560]/30 text-[#e94560] text-[11px] font-black italic uppercase">#{attr.name}</span>
                ))}
                {product.genres?.map((genre) => (
                  <Link key={genre.id} href={`/genre/${getIdentifier(genre)}`} className="px-3 py-1.5 bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-[#e94560] text-[11px] font-black italic uppercase transition-colors">#{genre.name}</Link>
                ))}
              </div>
            </div>
          </section>

          {/* RIGHT COLUMN */}
          <section className="flex flex-col">
            <h1 className={styles.detailTitle}>{displayTitle}</h1>
            
            <div className={styles.priceContainer}>
              <span className="text-xl mr-2 text-[#e94560] italic opacity-60">¥</span>
              <span className="text-4xl font-black tabular-nums">{priceDisplay}</span>
            </div>

            <div className={styles.statsCard}>
              <div className="flex justify-between items-end mb-8">
                <h3 className="text-[10px] font-black text-gray-500 tracking-[0.4em] uppercase">AI_Performance_Matrix</h3>
                <div className="text-right">
                  <span className="text-4xl font-black text-white italic">{getSafeScore(product.spec_score)}</span>
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

            <div className="mt-12 p-1 bg-gradient-to-br from-[#e94560] via-[#533483] to-[#0f3460] rounded-sm shadow-[0_0_50px_rgba(233,69,96,0.2)]">
              <div className="bg-[#0a0a1a] p-8 rounded-[1px] relative overflow-hidden">
                <div className="absolute top-[-10px] left-[-10px] text-[40px] font-black text-white/[0.03] pointer-events-none italic uppercase">ACCESS_GRANTED</div>
                <div className="mb-8 relative z-10">
                    <span className="text-[10px] font-black text-[#e94560] tracking-[0.3em] uppercase block mb-2 animate-pulse">Connection_Secure</span>
                    <h3 className="text-2xl font-black text-white italic tracking-tighter">本編アーカイブを閲覧する</h3>
                </div>
                <div className="space-y-4 relative z-10">
                  <a href={product.affiliate_url || '#'} target="_blank" rel="nofollow noopener noreferrer" className={isDuga ? styles.affiliateBtnDuga : isFanza ? styles.affiliateBtnFanza : styles.affiliateBtn}>
                    <span className="text-sm font-black uppercase tracking-[0.4em]">Unlock_Full_Archive</span>
                  </a>
                  {movieData?.url && (
                    <div className="mt-6 border border-white/10 bg-black/40 overflow-hidden relative p-2">
                        <MoviePlayerModal videoUrl={movieData.url} title={displayTitle} isIframe={isFanza} />
                        <div className={`absolute -top-2 -right-2 px-3 py-1 text-black text-[9px] font-black uppercase skew-x-[-15deg] ${isFanza ? 'bg-[#ff0080]' : 'bg-[#00d1b2]'}`}>MODAL_PREVIEW</div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className={styles.specTableContainer}>
              <table className={styles.specTable}>
                <tbody>
                  <tr className={styles.specRow}>
                    <td className={styles.specKey}>ACTRESS</td>
                    <td className={styles.specValue}>
                      <div className="flex flex-wrap gap-2 justify-end">
                        {product.actresses?.map((act) => (
                          <Link key={act.id} href={`/actress/${getIdentifier(act)}`} className={styles.actressLink}>{act.name}</Link>
                        ))}
                      </div>
                    </td>
                  </tr>
                  <tr className={styles.specRow}>
                    <td className={styles.specKey}>MAKER</td>
                    <td className={styles.specValue}>
                      <Link href={`/maker/${getIdentifier(product.maker)}`} className="text-[#00d1b2] font-black hover:underline uppercase">{product.maker?.name || '---'}</Link>
                    </td>
                  </tr>
                  {product.series && (
                    <tr className={styles.specRow}>
                      <td className={styles.specKey}>SERIES</td>
                      <td className={styles.specValue}>
                        <Link href={`/series/${getIdentifier(product.series)}`} className="text-gray-400 hover:text-white transition-colors">{product.series.name}</Link>
                      </td>
                    </tr>
                  )}
                  {product.release_date && (
                    <tr className={styles.specRow}>
                      <td className={styles.specKey}>RELEASE</td>
                      <td className={styles.specValue}><span className="text-gray-400 font-mono tracking-tighter">{product.release_date}</span></td>
                    </tr>
                  )}
                  {product.duration && (
                    <tr className={styles.specRow}>
                      <td className={styles.specKey}>RUNTIME</td>
                      <td className={styles.specValue}><span className="text-gray-400 font-mono">{product.duration} min</span></td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* RELATED SECTION */}
        {relatedProducts.length > 0 && (
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
        )}

        {/* 🛰️ SYSTEM_DIAGNOSTIC_TERMINAL (Ver. 3.5 Extended) */}
        <SystemDiagnostic 
          id={id}
          source={source}
          targetUrl={`/api/adults/${id}`}
          data={product}              // メインペイロード
          secondaryData={relatedProducts} // ⬅️ 別枠で関連商品のAPI結果を表示
          errorMsg={fetchError}
          secondaryError={relatedError}
          apiInternalUrl={process.env.NEXT_PUBLIC_API_URL || 'DJANGO_INTERNAL_STREAM'}
        />

      </main>
    </div>
  );
}