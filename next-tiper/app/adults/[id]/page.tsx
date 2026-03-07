/* eslint-disable @next/next/no-img-element */
/**
 * 📂 app/adults/[id]/page.tsx
 * 🛡️ Tiper v3.2 物理構造同期版
 */
import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import styles from './ProductDetail.module.css';

// --- Components (Path normalized to STRUCTURE v3.2) ---
import VisualSection from './_components/VisualSection';
import ProductHeader from './_components/ProductHeader';
import ExpertChatSection from './_components/ExpertChatSection';
import TechnicalMeta from './_components/TechnicalMeta';
import NeuralNarrative from './_components/NeuralNarrative';
import ActionArea from './_components/ActionArea';
import RelationArea from './_components/RelationArea';

// API & UI Components
import { getAdultProductDetail, resolveApiUrl, getDjangoHeaders } from '@/shared/lib/api/django';
import { constructMetadata } from '@/shared/lib/utils/metadata';
import SystemDiagnosticHero from '@/shared/components/molecules/SystemDiagnosticHero.tsx';

interface PageProps {
  params: Promise<{ id: string }>;
}

/**
 * 💡 ヘルパー: ID/Slug解決
 */
const getIdentifier = (item: any) => {
  if (!item) return '';
  return item.slug && item.slug !== "null" ? item.slug : item.id;
};

/**
 * 💡 ヘルパー: スコア安全値（0除外）
 */
const getSafeScore = (val: any) => {
  const n = typeof val === 'number' ? val : (parseInt(val) || 0);
  return n > 0 ? n : 5; 
};

/**
 * 💡 SEO メタデータ生成
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  if (!id || id === 'main' || id.includes('.')) return { title: "System Node | TIPER" };

  try {
    const product = await getAdultProductDetail(id);
    if (!product || product._error) return { title: "Signal Lost | TIPER" };

    const seoTitle = `${product.title} - AI解析詳細アーカイブ | TIPER`;
    const seoDesc = product.ai_summary || `${product.title}のAI解析レビュー。`;
    const seoImage = product.thumbnail || '/og-image.png';
    const seoPath = `/adults/${id}`;

    return constructMetadata(seoTitle, seoDesc, seoImage, seoPath, false);
  } catch {
    return { title: "System Error | TIPER" };
  }
}

/**
 * 💡 関連作品フェッチ
 */
async function fetchRelated(queryParams: string) {
  try {
    const res = await fetch(resolveApiUrl(`/api/adult/unified-products/?${queryParams}&page_size=12`), {
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
 * 🏗️ メインコンポーネント
 */
export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = await params;

  // ガード
  if (!id || ['main', '_components'].includes(id) || id.includes('.')) {
    return (
      <div className="min-h-screen bg-[#050510] flex flex-col items-center justify-center p-4 font-mono">
        <p className="text-xs uppercase tracking-[0.5em] text-gray-500">Invalid_Node: {id}</p>
        <Link href="/adults" className="mt-8 text-[#e94560] border border-[#e94560] px-8 py-2 text-[10px] font-black italic hover:bg-[#e94560] hover:text-white transition-all">
          RETURN_TO_STREAM
        </Link>
      </div>
    );
  }

  const product = await getAdultProductDetail(id);
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

  // 📡 並列データ取得
  const [actressRelated, genreRelated, makerRelated] = await Promise.all([
    product.actresses?.[0] ? fetchRelated(`actress_id=${product.actresses[0].id}&exclude_id=${product.id}`) : [],
    product.genres?.[0] ? fetchRelated(`genre_id=${product.genres[0].id}&exclude_id=${product.id}`) : [],
    product.maker ? fetchRelated(`maker_id=${product.maker.id}&exclude_id=${product.id}`) : [],
  ]);

  const source = (product.api_source || '').toUpperCase();
  const isFanza = source === 'FANZA' || source === 'DMM';
  
  // 🖼️ 画像最適化
  let jacketImage = product.image_url_list?.[0] || product.thumbnail || '/placeholder.png';
  if (isFanza && jacketImage !== '/placeholder.png') {
    jacketImage = jacketImage.replace(/p[s|t|m]\.jpg/i, 'pl.jpg').replace(/_[s|m]\.jpg/i, '_l.jpg');
  }
  const galleryImages = product.image_url_list?.length > 0 ? product.image_url_list : [jacketImage];

  // 🎬 動画
  let movieData = null;
  if (product.sample_movie_url) {
    const url = typeof product.sample_movie_url === 'object' ? product.sample_movie_url.url : product.sample_movie_url;
    if (url) movieData = { url, preview_image: jacketImage };
  }

  // 📊 グラフデータ
  const radarData = [
    { subject: 'VISUAL', value: getSafeScore(product.score_visual), fullMark: 100 },
    { subject: 'STORY', value: getSafeScore(product.score_story), fullMark: 100 },
    { subject: 'EROTIC', value: getSafeScore(product.score_erotic), fullMark: 100 },
    { subject: 'RARITY', value: getSafeScore(product.score_rarity), fullMark: 100 },
    { subject: 'FETISH', value: getSafeScore(product.score_fetish), fullMark: 100 },
  ];

  const barChartData = [
    { label: 'VISUAL', value: getSafeScore(product.score_visual), color: 'bg-blue-500' },
    { label: 'STORY', value: getSafeScore(product.score_story), color: 'bg-purple-500' },
    { label: 'EROTIC', value: getSafeScore(product.score_erotic), color: 'bg-pink-500' },
    { label: 'RARITY', value: getSafeScore(product.score_rarity), color: 'bg-yellow-500' },
    { label: 'COST', value: getSafeScore(product.score_cost_performance), color: 'bg-green-500' },
    { label: 'FETISH', value: getSafeScore(product.score_fetish), color: 'bg-orange-500' },
  ];

  return (
    <div className={`${styles.wrapper} ${isFanza ? styles.fanzaTheme : styles.dugaTheme}`}>
      <nav className={styles.nav}>
        <div className="max-w-[1440px] w-full mx-auto px-6 flex justify-between items-center">
          <Link href="/adults" className={styles.backLink}>« ARCHIVE_STREAM</Link>
          <div className="flex items-center gap-4">
            <div className={styles.sourceBadge}>{source}</div>
          </div>
        </div>
      </nav>

      <main className={styles.mainContainer}>
        <div className={styles.gridContent}>
          <aside className="lg:sticky lg:top-24 space-y-8 h-fit">
            <VisualSection 
              product={product} 
              jacketImage={jacketImage} 
              galleryImages={galleryImages} 
              radarData={radarData}
              barChartData={barChartData}
              specScore={product.spec_score} 
              movieData={movieData} 
              source={source} 
            />
          </aside>

          <article className="space-y-12">
            <ProductHeader product={product} source={source} />
            <NeuralNarrative content={product.ai_content} />
            <ExpertChatSection logs={product.ai_chat_comments} />
            <TechnicalMeta product={product} getIdentifier={getIdentifier} />
            <ActionArea product={product} movieData={movieData} isFanza={isFanza} id={id} source={source} />
          </article>
        </div>

        <RelationArea 
          actressRelated={actressRelated} 
          genreRelated={genreRelated} 
          makerRelated={makerRelated} 
          product={product} 
        />
      </main>

      <SystemDiagnostic id={id} source={source} data={product} />
    </div>
  );
}