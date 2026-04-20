// /home/maya/shin-vps/next-bicstation/app/series/bto-guide/[vol]/page.tsx
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { notFound } from 'next/navigation';
import { BTO_GUIDE_DATA } from '../data';
import Link from 'next/link';

// API経由でデータを取得する想定のプレースホルダー（将来的にDjangoや外部APIへ接続）
async function getAffiliateDisplayData(affiliate: any) {
  if (!affiliate) return null;
  // ここでAPIを叩いて、最新価格や画像URLを取得するロジックを将来的に実装
  return {
    amazonUrl: affiliate.amazonAsin ? `https://www.amazon.co.jp/dp/${affiliate.amazonAsin}?tag=YOUR_TAG` : null,
    rakutenUrl: affiliate.rakutenId ? `https://hb.afl.rakuten.co.jp/hgc/g00...` : null,
    directUrl: affiliate.directUrl || null,
    label: affiliate.label || "詳細をチェックする"
  };
}

export default async function SeriesVolumePage({ params }: { params: { vol: string } }) {
  const volNum = parseInt(params.vol);
  const seriesInfo = BTO_GUIDE_DATA.find(d => d.vol === volNum);

  if (!seriesInfo) notFound();

  // 10回ごとにアイキャッチ画像を切り替えるロジック
  // images/series/bto-guide/eye-catch-1.jpg (1-10), -2.jpg (11-20), -3.jpg (21-30)
  const eyeCatchPhase = Math.ceil(volNum / 10);
  const eyeCatchUrl = `/images/series/bto-guide/eye-catch-${eyeCatchPhase}.jpg`;

  const contentDir = path.join(process.cwd(), 'content/series/bto-guide');
  const filePath = path.join(contentDir, `vol${volNum}.md`);

  // Markdownが存在しない場合の処理
  if (!fs.existsSync(filePath)) {
    return (
      <div className="max-w-3xl mx-auto py-20 text-center px-4">
        <div className="mb-6 inline-block p-3 bg-blue-500/10 rounded-full text-blue-400">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
        </div>
        <h1 className="text-2xl font-bold text-white">Vol.{volNum} : {seriesInfo.title}</h1>
        <p className="mt-4 text-gray-400">現在、Mayaが論理的な解析と推敲を重ねています。<br />公開まで今しばらくお待ちください。</p>
        <Link href="/series/bto-guide" className="mt-8 inline-block text-blue-400 hover:underline">← 目次に戻る</Link>
      </div>
    );
  }

  const fileContent = fs.readFileSync(filePath, 'utf8');
  const { content, data: frontMatter } = matter(fileContent);
  const affiliateData = await getAffiliateDisplayData(seriesInfo.affiliate);

  return (
    <article className="max-w-4xl mx-auto py-12 px-4 md:px-8 bg-gray-900 text-gray-100">
      {/* 動的アイキャッチ */}
      <div className="relative w-full h-64 md:h-96 mb-10 overflow-hidden rounded-2xl shadow-2xl border border-gray-800">
        <img src={eyeCatchUrl} alt={`Phase ${eyeCatchPhase}`} className="object-cover w-full h-full opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />
        <div className="absolute bottom-6 left-6">
          <span className="px-3 py-1 bg-blue-600 text-xs font-bold rounded-full uppercase tracking-widest text-white shadow-lg">
            {seriesInfo.category}
          </span>
          <h2 className="text-sm font-mono text-blue-400 mt-2">VOLUME_{String(volNum).padStart(2, '0')}</h2>
        </div>
      </div>

      <header className="mb-12 border-b border-gray-800 pb-10">
        <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-6 tracking-tight leading-tight">
          {frontMatter.title || seriesInfo.title}
        </h1>
        <p className="text-lg md:text-xl text-gray-400 leading-relaxed font-light italic">
          "{frontMatter.description || seriesInfo.description}"
        </p>
        <div className="flex flex-wrap gap-2 mt-6">
          {seriesInfo.tags.map(tag => (
            <span key={tag} className="text-xs px-2 py-1 bg-gray-800 text-gray-400 rounded border border-gray-700">#{tag}</span>
          ))}
        </div>
      </header>

      {/* Markdown 本文 */}
      <div className="prose prose-invert prose-blue max-w-none 
        prose-headings:font-bold prose-a:text-blue-400 prose-img:rounded-xl prose-code:text-blue-300">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {content}
        </ReactMarkdown>
      </div>

      {/* 動的アフィリエイトセクション (API連携想定) */}
      {affiliateData && (
        <section className="mt-16 p-8 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-blue-500/20 shadow-xl">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center">
            <svg className="w-6 h-6 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
            Maya's Logical Selection
          </h3>
          <p className="text-gray-400 text-sm mb-6">この記事の論理構成に基づき、最適なデバイスをピックアップしました。</p>
          <div className="grid gap-4 sm:grid-cols-2">
            {affiliateData.amazonUrl && (
              <a href={affiliateData.amazonUrl} target="_blank" className="flex items-center justify-between p-4 bg-gray-800 hover:bg-orange-500/10 rounded-lg border border-gray-700 hover:border-orange-500/50 transition-all group">
                <span className="font-bold text-gray-200 group-hover:text-orange-400">Amazonで確認</span>
                <span className="text-[10px] bg-orange-600 px-2 py-0.5 rounded text-white font-bold">AMAZON</span>
              </a>
            )}
            {affiliateData.rakutenUrl && (
              <a href={affiliateData.rakutenUrl} target="_blank" className="flex items-center justify-between p-4 bg-gray-800 hover:bg-red-500/10 rounded-lg border border-gray-700 hover:border-red-500/50 transition-all group">
                <span className="font-bold text-gray-200 group-hover:text-red-400">楽天で探す</span>
                <span className="text-[10px] bg-red-600 px-2 py-0.5 rounded text-white font-bold">RAKUTEN</span>
              </a>
            )}
            {affiliateData.directUrl && (
              <a href={affiliateData.directUrl} target="_blank" className="flex items-center justify-between p-4 bg-gray-800 hover:bg-blue-500/10 rounded-lg border border-gray-700 hover:border-blue-500/50 transition-all group sm:col-span-2">
                <span className="font-bold text-gray-200 group-hover:text-blue-400">{affiliateData.label}</span>
                <span className="text-[10px] bg-blue-600 px-2 py-0.5 rounded text-white font-bold">OFFICIAL</span>
              </a>
            )}
          </div>
        </section>
      )}

      {/* ナビゲーション */}
      <footer className="mt-20 pt-10 border-t border-gray-800">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
          {volNum > 1 ? (
            <Link href={`/series/bto-guide/${volNum - 1}`} className="flex flex-col items-start group">
              <span className="text-xs text-gray-500 mb-1 group-hover:text-blue-400 transition-colors">← PREVIOUS</span>
              <span className="text-sm font-bold text-gray-300 group-hover:text-white transition-colors">{BTO_GUIDE_DATA.find(d => d.vol === volNum - 1)?.title}</span>
            </Link>
          ) : <div />}
          
          <Link href="/series/bto-guide" className="p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors shadow-inner">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
          </Link>

          {volNum < 30 ? (
            <Link href={`/series/bto-guide/${volNum + 1}`} className="flex flex-col items-end group text-right">
              <span className="text-xs text-gray-500 mb-1 group-hover:text-blue-400 transition-colors">NEXT →</span>
              <span className="text-sm font-bold text-gray-300 group-hover:text-white transition-colors">{BTO_GUIDE_DATA.find(d => d.vol === volNum + 1)?.title}</span>
            </Link>
          ) : <div />}
        </div>
      </footer>
    </article>
  );
}