/* eslint-disable react/no-unescaped-entities */
/**
 * =====================================================================
 * 🚀 MODERN_FULLSTACK_SERIES_VOL_4_V1.0
 * 🛡️ Maya's Strategy: Next.js 14 の最新機能を駆使した描画戦略
 * 💎 Purpose: RSC や ISR の具体的な活用例を示し、技術ブログとしての価値を確立
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
    Layers,
    Timer
} from 'lucide-react';
import { constructMetadata } from '@/shared/lib/utils/metadata';

export async function generateMetadata() {
    return constructMetadata({
        title: "Vol.4 Next.js 14 App Router 移行と ISR の威力 | BICSTATION",
        description: "サーバーサイドレンダリング (RSC) による圧倒的な FCP。365万件の個別ページを瞬時に提供する描画戦略。",
    });
}

export default function SeriesVol4() {
    return (
        <div className="min-h-screen bg-[#0a0a0c] text-slate-300 py-12 lg:py-20 px-6">
            <article className="max-w-3xl mx-auto">
                
                {/* 🔖 ナビゲーション */}
                <nav className="flex items-center justify-between text-xs font-mono text-slate-500 mb-12 border-b border-white/5 pb-4">
                    <Link href="/series/modern-fullstack-roadmap" className="hover:text-blue-400 flex items-center gap-1 transition-colors">
                        <List className="w-3 h-3" /> INDEX
                    </Link>
                    <span className="text-blue-500/50">MODERN_FULLSTACK // VOL.04</span>
                </nav>

                {/* 🚀 記事ヘッダー */}
                <header className="mb-16 border-l-4 border-blue-500 pl-6">
                    <h1 className="text-3xl md:text-5xl font-bold text-white mb-8 leading-tight">
                        Next.js 14 App Router 移行と<br />ISR の威力
                    </h1>

                    <div className="flex flex-wrap gap-6 text-xs font-mono text-slate-500">
                        <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-blue-500" /> 2026.04.16</div>
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
                        "数百万のページを、静的なファイルのような速さで。Next.js 14 の App Router は、その理想を現実にするための唯一無二の選択肢でした。"
                    </p>

                    <h2 id="rsc">1. React Server Components (RSC) の恩恵</h2>
                    <p>
                        BICSTATION では、ほぼすべてのデータ取得をサーバーサイドで完結させています。クライアントに送信される JavaScript 量を最小限に抑えることで、低速なモバイル環境でも 1秒以内にメインコンテンツが表示される圧倒的なレスポンス速度（FCP）を実現しました。
                    </p>

                    <div className="my-10 p-6 bg-blue-500/5 border border-blue-500/20 rounded-2xl flex gap-4">
                        <Layers className="text-blue-500 w-6 h-6 shrink-0" />
                        <div>
                            <h4 className="text-blue-500 font-bold m-0 uppercase text-sm">Hydration Zero Architecture</h4>
                            <p className="text-sm mt-2 mb-0">
                                クライアント側での不要なレンダリングを削ぎ落とし、サーバーから「出来上がった HTML」を流し込む。これが SEO における最強の武器となります。
                            </p>
                        </div>
                    </div>

                    <h2 id="isr">2. ISR によるデータの鮮度と速度の両立</h2>
                    <p>
                        365万件のデータを静的生成（SSG）することは不可能です。そこで Incremental Static Regeneration (ISR) を採用しました。アクセスがあった瞬間にバックグラウンドでページを生成し、キャッシュを更新する。この仕組みにより、更新頻度の高いメディアサイトとしての運用を可能にしました。
                    </p>

                    <div className="my-10 p-6 bg-white/5 border border-slate-800 rounded-2xl">
                        <div className="flex items-center gap-2 mb-4">
                            <Timer className="text-yellow-500 w-4 h-4" />
                            <span className="text-sm font-bold uppercase">Performance Metrics</span>
                        </div>
                        <ul className="text-sm space-y-2 list-none p-0">
                            <li className="flex justify-between border-b border-white/5 pb-1 text-slate-400">
                                <span>First Contentful Paint</span>
                                <span className="text-blue-400 font-mono">0.4s</span>
                            </li>
                            <li className="flex justify-between border-b border-white/5 pb-1 text-slate-400">
                                <span>Core Web Vitals (LCP)</span>
                                <span className="text-blue-400 font-mono">PASS</span>
                            </li>
                        </ul>
                    </div>

                    <h2 id="conclusion">3. 「速さ」というユーザー体験</h2>
                    <p>
                        PHP編で苦労した表示速度の向上。それを Next.js 14 という現代の「魔法」でさらに高い次元へと昇華させる。この技術のクロスオーバーこそが、BICSTATION の開発において最も刺激的な瞬間の一つでした。
                    </p>
                </div>

                {/* 🧭 フッターナビゲーション */}
                <footer className="mt-24 pt-12 border-t border-white/5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Link href="/series/modern-fullstack-roadmap/vol-3" className="group p-6 rounded-2xl border border-slate-800 hover:border-blue-500/50 transition-all text-left">
                            <span className="text-[10px] text-slate-500 font-mono block mb-2">PREVIOUS</span>
                            <div className="flex items-center gap-2">
                                <ChevronLeft className="w-5 h-5 text-slate-600 group-hover:text-blue-500 transition-all group-hover:-translate-x-1" />
                                <span className="text-white font-bold group-hover:text-blue-400 transition-colors">Vol.3 巨大DBの高速化</span>
                            </div>
                        </Link>
                        
                        <Link href="/series/modern-fullstack-roadmap/vol-5" className="group p-6 rounded-2xl border border-slate-800 bg-white/5 hover:border-blue-500/50 transition-all text-right">
                            <span className="text-[10px] text-blue-500 font-mono block mb-2">NEXT</span>
                            <div className="flex items-center justify-between">
                                <span className="text-white font-bold group-hover:text-blue-400 transition-colors">Vol.5 Docker による環境構築</span>
                                <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-blue-500 transition-all group-hover:translate-x-1" />
                            </div>
                        </Link>
                    </div>
                </footer>
            </article>
        </div>
    );
}