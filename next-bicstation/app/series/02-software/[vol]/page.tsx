// /home/maya/shin-vps/next-bicstation/app/series/02-software/[vol]/page.tsx
/* eslint-disable @next/next/no-img-element */
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, LayoutGrid, AlertCircle, ShoppingCart } from 'lucide-react';

// ✅ 分離したスタイルをインポート
import './series-article.css';


// ✅ データのインポート
import { SOFTWARE_GUIDE_DATA } from '../data';

/**
 * アフィリエイト表示用データ変換
 */
async function getAffiliateDisplayData(affiliate: any) {
  if (!affiliate) return null;
  return {
    amazonUrl: affiliate.amazonAsin ? `https://www.amazon.co.jp/dp/${affiliate.amazonAsin}?tag=YOUR_TAG` : null,
    rakutenUrl: affiliate.rakutenId ? `https://hb.afl.rakuten.co.jp/hgc/g00...` : null,
    directUrl: affiliate.directUrl || null,
    label: affiliate.label || "詳細をチェックする"
  };
}

export default async function SeriesVolumePage({ 
  params 
}: { 
  params: Promise<{ vol: string }> 
}) {
  const resolvedParams = await params;
  const volNum = parseInt(resolvedParams.vol, 10);

  // データソースの安全性確保
  const safeSource = Array.isArray(SOFTWARE_GUIDE_DATA) ? SOFTWARE_GUIDE_DATA : [];
  
  const seriesInfo = safeSource.find((d) => {
    const dVol = typeof d.vol === 'string' ? parseInt(d.vol, 10) : d.vol;
    return dVol === volNum;
  });

  if (!seriesInfo) return notFound();

  const prevData = safeSource.find(d => (typeof d.vol === 'string' ? parseInt(d.vol, 10) : d.vol) === volNum - 1);
  const nextData = safeSource.find(d => (typeof d.vol === 'string' ? parseInt(d.vol, 10) : d.vol) === volNum + 1);

  // --- 🌌 物理パスの解決 ---
  const filePath = path.join(process.cwd(), 'app/series/02-software', `vol${volNum}.md`);

  // --- 📝 コンテンツの読み込み ---
  let markdownContent = "";
  let frontMatter: any = {};

  if (fs.existsSync(filePath)) {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const { content, data } = matter(fileContent);
    markdownContent = content;
    frontMatter = data;
  } else {
    // 物理ファイル欠落時の Maya によるエラーハンドリング
    return (
      <div className="min-h-screen flex items-center justify-center bg-black px-6">
        <div className="max-w-md w-full text-center space-y-8 p-12 border border-zinc-800 rounded-[2rem] bg-zinc-900/30 backdrop-blur-xl">
          <AlertCircle className="w-16 h-16 text-emerald-500/80 mx-auto animate-pulse" />
          <div className="space-y-4">
            <h1 className="text-sm font-mono text-emerald-500 tracking-[0.4em] uppercase opacity-70">Physical_Link_Broken</h1>
            <h2 className="text-2xl font-black text-white leading-tight">Vol.{volNum} : {seriesInfo.title}</h2>
            <p className="text-zinc-500 font-mono text-xs leading-relaxed">
              Markdownファイルが見つかりません。パスを確認してください:<br />
              <code className="text-[10px] text-emerald-400/70 block mt-2 break-all bg-black/50 p-2 rounded">{filePath}</code>
            </p>
          </div>
          <Link href="/series/02-software" className="inline-flex items-center gap-2 text-[10px] font-mono text-zinc-400 hover:text-emerald-400 transition-all uppercase tracking-widest border border-zinc-700 px-6 py-3 rounded-full">
            <ChevronLeft size={14} /> Back_to_Terminal
          </Link>
        </div>
      </div>
    );
  }

  // --- 🖼️ アイキャッチ画像の解決 ---
  const eyeCatchPhase = Math.ceil(volNum / 10);
  const eyeCatchUrl = `/images/series/02-software/eye-catch-${eyeCatchPhase}.jpg`;
  
  const affiliateData = await getAffiliateDisplayData(seriesInfo.affiliate);

  return (
    <article className="series-article-container">
      {/* 🌌 ヒーローセクション */}
      <header className="series-hero">
        <img src={eyeCatchUrl} alt="" className="series-hero-img" />
        <div className="series-hero-overlay" />
        
        <div className="absolute inset-0 flex flex-col justify-end max-w-5xl mx-auto px-6 pb-16">
          <div className="flex items-center gap-4 mb-6">
            <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-black uppercase tracking-[0.3em] rounded-sm">
              {seriesInfo.category}
            </span>
            <span className="text-zinc-500 font-mono text-[10px] tracking-[0.3em] uppercase opacity-60">
              System_Build / Vol_{String(volNum).padStart(2, '0')}
            </span>
          </div>
          <h1 className="text-4xl md:text-7xl font-black text-white mb-8 tracking-tighter leading-[0.9] max-w-4xl">
            {frontMatter.title || seriesInfo.title}
          </h1>
          <p className="text-lg md:text-2xl text-zinc-400 leading-relaxed max-w-2xl font-light italic border-l-4 border-emerald-500/50 pl-8">
            {frontMatter.description || seriesInfo.description}
          </p>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-20">
        {/* 🏷️ タグ */}
        <div className="flex flex-wrap gap-3 mb-16">
          {seriesInfo.tags?.map((tag: string) => (
            <span key={tag} className="text-[10px] font-mono px-3 py-1 bg-zinc-900 text-zinc-500 rounded-full border border-zinc-800 uppercase tracking-tighter hover:border-emerald-400 transition-colors">
              #{tag}
            </span>
          ))}
        </div>

        {/* 🖋️ メインコンテンツ (✅ ライブラリによる自動パース) */}
        <section className="series-content-body">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {markdownContent}
          </ReactMarkdown>
        </section>

        {/* 🛒 アフィリエイトセクション */}
        {affiliateData && (
          <section className="series-affiliate-section mt-32">
            <div className="relative z-10 p-10 border border-zinc-800 rounded-[2.5rem] bg-zinc-900/20 backdrop-blur-md">
              <div className="flex items-center gap-3 mb-2">
                <ShoppingCart className="text-emerald-500 w-5 h-5" />
                <h3 className="text-2xl font-black text-white tracking-tight">Maya's Logical Selection</h3>
              </div>
              <p className="text-zinc-600 text-[10px] mb-10 font-mono uppercase tracking-[0.4em] italic">Procurement_Analysis_Verified</p>
              
              <div className="grid gap-4 sm:grid-cols-2">
                {affiliateData.amazonUrl && (
                  <a href={affiliateData.amazonUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-6 bg-black border border-zinc-800 hover:border-orange-500/40 rounded-2xl transition-all group/link shadow-xl">
                    <span className="font-bold text-zinc-400 group-hover/link:text-orange-400 transition-colors">Amazon</span>
                    <span className="text-[10px] font-mono text-zinc-600 border border-zinc-800 px-2 py-1 rounded">CHECK_DEAL</span>
                  </a>
                )}
                {affiliateData.rakutenUrl && (
                  <a href={affiliateData.rakutenUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-6 bg-black border border-zinc-800 hover:border-red-500/40 rounded-2xl transition-all group/link shadow-xl">
                    <span className="font-bold text-zinc-400 group-hover/link:text-red-400 transition-colors">Rakuten</span>
                    <span className="text-[10px] font-mono text-zinc-600 border border-zinc-800 px-2 py-1 rounded">CHECK_DEAL</span>
                  </a>
                )}
              </div>
            </div>
          </section>
        )}

        {/* 🧭 ナビゲーション */}
        <footer className="mt-40 pt-16 border-t border-zinc-900">
          <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-8">
            <div className="min-h-[60px]">
              {prevData && (
                <Link href={`/series/01-hardware/${volNum - 1}`} className="series-nav-link text-left group">
                  <span className="series-nav-label flex items-center gap-1"><ChevronLeft size={14} /> Previous</span>
                  <span className="text-xs font-bold text-zinc-500 group-hover:text-emerald-400 transition-colors line-clamp-1 italic">
                    {prevData.title}
                  </span>
                </Link>
              )}
            </div>
            
            <div className="flex justify-center">
              <Link href="/series/01-hardware" className="p-4 bg-zinc-900 border border-zinc-800 rounded-full hover:border-emerald-500/50 transition-all group">
                <LayoutGrid className="w-5 h-5 text-zinc-600 group-hover:text-emerald-500" />
              </Link>
            </div>

            <div className="min-h-[60px]">
              {nextData && (
                <Link href={`/series/01-hardware/${volNum + 1}`} className="series-nav-link text-right group">
                  <span className="series-nav-label flex items-center justify-end gap-1">Next <ChevronRight size={14} /></span>
                  <span className="text-xs font-bold text-zinc-500 group-hover:text-emerald-400 transition-colors line-clamp-1 italic">
                    {nextData.title}
                  </span>
                </Link>
              )}
            </div>
          </div>
        </footer>
      </div>
    </article>
  );
}