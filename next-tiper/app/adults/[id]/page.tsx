/* eslint-disable @next/next/no-img-element */
// @ts-nocheck
import React, { Suspense } from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import styles from './ProductDetail.module.css';

// --- Components (切り出したパーツたち) ---
import VisualSection from './_components/VisualSection';
import ProductHeader from './_components/ProductHeader';
import ExpertChatSection from './_components/ExpertChatSection';
import TechnicalMeta from './_components/TechnicalMeta';
import NeuralNarrative from './_components/NeuralNarrative';
import ActionArea from './_components/ActionArea';
import RelationArea from './_components/RelationArea';

import { 
  getAdultProductDetail, 
  resolveApiUrl, 
  getDjangoHeaders 
} from '@shared/lib/api/django';
import { constructMetadata } from '@shared/lib/metadata'; 
import SystemDiagnostic from '@shared/ui/SystemDiagnostic';

// --- Helpers ---
const getIdentifier = (item: any) => {
  if (!item) return '';
  return item.slug && item.slug !== "null" ? item.slug : item.id;
};

const getSafeScore = (val: any) => (typeof val === 'number' ? val : (parseInt(val) || 0));

const generateSeoDescription = (product: any) => {
  if (product.ai_summary && product.ai_summary !== "解析準備中...") return product.ai_summary;
  const actresses = product.actresses?.map(a => a.name).join(', ') || '';
  const maker = product.maker?.name || '人気メーカー';
  return `${product.title}は、${maker}がおくる${actresses ? actresses + '出演の' : ''}注目作品。`;
};

/**
 * 💡 メタデータ生成 (SEO詳細版)
 */
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;

  // 🚨 IDガード: 不正なパスでのAPI呼び出しを防止
  if (!id || id === 'main' || id === '_components' || id.includes('.')) {
    return { title: "System Node | TIPER" };
  }

  try {
    const product = await getAdultProductDetail(id);
    if (!product || product._error) return { title: "Signal Lost | TIPER" };

    const seoTitle = `${product.title} - AI解析詳細アーカイブ | TIPER`;
    const seoDesc = generateSeoDescription(product);
    const seoImage = product.thumbnail || '/og-image.png';
    const seoPath = `/adults/${id}`;

    return constructMetadata(seoTitle, seoDesc, seoImage, seoPath, false);
  } catch (error) {
    return { title: "System Error | TIPER" };
  }
}

/**
 * 💡 APIデータフェッチ
 */
async function fetchRelated(params: string) {
  try {
    const res = await fetch(resolveApiUrl(`/api/adult/unified-products/?${params}&page_size=12`), {
      headers: getDjangoHeaders(),
      next: { revalidate: 3600 }
    });
    if (res.ok) {
      const data = await res.json();
      return data.results || [];
    }
  } catch (e) { console.warn("Fetch Related Error:", e); }
  return [];
}

/**
 * 💡 メインページコンポーネント
 */
export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // 🚨 【修正】不正なID（main, _components, favicon等）を弾くガードレール
  if (!id || id === 'main' || id === '_components' || id.includes('.')) {
    return (
      <div className="min-h-screen bg-[#050510] flex flex-col items-center justify-center p-4 font-mono text-gray-500">
        <p className="text-xs uppercase tracking-[0.5em] animate-pulse">Invalid_Data_Node: {id}</p>
        <Link href="/adults" className="mt-8 text-[#e94560] border border-[#e94560] px-8 py-2 text-[10px] font-black italic hover:bg-[#e94560] hover:text-white transition-all">
          RETURN_TO_ARCHIVE_STREAM
        </Link>
      </div>
    );
  }

  let product = await getAdultProductDetail(id);

  // 製品が見つからない、またはエラーの場合
  if (!product || product._error) {
    return (
      <div className="min-h-screen bg-[#050510] flex flex-col items-center justify-center p-4 font-mono">
        <h1 className="text-white text-2xl font-black italic mb-8 tracking-widest uppercase">Signal_Lost_404</h1>
        <Link href="/adults" className="text-[#e94560] border border-[#e94560] px-8 py-3 hover:bg-[#e94560] hover:text-white transition-all font-black">
          RETURN_TO_LOBBY
        </Link>
      </div>
    );
  }

  // 関連作品の並列取得
  const [actressRelated, genreRelated, makerRelated] = await Promise.all([
    product.actresses?.[0] ? fetchRelated(`actress_id=${product.actresses[0].id}&exclude_id=${product.id}`) : [],
    product.genres?.[0] ? fetchRelated(`genre_id=${product.genres[0].id}&exclude_id=${product.id}`) : [],
    product.maker ? fetchRelated(`maker_id=${product.maker.id}&exclude_id=${product.id}`) : [],
  ]);

  const source = (product.api_source || '').toUpperCase();
  const isFanza = source === 'FANZA' || source === 'DMM';
  
  // 画像処理（高画質化）
  let jacketImage = product.image_url_list?.[0] || product.thumbnail || '/placeholder.png';
  if (isFanza && jacketImage !== '/placeholder.png') {
    jacketImage = jacketImage.replace(/p[s|t|m]\.jpg/i, 'pl.jpg').replace(/_[s|m]\.jpg/i, '_l.jpg');
  }
  const galleryImages = product.image_url_list?.length > 0 ? product.image_url_list : [jacketImage];

  // 動画データ
  let movieData = null;
  if (product.sample_movie_url) {
    const url = typeof product.sample_movie_url === 'object' ? product.sample_movie_url.url : product.sample_movie_url;
    if (url) movieData = { url, preview_image: jacketImage };
  }

  // レーダーチャート用スコア設定
  const radarData = [
    { subject: 'VISUAL', A: getSafeScore(product.score_visual), fullMark: 100 },
    { subject: 'STORY', A: getSafeScore(product.score_story), fullMark: 100 },
    { subject: 'EROTIC', A: getSafeScore(product.score_erotic), fullMark: 100 },
    { subject: 'RARITY', A: getSafeScore(product.score_rarity), fullMark: 100 },
    { subject: 'FETISH', A: getSafeScore(product.score_fetish), fullMark: 100 },
  ];
  const barChartData = [
    { label: 'VISUAL', score: getSafeScore(product.score_visual), color: 'bg-blue-500' },
    { label: 'STORY', score: getSafeScore(product.score_story), color: 'bg-purple-500' },
    { label: 'EROTIC', score: getSafeScore(product.score_erotic), color: 'bg-pink-500' },
    { label: 'RARITY', score: getSafeScore(product.score_rarity), color: 'bg-yellow-500' },
    { label: 'COST', score: getSafeScore(product.score_cost_performance), color: 'bg-green-500' },
    { label: 'FETISH', score: getSafeScore(product.score_fetish), color: 'bg-orange-500' },
  ];

  return (
    <div className={`${styles.wrapper} ${isFanza ? styles.fanzaTheme : styles.dugaTheme}`}>
      <nav className={styles.nav}>
        <div className="max-w-[1440px] w-full mx-auto px-6 flex justify-between items-center">
          <Link href="/adults" className={styles.backLink}>« ARCHIVE_STREAM</Link>
          <div className="flex items-center gap-4">
            <span className="text-[9px] font-mono text-gray-500 hidden md:block">DATA_STREAM_ACTIVE</span>
            <div className="bg-[#e94560] text-white px-3 py-1 text-[10px] font-black italic uppercase">{source}</div>
          </div>
        </div>
      </nav>

      <main className={styles.mainContainer}>
        <div className={styles.gridContent}>
          
          {/* 🧩 左サイド: ビジュアルパーツ */}
          <aside className="lg:sticky lg:top-24 space-y-8 h-fit">
            <VisualSection 
              product={product} 
              jacketImage={jacketImage} 
              galleryImages={galleryImages} 
              radarData={radarData}
              barChartData={barChartData} // 👈 追加
              specScore={product.spec_score} // 👈 合計スコアも渡すと便利
              movieData={movieData} 
              source={source} 
            />
          </aside>

          {/* 🧩 右サイド: メインコンテンツ（パズルエリア） */}
          <article className="space-y-12">
            <ProductHeader product={product} source={source} />
            
            {/* ★ LINE風チャットセクション */}
            <ExpertChatSection logs={product.ai_chat_comments} />

            <TechnicalMeta product={product} getIdentifier={getIdentifier} />
            
            <NeuralNarrative content={product.ai_content} />
            
            <ActionArea 
              product={product} 
              movieData={movieData} 
              isFanza={isFanza} 
              id={id} 
              source={source} 
            />
          </article>
        </div>

        {/* 🧩 関連作品セクション */}
        <RelationArea 
          actressRelated={actressRelated} 
          genreRelated={genreRelated} 
          makerRelated={makerRelated} 
          product={product} 
        />
      </main>

      {/* システム診断用データ表示 */}
      <SystemDiagnostic id={id} source={source} data={product} />
    </div>
  );
}