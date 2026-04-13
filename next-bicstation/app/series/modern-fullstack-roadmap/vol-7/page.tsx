/* eslint-disable react/no-unescaped-entities */
/**
 * =====================================================================
 * 🚀 MODERN_FULLSTACK_SERIES_VOL_7_V1.0
 * 🛡️ Maya's Strategy: Tailwind CSS を用いた「Atomic Design」の合理化
 * 💎 Purpose: デザインシステムの構築能力と UI 開発のスピード感をアピール
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
    Palette,
    Zap
} from 'lucide-react';
import { constructMetadata } from '@/shared/lib/utils/metadata';

export async function generateMetadata() {
    return constructMetadata({
        title: "Vol.7 Tailwind CSS による高速UI開発とデザインの一貫性 | BICSTATION",
        description: "CSSファイルとの決別。Utility-First がもたらす、開発効率の向上とファイルサイズの軽量化。",
    });
}

export default function SeriesVol7() {
    return (
        <div className="min-h-screen bg-[#0a0a0c] text-slate-300 py-12 lg:py-20 px-6">
            <article className="max-w-3xl mx-auto">
                
                {/* 🔖 ナビゲーション */}
                <nav className="flex items-center justify-between text-xs font-mono text-slate-500 mb-12 border-b border-white/5 pb-4">
                    <Link href="/series/modern-fullstack-roadmap" className="hover:text-blue-400 flex items-center gap-1 transition-colors">
                        <List className="w-3 h-3" /> INDEX
                    </Link>
                    <span className="text-blue-500/50">MODERN_FULLSTACK // VOL.07</span>
                </nav>

                {/* 🚀 記事ヘッダー */}
                <header className="mb-16 border-l-4 border-blue-500 pl-6">
                    <h1 className="text-3xl md:text-5xl font-bold text-white mb-8 leading-tight">
                        Tailwind CSS による高速UI開発と<br />デザインの一貫性
                    </h1>

                    <div className="flex flex-wrap gap-6 text-xs font-mono text-slate-500">
                        <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-blue-500" /> 2026.04.19</div>
                        <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-blue-500" /> 8 MIN READ</div>
                        <div className="flex items-center gap-2"><User className="w-4 h-4 text-blue-500" /> AUTHOR: MAYA</div>
                    </div>
                </header>

                {/* 📝 本文 */}
                <div className="prose prose-invert prose-blue max-w-none 
                    prose-headings:text-white prose-headings:font-bold
                    prose-p:leading-relaxed prose-p:text-slate-300
                    prose-strong:text-blue-400 prose-code:text-blue-300">
                    
                    <p className="text-xl leading-relaxed text-slate-400 italic mb-12 border-l-2 border-blue-500 pl-6">
                        "CSS を『書く』のではなく、クラスを『選ぶ』。このパラダイムシフトが、デザインの揺らぎを消し去ります。"
                    </p>

                    <h2 id="utility-first">1. Utility-First がもたらす秩序</h2>
                    <p>
                        PHP MVC 時代、私は大量の CSS クラス名の命名に頭を悩ませていました。Tailwind CSS を採用したことで、クラス名に悩む時間はゼロになり、コンポーネントの構築に100%集中できるようになりました。また、ビルド時に未使用の CSS を自動削除するため、数百万ページを抱えるサイトでもスタイルシートは驚くほど軽量です。
                    </p>

                    <div className="my-10 p-6 bg-blue-500/5 border border-blue-500/20 rounded-2xl flex gap-4">
                        <Palette className="text-blue-500 w-6 h-6 shrink-0" />
                        <div>
                            <h4 className="text-blue-500 font-bold m-0 uppercase text-sm">Design Token Integration</h4>
                            <p className="text-sm mt-2 mb-0">
                                `tailwind.config.ts` で定義したブランドカラーやフォントサイズ。これが唯一の「真実のソース」となり、サイト全体のトーン＆マナーを完璧に統制します。
                            </p>
                        </div>
                    </div>

                    <h2 id="componentization">2. React との相乗効果</h2>
                    <p>
                        Tailwind CSS の真価は React と組み合わせた時に発揮されます。共通パーツを React コンポーネントとして切り出し、プロパティによって動的にクラスを切り替える。この「コンポーネント駆動開発」が、BICSTATION の複雑な UI を破綻なく支えています。
                    </p>

                    <div className="my-10 p-6 bg-white/5 border border-slate-800 rounded-2xl">
                        <div className="flex items-center gap-2 mb-4">
                            <Zap className="text-yellow-500 w-4 h-4" />
                            <span className="text-sm font-bold uppercase">Modern UI Benefits</span>
                        </div>
                        <ul className="text-sm space-y-2 list-none p-0">
                            <li className="flex gap-2 text-slate-400 border-b border-white/5 pb-2">
                                <span className="text-blue-400">●</span> CSS ファイル間の競合（詳細度問題）の完全な解消
                            </li>
                            <li className="flex gap-2 text-slate-400 border-b border-white/5 pb-2">
                                <span className="text-blue-400">●</span> モバイルファーストなレスポンシブ開発の簡略化
                            </li>
                            <li className="flex gap-2 text-slate-400">
                                <span className="text-blue-400">●</span> ダークモード対応のネイティブサポート
                            </li>
                        </ul>
                    </div>

                    <h2 id="conclusion">3. 感性に訴えかける UI</h2>
                    <p>
                        「速くて安全」なバックエンドの上に、「美しくて使いやすい」フロントエンドを乗せる。この完結したサイクルこそが、エンジニアリングの醍醐味です。次は、サイトの情報を整理し、ユーザーを迷わせないための「メタデータと検索の最適化」へと進みます。
                    </p>
                </div>

                {/* 🧭 フッターナビゲーション */}
                <footer className="mt-24 pt-12 border-t border-white/5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Link href="/series/modern-fullstack-roadmap/vol-6" className="group p-6 rounded-2xl border border-slate-800 hover:border-blue-500/50 transition-all text-left">
                            <span className="text-[10px] text-slate-500 font-mono block mb-2">PREVIOUS</span>
                            <div className="flex items-center gap-2">
                                <ChevronLeft className="w-5 h-5 text-slate-600 group-hover:text-blue-500 transition-all group-hover:-translate-x-1" />
                                <span className="text-white font-bold group-hover:text-blue-400 transition-colors">Vol.6 WordPress サテライト化</span>
                            </div>
                        </Link>
                        
                        <Link href="/series/modern-fullstack-roadmap/vol-8" className="group p-6 rounded-2xl border border-slate-800 bg-white/5 hover:border-blue-500/50 transition-all text-right">
                            <span className="text-[10px] text-blue-500 font-mono block mb-2">NEXT</span>
                            <div className="flex items-center justify-between">
                                <span className="text-white font-bold group-hover:text-blue-400 transition-colors">Vol.8 動的メタデータと SEO 戦略</span>
                                <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-blue-500 transition-all group-hover:translate-x-1" />
                            </div>
                        </Link>
                    </div>
                </footer>
            </article>
        </div>
    );
}