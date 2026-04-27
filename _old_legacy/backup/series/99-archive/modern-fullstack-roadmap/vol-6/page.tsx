/* eslint-disable react/no-unescaped-entities */
/**
 * =====================================================================
 * 🚀 MODERN_FULLSTACK_SERIES_VOL_6_V1.0
 * 🛡️ Maya's Strategy: WordPress を「サテライト」化し、配信を Next.js へ集約
 * 💎 Purpose: 既存資産の有効活用とヘッドレスアーキテクチャのメリットを訴求
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
    Globe,
    Zap
} from 'lucide-react';
import { constructMetadata } from '@/shared/lib/utils/metadata';

export async function generateMetadata() {
    return constructMetadata({
        title: "Vol.6 WordPress ヘッドレス化とサテライト戦略 | BICSTATION",
        description: "慣れ親しんだ管理画面はそのままに。Next.js から WP-API を叩き、高速な静的配信を実現する。",
    });
}

export default function SeriesVol6() {
    return (
        <div className="min-h-screen bg-[#0a0a0c] text-slate-300 py-12 lg:py-20 px-6">
            <article className="max-w-3xl mx-auto">
                
                {/* 🔖 ナビゲーション */}
                <nav className="flex items-center justify-between text-xs font-mono text-slate-500 mb-12 border-b border-white/5 pb-4">
                    <Link href="/series/99-archive/modern-fullstack-roadmap" className="hover:text-blue-400 flex items-center gap-1 transition-colors">
                        <List className="w-3 h-3" /> INDEX
                    </Link>
                    <span className="text-blue-500/50">MODERN_FULLSTACK // VOL.06</span>
                </nav>

                {/* 🚀 記事ヘッダー */}
                <header className="mb-16 border-l-4 border-blue-500 pl-6">
                    <h1 className="text-3xl md:text-5xl font-bold text-white mb-8 leading-tight">
                        WordPress ヘッドレス化と<br />サテライト戦略
                    </h1>

                    <div className="flex flex-wrap gap-6 text-xs font-mono text-slate-500">
                        <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-blue-500" /> 2026.04.18</div>
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
                        "WordPress を捨てる必要はありません。ただ、その役割を『管理』に限定し、配信の主役を Next.js に譲るだけです。"
                    </p>

                    <h2 id="satellite">1. 管理は WP、配信は Next.js</h2>
                    <p>
                        長年培った WordPress の入力体験は、他の CMS では代替しづらいものです。BICSTATION では、WordPress を「記事入力専用のサテライト」として残し、Next.js が WP-JSON エンドポイントからデータを吸い上げて、モダンな UI で再構成するアーキテクチャを採用しました。
                    </p>

                    <div className="my-10 p-6 bg-blue-500/5 border border-blue-500/20 rounded-2xl flex gap-4">
                        <Globe className="text-blue-500 w-6 h-6 shrink-0" />
                        <div>
                            <h4 className="text-blue-500 font-bold m-0 uppercase text-sm">Headless Benefits</h4>
                            <p className="text-sm mt-2 mb-0">
                                フロントエンドの脆弱性から WordPress 本体を隔離しつつ、Next.js の高速な表示能力を享受できる。まさに「いいとこ取り」の戦略です。
                            </p>
                        </div>
                    </div>

                    <h2 id="migration">2. 既存テーマからの脱却</h2>
                    <p>
                        重厚な WordPress テーマを読み込む必要がなくなり、Lighthouse のスコアは劇的に向上しました。PHP テンプレートで苦労していた「コンポーネントの共通化」も、React (Next.js) の恩恵で、より直感的かつ高機能な実装へと進化しました。
                    </p>

                    <div className="my-10 p-6 bg-white/5 border border-slate-800 rounded-2xl">
                        <div className="flex items-center gap-2 mb-4">
                            <Zap className="text-yellow-500 w-4 h-4" />
                            <span className="text-sm font-bold uppercase">Hybrid Architecture</span>
                        </div>
                        <ul className="text-sm space-y-2 list-none p-0">
                            <li className="flex gap-2 text-slate-400 border-b border-white/5 pb-2">
                                <span className="text-blue-400">●</span> 記事・メディア管理：WordPress (サテライト)
                            </li>
                            <li className="flex gap-2 text-slate-400 border-b border-white/5 pb-2">
                                <span className="text-blue-400">●</span> ユーザー認証・検索・巨大DB：Django (API)
                            </li>
                            <li className="flex gap-2 text-slate-400">
                                <span className="text-blue-400">●</span> 統合フロントエンド：Next.js (App Router)
                            </li>
                        </ul>
                    </div>

                    <h2 id="conclusion">3. 統合されたエコシステム</h2>
                    <p>
                        異なる出自のシステムが API で繋がり、一つの体験を作る。この「マイクロサービス」的なアプローチが、BICSTATION を唯一無二のプラットフォームにしています。次は、フロントエンドの表現力を支える Tailwind CSS の世界へ。
                    </p>
                </div>

                {/* 🧭 フッターナビゲーション */}
                <footer className="mt-24 pt-12 border-t border-white/5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Link href="/series/99-archive/modern-fullstack-roadmap/vol-5" className="group p-6 rounded-2xl border border-slate-800 hover:border-blue-500/50 transition-all text-left">
                            <span className="text-[10px] text-slate-500 font-mono block mb-2">PREVIOUS</span>
                            <div className="flex items-center gap-2">
                                <ChevronLeft className="w-5 h-5 text-slate-600 group-hover:text-blue-500 transition-all group-hover:-translate-x-1" />
                                <span className="text-white font-bold group-hover:text-blue-400 transition-colors">Vol.5 Docker による環境構築</span>
                            </div>
                        </Link>
                        
                        <Link href="/series/99-archive/modern-fullstack-roadmap/vol-7" className="group p-6 rounded-2xl border border-slate-800 bg-white/5 hover:border-blue-500/50 transition-all text-right">
                            <span className="text-[10px] text-blue-500 font-mono block mb-2">NEXT</span>
                            <div className="flex items-center justify-between">
                                <span className="text-white font-bold group-hover:text-blue-400 transition-colors">Vol.7 Tailwind CSS による高速UI開発</span>
                                <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-blue-500 transition-all group-hover:translate-x-1" />
                            </div>
                        </Link>
                    </div>
                </footer>
            </article>
        </div>
    );
}