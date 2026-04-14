/* eslint-disable react/no-unescaped-entities */
/**
 * =====================================================================
 * 🛰️ REBUILD_LOGS_VOL_6_V1.1
 * 🛡️ Project: Bic-Saving / Rebuild Logs
 * 💎 Purpose: 親子の邂逅とNext.js/Dockerへのパラダイムシフト
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
    Zap, 
    Terminal, 
    Layers 
} from 'lucide-react';
import { constructMetadata } from '@/shared/lib/utils/metadata';

export async function generateMetadata() {
    return constructMetadata({
        title: "Vol.6 Next.jsとの出会い：量産から「構築」へのパラダイムシフト | BIC-SAVING",
        description: "「なぜビルドしているんだ？」大学生の息子の背中から学んだ、現代フロントエンドとDockerの世界。",
    });
}

export default function RebuildLogsVol6() {
    return (
        <div className="min-h-screen bg-[#0a0a0c] text-slate-300 py-12 lg:py-20 px-6">
            <article className="max-w-3xl mx-auto">
                
                {/* 🔖 ナビゲーション */}
                <nav className="flex items-center justify-between text-xs font-mono text-slate-500 mb-12 border-b border-white/5 pb-4">
                    <Link href="/series/rebuild-logs" className="hover:text-emerald-500 flex items-center gap-1 transition-colors">
                        <List className="w-3 h-3" /> INDEX
                    </Link>
                    <span className="text-emerald-500/50">REBUILD_LOGS // VOL.06</span>
                </nav>

                {/* 🚀 記事ヘッダー */}
                <header className="mb-16">
                    <h1 className="text-3xl md:text-5xl font-bold text-white mb-8 leading-tight">
                        Next.jsとの出会い：<br/>「ビルド」の意味を知る日
                    </h1>

                    <div className="flex flex-wrap gap-6 text-xs font-mono text-slate-500">
                        <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-emerald-500" /> 2026.04.18</div>
                        <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-emerald-500" /> 12 MIN READ</div>
                        <div className="flex items-center gap-2"><User className="w-4 h-4 text-emerald-500" /> AUTHOR: NABE</div>
                    </div>
                </header>

                {/* 📝 本文 */}
                <div className="prose prose-invert prose-emerald max-w-none 
                    prose-headings:text-white prose-headings:font-bold
                    prose-p:leading-relaxed prose-p:text-slate-300
                    prose-strong:text-emerald-400 prose-code:text-emerald-300">
                    
                    <p className="text-xl leading-relaxed text-slate-400 italic mb-12 border-l-2 border-emerald-500 pl-6">
                        "PHPとFTPで時が止まっていた私にとって、息子の画面で動く『npm run build』の文字列は、未知の言語の呪文のようだった。"
                    </p>

                    <h2 id="section1">1. 自作MVCモデルから始めた「リハビリ」</h2>
                    <p>
                        Googleが「量から質」へ舵を切り、ライティング能力が問われる時代。理系ロジックに偏った私は、一度は敗北を認めました。
                        しかし、エンジニアとしての血は枯れていなかった。
                        WordPressの限界を感じ、Laravelに挑むも挫折。ならばと、自力で**「自作MVCモデル」**を組み上げ、モダンフレームワークの構造を一つずつ紐解いていきました。
                        すべては、もう一度「仕組み」を理解するために。
                    </p>

                    <h2 id="section2">2. 息子が教えてくれた「現代の武器」</h2>
                    <p>
                        そんな折、大学生になった息子がホームページを作っていることに気づきました。
                        かつて私がパソコンをいじる傍らで育った彼が口にしたのは、**Unity、TypeScript、そしてNext.js。**
                        「なぜホームページを作るのにビルドが必要なんだ？」
                        その疑問の答えを探すうちに、私はDockerによるコンテナ化、Djangoによるバックエンド、そしてTraefikによるリバースプロキシという、かつてのFTP転送とは別次元のシステム構成を知ることになります。
                    </p>

                    <div className="my-10 p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl flex gap-4">
                        <Layers className="text-emerald-500 w-6 h-6 shrink-0" />
                        <div>
                            <h4 className="text-emerald-500 font-bold m-0 uppercase text-sm font-mono">The Modern Stack: Inherited and Evolved</h4>
                            <p className="text-sm mt-2 mb-0">
                                息子が当たり前のように使いこなすNext.js + Django。親としての威厳をかけ（あるいは単なる好奇心から）、私はこのスタックを自分のものにすることを決意しました。
                            </p>
                        </div>
                    </div>

                    <h2 id="section3">3. 量産から「構築」へのパラダイムシフト</h2>
                    <p>
                        かつてのCSVTOHTMLは、言わば「焼き増し」でした。
                        しかし今、私が手にしているのは、App RouterやSSGといった、パフォーマンスとUXを極限まで高めるための「構築」の技術です。
                        「親として助言しなくては」という些細なきっかけ。
                        それが、10年の沈黙を破り、私を現代のフルスタックエンジニアへと引き戻すトリガーとなったのです。
                    </p>

                    <div className="my-10 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl">
                            <Terminal className="w-8 h-8 text-blue-500 mb-3" />
                            <div className="text-lg font-bold text-white font-mono">Docker / Traefik</div>
                            <div className="text-xs text-slate-500 font-mono">Infrastructure Orchestration</div>
                        </div>
                        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl">
                            <Zap className="w-8 h-8 text-yellow-500 mb-3" />
                            <div className="text-lg font-bold text-white font-mono">Next.js / Django</div>
                            <div className="text-xs text-slate-500 font-mono">High-Performance Fullstack</div>
                        </div>
                    </div>

                </div>

                {/* 🧭 フッターナビゲーション */}
                <footer className="mt-24 pt-12 border-t border-white/5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Link 
                            href="/series/rebuild-logs/vol-5" 
                            className="group p-6 rounded-2xl border border-slate-800 bg-white/5 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all text-left"
                        >
                            <span className="text-[10px] text-blue-500 font-mono block mb-2 flex items-center gap-1">
                                <ChevronLeft className="w-3 h-3" /> PREVIOUS EPISODE
                            </span>
                            <span className="text-white font-bold group-hover:text-blue-400 transition-colors text-sm">
                                Vol.5 10年間の沈黙とnabejuku.com
                            </span>
                        </Link>
                        
                        <Link 
                            href="/series/rebuild-logs/vol-7" 
                            className="group p-6 rounded-2xl border border-slate-800 bg-white/5 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all text-right"
                        >
                            <span className="text-[10px] text-emerald-500 font-mono block mb-2 flex items-center justify-end gap-1">
                                NEXT EPISODE <ChevronRight className="w-3 h-3" />
                            </span>
                            <span className="text-white font-bold group-hover:text-emerald-400 transition-colors text-sm">
                                Vol.7 Saving is the New Affiliate
                            </span>
                        </Link>
                    </div>

                    <div className="mt-12 text-center">
                        <Link href="/series/rebuild-logs" className="text-xs font-mono text-slate-500 hover:text-white transition-colors">
                            BACK TO SERIES INDEX
                        </Link>
                    </div>
                </footer>
            </article>
        </div>
    );
}