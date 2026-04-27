/* eslint-disable react/no-unescaped-entities */
/**
 * =====================================================================
 * 🚀 MODERN_FULLSTACK_SERIES_VOL_8_V1.0
 * 🛡️ Maya's Strategy: 数百万ページ規模の SEO を制御する技術力を提示
 * 💎 Purpose: Next.js の Metadata API 活用例を示し、ビジネス的成果を強調
 * =====================================================================
 */

import React from 'react';
import Link from 'next/link';
import { 
    ChevronLeft, 
    ChevronRight, 
    List, 
    Calendar, 
    Clock, 
    User, 
    Search,
    Globe2
} from 'lucide-react';
import { constructMetadata } from '@/shared/lib/utils/metadata';

export async function generateMetadata() {
    return constructMetadata({
        title: "Vol.8 動的メタデータと数百万ページ規模の SEO 戦略 | BICSTATION",
        description: "Next.js 14 の Metadata API を駆使し、365万件のページすべてに最適な SEO 設定を自動適用する。",
    });
}

export default function SeriesVol8() {
    return (
        <div className="min-h-screen bg-[#0a0a0c] text-slate-300 py-12 lg:py-20 px-6">
            <article className="max-w-3xl mx-auto">
                
                {/* 🔖 ナビゲーション */}
                <nav className="flex items-center justify-between text-xs font-mono text-slate-500 mb-12 border-b border-white/5 pb-4">
                    <Link href="/series/99-archive/modern-fullstack-roadmap" className="hover:text-blue-400 flex items-center gap-1 transition-colors">
                        <List className="w-3 h-3" /> INDEX
                    </Link>
                    <span className="text-blue-500/50">MODERN_FULLSTACK // VOL.08</span>
                </nav>

                {/* 🚀 記事ヘッダー */}
                <header className="mb-16 border-l-4 border-blue-500 pl-6">
                    <h1 className="text-3xl md:text-5xl font-bold text-white mb-8 leading-tight">
                        動的メタデータと<br />数百万ページ規模の SEO 戦略
                    </h1>

                    <div className="flex flex-wrap gap-6 text-xs font-mono text-slate-500">
                        <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-blue-500" /> 2026.04.20</div>
                        <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-blue-500" /> 9 MIN READ</div>
                        <div className="flex items-center gap-2"><User className="w-4 h-4 text-blue-500" /> AUTHOR: MAYA</div>
                    </div>
                </header>

                {/* 📝 本文 */}
                <div className="prose prose-invert prose-blue max-w-none 
                    prose-headings:text-white prose-headings:font-bold
                    prose-p:leading-relaxed prose-p:text-slate-300
                    prose-strong:text-blue-400 prose-code:text-blue-300">
                    
                    <p className="text-xl leading-relaxed text-slate-400 italic mb-12 border-l-2 border-blue-500 pl-6">
                        "どれほど優れた技術も、見つけてもらえなければ存在しないのと同じです。SEO はエンジニアリングによる『最高の招待状』です。"
                    </p>

                    <h2 id="metadata-api">1. Metadata API による自動最適化</h2>
                    <p>
                        Next.js 14 の `generateMetadata` 関数を使い、各ページのタイトル、ディスクリプション、OGP 画像を API から取得したデータに基づいて動的に生成。365万件すべてのページにおいて、シェアされた際の見栄えをシステム的に保証しています。
                    </p>

                    <div className="my-10 p-6 bg-blue-500/5 border border-blue-500/20 rounded-2xl flex gap-4">
                        <Search className="text-blue-500 w-6 h-6 shrink-0" />
                        <div>
                            <h4 className="text-blue-500 font-bold m-0 uppercase text-sm">Semantic Optimization</h4>
                            <p className="text-sm mt-2 mb-0">
                                構造化データ（JSON-LD）も自動挿入。検索エンジンに対し、記事、価格、パンくずリストなどの意味を正確に伝え、リッチスニペットの表示を最大化させました。
                            </p>
                        </div>
                    </div>

                    <h2 id="sitemap-strategy">2. インデックス速度の極致</h2>
                    <p>
                        巨大なサイトにおいて最大の課題は、新しいページが Google に見つけられるまでの時間です。動的な `sitemap.xml` の生成に加え、更新があった瞬間にインデックスを促す Ping 送信ロジックを実装。技術的なアプローチで情報の鮮度を保っています。
                    </p>

                    <div className="my-10 p-6 bg-white/5 border border-slate-800 rounded-2xl">
                        <div className="flex items-center gap-2 mb-4">
                            <Globe2 className="text-blue-400 w-4 h-4" />
                            <span className="text-sm font-bold uppercase">SEO Performance Metrics</span>
                        </div>
                        <ul className="text-sm space-y-2 list-none p-0">
                            <li className="flex justify-between border-b border-white/5 pb-1 text-slate-400">
                                <span>Indexed Pages</span>
                                <span className="text-blue-400 font-mono">3,650,000+</span>
                            </li>
                            <li className="flex justify-between border-b border-white/5 pb-1 text-slate-400">
                                <span>Search Visibility</span>
                                <span className="text-blue-400 font-mono">TOP 0.1%</span>
                            </li>
                        </ul>
                    </div>

                    <h2 id="conclusion">3. 「集客」を加速させるコード</h2>
                    <p>
                        SEO はマーケティングの領域と思われがちですが、その基盤は 100% 技術です。正しい HTML 構造、高速な応答、的確なメタデータ。次は、この膨大な流入を「信頼」に変えるための、セキュアな認証システムへと進みます。
                    </p>
                </div>

                {/* 🧭 フッターナビゲーション */}
                <footer className="mt-24 pt-12 border-t border-white/5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Link href="/series/99-archive/modern-fullstack-roadmap/vol-7" className="group p-6 rounded-2xl border border-slate-800 hover:border-blue-500/50 transition-all text-left">
                            <span className="text-[10px] text-slate-500 font-mono block mb-2">PREVIOUS</span>
                            <div className="flex items-center gap-2">
                                <ChevronLeft className="w-5 h-5 text-slate-600 group-hover:text-blue-500 transition-all group-hover:-translate-x-1" />
                                <span className="text-white font-bold group-hover:text-blue-400 transition-colors">Vol.7 Tailwind CSS の UI 開発</span>
                            </div>
                        </Link>
                        
                        <Link href="/series/99-archive/modern-fullstack-roadmap/vol-9" className="group p-6 rounded-2xl border border-slate-800 bg-white/5 hover:border-blue-500/50 transition-all text-right">
                            <span className="text-[10px] text-blue-500 font-mono block mb-2">NEXT</span>
                            <div className="flex items-center justify-between">
                                <span className="text-white font-bold group-hover:text-blue-400 transition-colors">Vol.9 Django 認証と JWT セキュリティ</span>
                                <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-blue-500 transition-all group-hover:translate-x-1" />
                            </div>
                        </Link>
                    </div>
                </footer>
            </article>
        </div>
    );
}