/* eslint-disable react/no-unescaped-entities */
/**
 * =====================================================================
 * 🚀 MODERN_FULLSTACK_SERIES_VOL_1_V1.0
 * 🛡️ Maya's Strategy: インフラの「重み」を視覚化し、専門性を提示
 * 💎 Purpose: BICSTATIONの技術的根拠を示し、AdSenseの信頼性を担保する
 * =====================================================================
 */

import React from 'react';
import Link from 'next/link';
import { 
    ChevronRight, 
    List, 
    Calendar, 
    Clock, 
    User, 
    Server,
    Zap
} from 'lucide-react';
import { constructMetadata } from '@/shared/lib/utils/metadata';

export async function generateMetadata() {
    return constructMetadata({
        title: "Vol.1 インフラ選定：なぜ VPS と 8GB メモリが必要だったのか | BICSTATION",
        description: "365万件のデータを高速に捌くための物理的制約。レンタルサーバーを卒業し、自由を手に入れた日の記録。",
    });
}

export default function ModernVol1() {
    return (
        <div className="min-h-screen bg-[#0a0a0c] text-slate-300 py-12 lg:py-20 px-6">
            <article className="max-w-3xl mx-auto">
                
                {/* 🔖 ナビゲーション */}
                <nav className="flex items-center justify-between text-xs font-mono text-slate-500 mb-12 border-b border-white/5 pb-4">
                    <Link href="/series/99-archive/modern-fullstack-roadmap" className="hover:text-blue-400 flex items-center gap-1 transition-colors">
                        <List className="w-3 h-3" /> INDEX
                    </Link>
                    <span className="text-blue-500/50">MODERN_FULLSTACK // VOL.01</span>
                </nav>

                {/* 🚀 記事ヘッダー */}
                <header className="mb-16">
                    <h1 className="text-3xl md:text-5xl font-bold text-white mb-8 leading-tight">
                        インフラ選定：なぜ VPS と 8GB メモリが必要だったのか
                    </h1>

                    <div className="flex flex-wrap gap-6 text-xs font-mono text-slate-500">
                        <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-blue-500" /> 2026.04.13</div>
                        <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-blue-500" /> 6 MIN READ</div>
                        <div className="flex items-center gap-2"><User className="w-4 h-4 text-blue-500" /> AUTHOR: MAYA</div>
                    </div>
                </header>

                {/* 📝 本文 */}
                <div className="prose prose-invert prose-blue max-w-none 
                    prose-headings:text-white prose-headings:font-bold
                    prose-p:leading-relaxed prose-p:text-slate-300
                    prose-strong:text-blue-400 prose-code:text-blue-300">
                    
                    <p className="text-xl leading-relaxed text-slate-400 italic mb-12 border-l-2 border-blue-500 pl-6">
                        "365万件のレコードをミリ秒単位で検索し、Next.jsで爆速で描画する。この要件を突き詰めた結果、私は使い慣れたレンタルサーバーを捨てる決断をしました。"
                    </p>

                    <h2 id="server-choice">1. レンタルサーバーの限界点</h2>
                    <p>
                        PHP MVC編で述べた通り、レンタルサーバーは非常に効率的です。しかし、数百万件のデータを扱うDjangoインスタンスと、それを描画するNext.jsサーバーを同時に走らせるには、共有リソースの壁が厚すぎました。
                    </p>

                    <div className="my-10 p-6 bg-blue-500/5 border border-blue-500/20 rounded-2xl flex gap-4">
                        <Server className="text-blue-500 w-6 h-6 shrink-0" />
                        <div>
                            <h4 className="text-blue-500 font-bold m-0 uppercase text-sm">Hardware Specs</h4>
                            <p className="text-sm mt-2 mb-0">
                                <strong>Memory: 8GB</strong><br />
                                データベースのキャッシュ効率と、コンテナ（Docker）を複数稼働させるための最低ラインとして、このスペックを死守しました。
                            </p>
                        </div>
                    </div>

                    <h2 id="architecture">2. VPS という自由</h2>
                    <p>
                        root権限を持つことで、OSレベルでのチューニングが可能になります。BICSTATIONの心臓部であるデータベースのコネクションプーリングや、Nginxの細かいバッファ設定など、レンタルサーバーでは触れなかった「深部」まで手を入れられる。これが爆速への第一歩でした。
                    </p>

                    <div className="my-10 p-6 bg-white/5 border border-slate-800 rounded-2xl">
                        <div className="flex items-center gap-2 mb-4">
                            <Zap className="text-yellow-500 w-4 h-4" />
                            <span className="text-sm font-bold">The Decision Matrix</span>
                        </div>
                        <ul className="text-sm space-y-2 list-none p-0">
                            <li className="flex justify-between border-b border-white/5 pb-1 text-slate-400">
                                <span>DB I/O Speed</span>
                                <span className="text-blue-400 font-mono">CRITICAL</span>
                            </li>
                            <li className="flex justify-between border-b border-white/5 pb-1 text-slate-400">
                                <span>Docker Compatibility</span>
                                <span className="text-blue-400 font-mono">REQUIRED</span>
                            </li>
                            <li className="flex justify-between text-slate-400">
                                <span>Scalability</span>
                                <span className="text-blue-400 font-mono">HIGH</span>
                            </li>
                        </ul>
                    </div>

                    <h2 id="next-step">3. 物理環境が整って初めて、コードは光る</h2>
                    <p>
                        どんなに優れたTypeScriptのコードを書いても、インフラがボトルネックになれば台無しです。ローカル開発環境（ポート8083）から、本番VPS（ポート8000）へとリクエストを飛ばす瞬間の快感は、この物理環境を自分で構築したからこそ味わえるものでした。
                    </p>

                </div>

                {/* 🧭 フッターナビゲーション */}
                <footer className="mt-24 pt-12 border-t border-white/5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-6 rounded-2xl border border-dashed border-slate-800 flex items-center justify-center text-slate-600 text-sm">
                            PREVIOUS: NONE
                        </div>
                        
                        <Link 
                            href="/series/99-archive/modern-fullstack-roadmap/vol-2" 
                            className="group p-6 rounded-2xl border border-slate-800 bg-white/5 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all"
                        >
                            <span className="text-[10px] text-blue-500 font-mono block mb-2">NEXT EPISODE</span>
                            <div className="flex items-center justify-between">
                                <span className="text-white font-bold group-hover:text-blue-400 transition-colors">
                                    Vol.2 Django REST Framework による API 基盤
                                </span>
                                <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-blue-500 transition-all group-hover:translate-x-1" />
                            </div>
                        </Link>
                    </div>

                    <div className="mt-12 text-center">
                        <Link href="/series/99-archive/modern-fullstack-roadmap" className="text-xs font-mono text-slate-500 hover:text-white transition-colors">
                            BACK TO SERIES INDEX
                        </Link>
                    </div>
                </footer>
            </article>
        </div>
    );
}