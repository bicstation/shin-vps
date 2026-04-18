/* eslint-disable @next/next/no-img-element */
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, LayoutGrid, ShoppingCart, Terminal } from 'lucide-react';

// ✅ 共通データのインポート
import { BTO_SERIES_CONFIG } from '../../data';

/**
 * アフィリエイト表示用データ変換
 */
async function getAffiliateDisplayData(frontMatter: any) {
  if (!frontMatter.amazonAsin && !frontMatter.rakutenId && !frontMatter.directUrl) return null;
  return {
    amazonUrl: frontMatter.amazonAsin ? `https://www.amazon.co.jp/dp/${frontMatter.amazonAsin}?tag=YOUR_TAG` : null,
    rakutenUrl: frontMatter.rakutenId ? `https://hb.afl.rakuten.co.jp/hgc/g00...` : null,
    directUrl: frontMatter.directUrl || null,
    label: frontMatter.affiliateLabel || "詳細をチェックする"
  };
}

export default async function BtoMastersArticlePage({ 
  params 
}: { 
  params: Promise<{ vol: string }> 
}) {
  const { vol } = await params;
  const volNum = parseInt(vol, 10);
  
  // 1. シリーズ設定とフェーズ判定
  const config = BTO_SERIES_CONFIG.gaming;
  const phaseInfo = config.phases.find(p => volNum >= p.volRange[0] && volNum <= p.volRange[1]);
  if (!phaseInfo) return notFound();

  // 2. 物理パスの解決
  const contentDir = path.join(process.cwd(), 'app', 'series', '10-bto-masters', 'gaming');
  const filePath = path.join(contentDir, `vol${volNum}.md`);

  let markdownContent = "";
  let frontMatter: any = {};
  let exists = false;

  if (fs.existsSync(filePath)) {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const { content, data } = matter(fileContent);
    markdownContent = content;
    frontMatter = data;
    exists = true;
  }

  // 3. 物理ファイル欠落時のデバッグ画面
  if (!exists) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black px-6">
        <div className="max-w-md w-full text-center space-y-8 p-12 border border-blue-900/20 rounded-[2rem] bg-zinc-900/30 backdrop-blur-xl">
          <Terminal className="w-16 h-16 text-blue-500/80 mx-auto animate-pulse" />
          <div className="space-y-4">
            <h1 className="text-sm font-mono text-blue-500 tracking-[0.4em] uppercase opacity-70">Analysis_In_Progress</h1>
            <h2 className="text-2xl font-black text-white leading-tight">Vol.{volNum} : {phaseInfo.label}</h2>
            <p className="text-zinc-500 font-mono text-[10px] leading-relaxed">
              Mayaが論理演算を継続中です。ファイルが見つかりません:<br />
              <code className="text-[9px] text-blue-400/70 block mt-2 break-all bg-black/50 p-2 rounded">{filePath}</code>
            </p>
          </div>
          <Link href="/series/10-bto-masters" className="inline-flex items-center gap-2 text-[10px] font-mono text-zinc-400 hover:text-blue-400 transition-all uppercase tracking-widest border border-zinc-700 px-6 py-3 rounded-full">
            <ChevronLeft size={14} /> Back_to_Nexus
          </Link>
        </div>
      </div>
    );
  }

  const affiliateData = await getAffiliateDisplayData(frontMatter);
  const eyeCatchPhase = Math.ceil(volNum / 10);

  return (
    <div className="bg-black min-h-screen text-zinc-300 font-sans selection:bg-blue-500/30">
      
      {/* 🧭 右側フローティング目次（ロードマップ） */}
      {/* custom-scrollbar の代わりに Tailwind の標準クラスを使用 */}
      <aside className="hidden xl:block w-72 fixed right-8 top-32 max-h-[70vh] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-zinc-800 hover:scrollbar-thumb-blue-600">
        <div className="sticky top-0 bg-black pb-4 z-10">
          <h3 className="text-[10px] font-mono text-blue-500 tracking-[0.3em] uppercase border-b border-blue-900/30 pb-2 flex items-center gap-2">
            <Terminal size={12} /> Operation_Roadmap
          </h3>
        </div>
        <div className="space-y-8 mt-4">
          {config.phases.map((phase, i) => (
            <div key={i} className={volNum >= phase.volRange[0] && volNum <= phase.volRange[1] ? "opacity-100" : "opacity-40"}>
              <h4 className="text-[9px] text-zinc-500 mb-3 font-bold tracking-widest uppercase italic border-l border-zinc-800 pl-2">
                Phase_{i + 1}: {phase.label.split('（')[0]}
              </h4>
              <ul className="space-y-1.5 ml-1">
                {Array.from({ length: 10 }, (_, j) => {
                  const v = (i * 10) + j + 1;
                  const isActive = v === volNum;
                  return (
                    <li key={v}>
                      <Link 
                        href={`/series/10-bto-masters/gaming/${v}`}
                        className={`block pl-4 py-1 text-[10px] transition-all hover:text-blue-400 ${
                          isActive ? "text-blue-500 font-bold border-l-2 border-blue-500 -ml-[1px]" : "text-zinc-600"
                        }`}
                      >
                        Vol.{v} <span className="text-[8px] opacity-40 ml-1">Analysis...</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </aside>

      {/* 🌌 メインコンテンツ */}
      <article className="max-w-4xl mx-auto px-6 lg:px-0 lg:ml-32 xl:ml-auto xl:mr-[400px]">
        
        {/* ヒーローセクション */}
        <header className="pt-20 pb-16 border-b border-zinc-900 mb-16">
          <div className="flex items-center gap-4 mb-8">
            <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[10px] font-black uppercase tracking-[0.3em] rounded-sm">
              {phaseInfo.label}
            </span>
            <span className="text-zinc-600 font-mono text-[10px] tracking-[0.3em] uppercase">
              System_Build / Vol_{String(volNum).padStart(2, '0')}
            </span>
          </div>
          
          <h1 className="text-4xl md:text-7xl font-black text-white mb-10 tracking-tighter leading-[0.95]">
            {frontMatter.title}
          </h1>
          
          <p className="text-xl md:text-2xl text-zinc-400 leading-relaxed font-light italic border-l-4 border-blue-600 pl-8 py-2">
            {frontMatter.description}
          </p>

          <div className="mt-12 relative aspect-video overflow-hidden rounded-sm border border-zinc-800 grayscale hover:grayscale-0 transition-all duration-1000 shadow-2xl">
            <img 
              src={`/images/series/bto/gaming-phase-${eyeCatchPhase}.jpg`} 
              alt="Hardware Architecture" 
              className="object-cover w-full h-full opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
          </div>
        </header>

        {/* 🖋️ Markdownコンテンツ */}
        <section className={`prose prose-invert prose-blue max-w-none 
          prose-headings:text-white prose-headings:font-bold prose-headings:tracking-tighter
          prose-p:text-zinc-300 prose-p:leading-8 prose-p:mb-8
          prose-code:text-blue-400 prose-code:bg-blue-950/30 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none
          prose-strong:text-blue-500 prose-strong:font-bold
          prose-blockquote:border-l-blue-600 prose-blockquote:bg-zinc-950/50 prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:rounded-r-xl
          prose-hr:border-zinc-800`}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {markdownContent}
          </ReactMarkdown>
        </section>

        {/* 🛒 アフィリエイト（Maya's Selection） */}
        {affiliateData && (
          <section className="mt-32 p-10 border border-zinc-800 rounded-[2.5rem] bg-zinc-900/20 backdrop-blur-md">
            <div className="flex items-center gap-3 mb-2">
              <ShoppingCart className="text-blue-500 w-5 h-5" />
              <h3 className="text-2xl font-black text-white tracking-tight">Maya's Logical Selection</h3>
            </div>
            <p className="text-zinc-600 text-[10px] mb-10 font-mono uppercase tracking-[0.4em] italic">Procurement_Analysis_Verified</p>
            
            <div className="grid gap-4 sm:grid-cols-2">
              {affiliateData.amazonUrl && (
                <a href={affiliateData.amazonUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-6 bg-black border border-zinc-800 hover:border-blue-500/40 rounded-2xl transition-all group/link">
                  <span className="font-bold text-zinc-400 group-hover/link:text-blue-400 transition-colors">Amazon</span>
                  <span className="text-[9px] font-mono text-zinc-600 border border-zinc-800 px-2 py-1 rounded">CHECK_DEAL</span>
                </a>
              )}
              {affiliateData.directUrl && (
                <a href={affiliateData.directUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-6 bg-black border border-zinc-800 hover:border-blue-500/40 rounded-2xl transition-all group/link">
                  <span className="font-bold text-zinc-400 group-hover/link:text-blue-400 transition-colors">Official Store</span>
                  <span className="text-[9px] font-mono text-zinc-600 border border-zinc-800 px-2 py-1 rounded">CHECK_DEAL</span>
                </a>
              )}
            </div>
          </section>
        )}

        {/* 🧭 フッターナビゲーション */}
        <footer className="mt-40 pb-20 pt-16 border-t border-zinc-900">
          <div className="grid grid-cols-2 gap-8">
            <div className="min-h-[60px]">
              {volNum > 1 && (
                <Link href={`/series/10-bto-masters/gaming/${volNum - 1}`} className="group block">
                  <span className="text-[10px] font-mono text-zinc-600 flex items-center gap-1 group-hover:text-blue-500 transition-colors uppercase"><ChevronLeft size={12} /> Previous_Node</span>
                  <span className="text-sm font-bold text-zinc-400 group-hover:text-white transition-colors block mt-2 italic">Vol.{volNum - 1}へ</span>
                </Link>
              )}
            </div>
            <div className="min-h-[60px] text-right">
              {volNum < 40 && (
                <Link href={`/series/10-bto-masters/gaming/${volNum + 1}`} className="group block">
                  <span className="text-[10px] font-mono text-zinc-600 flex items-center justify-end gap-1 group-hover:text-blue-500 transition-colors uppercase">Next_Node <ChevronRight size={12} /></span>
                  <span className="text-sm font-bold text-zinc-400 group-hover:text-white transition-colors block mt-2 italic">Vol.{volNum + 1}へ</span>
                </Link>
              )}
            </div>
          </div>
          <div className="flex justify-center mt-12">
            <Link href="/series/10-bto-masters" className="p-4 bg-zinc-900 border border-zinc-800 rounded-full hover:border-blue-500/50 transition-all group">
              <LayoutGrid className="w-5 h-5 text-zinc-600 group-hover:text-blue-500" />
            </Link>
          </div>
        </footer>
      </article>
    </div>
  );
}