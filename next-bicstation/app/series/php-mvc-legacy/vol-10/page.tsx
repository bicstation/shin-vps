/* eslint-disable react/no-unescaped-entities */
/**
 * =====================================================================
 * 🛰️ PHP_MVC_SERIES_VOL_10_V1.0
 * 🛡️ Maya's Strategy: 学習の終着点を「次への出発点」として定義
 * 💎 Purpose: 基礎を固めたことが、モダン環境での適応力に直結したことを証明
 * =====================================================================
 */

import React from 'react';
import Link from 'next/link';
import { 
    List, 
    Calendar, 
    Clock, 
    User, 
    Flag,
    Rocket
} from 'lucide-react';
import { constructMetadata } from '@/shared/lib/utils/metadata';

export async function generateMetadata() {
    return constructMetadata({
        title: "Vol.10 完成：レガシーからモダンへのバトン | BICSTATION",
        description: "車輪の再発明を終えて。自作 MVC フレームワークが教えてくれた、不変のソフトウェア設計原則。",
    });
}

export default function SeriesVol10() {
    return (
        <div className="min-h-screen bg-[#0a0a0c] text-slate-300 py-12 lg:py-20 px-6">
            <article className="max-w-3xl mx-auto">
                
                {/* 🔖 ナビゲーション */}
                <nav className="flex items-center justify-between text-xs font-mono text-slate-500 mb-12 border-b border-white/5 pb-4">
                    <Link href="/series/php-mvc-legacy" className="hover:text-emerald-500 flex items-center gap-1 transition-colors">
                        <List className="w-3 h-3" /> INDEX
                    </Link>
                    <span className="text-emerald-500/50">PHP_MVC_SERIES // VOL.10 (FINAL)</span>
                </nav>

                {/* 🚀 記事ヘッダー */}
                <header className="mb-16">
                    <h1 className="text-3xl md:text-5xl font-bold text-white mb-8 leading-tight">
                        完成：レガシーから<br />モダンへのバトン
                    </h1>

                    <div className="flex flex-wrap gap-6 text-xs font-mono text-slate-500">
                        <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-emerald-500" /> 2026.04.22</div>
                        <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-emerald-500" /> 12 MIN READ</div>
                        <div className="flex items-center gap-2"><User className="w-4 h-4 text-emerald-500" /> AUTHOR: MAYA</div>
                    </div>
                </header>

                {/* 📝 本文 */}
                <div className="prose prose-invert prose-emerald max-w-none 
                    prose-headings:text-white prose-headings:font-bold
                    prose-p:leading-relaxed prose-p:text-slate-300
                    prose-strong:text-emerald-400 prose-code:text-emerald-300">
                    
                    <p className="text-xl leading-relaxed text-slate-400 italic mb-12 border-l-2 border-emerald-500 pl-6">
                        "車輪を再発明することは、車輪がなぜ丸いのかを知る最短ルートでした。"
                    </p>

                    <h2 id="reflection">1. 泥臭い基礎が、翼になる</h2>
                    <p>
                        ルーティング、DB接続、モデルの隠蔽、バリデーション。これらを一から実装した経験は、現代の高度に抽象化されたフレームワーク（Next.js や Django）の裏側で何が起きているかを理解するための圧倒的な「解像度」を私に与えてくれました。
                    </p>

                    <div className="my-10 p-8 bg-emerald-500/5 border border-emerald-500/20 rounded-3xl text-center">
                        <Flag className="text-emerald-500 w-12 h-12 mx-auto mb-4" />
                        <h3 className="text-white mt-0">Legacy Goal: Accomplished</h3>
                        <p className="text-sm text-slate-400 mb-0">
                            このシリーズを通じて構築した PHP MVC の知見は、<br />
                            そのまま BICSTATION のコア・アーキテクチャへと継承されました。
                        </p>
                    </div>

                    <h2 id="to-the-future">2. 次のステージへ</h2>
                    <p>
                        レガシーな環境での苦労を知っているからこそ、モダンの「速さ」と「安全性」の真価がわかります。このバトンを手に、私は BICSTATION をさらなる高みへと押し進めます。PHP で学んだ「不変の設計原則」は、これからも私のエンジニアリングの根幹であり続けるでしょう。
                    </p>
                </div>

                {/* 🧭 シリーズ完結メッセージ */}
                <footer className="mt-24 p-12 bg-white/5 rounded-2xl border border-slate-800 text-center">
                    <Rocket className="w-10 h-10 text-emerald-500 mx-auto mb-6" />
                    <h2 className="text-2xl font-bold text-white mb-4">PHP MVC Series: Complete</h2>
                    <p className="text-slate-400 mb-8 leading-relaxed">
                        最後までお読みいただきありがとうございました。<br />
                        この旅は、次の「Modern Fullstack Roadmap」へと続きます。
                    </p>
                    <Link href="/series/modern-fullstack-roadmap" className="inline-block bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-8 rounded-full transition-all hover:scale-105 active:scale-95">
                        Modern 編の最終章を読む
                    </Link>
                </footer>
            </article>
        </div>
    );
}