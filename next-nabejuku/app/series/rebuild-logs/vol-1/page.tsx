/* eslint-disable react/no-unescaped-entities */
/**
 * =====================================================================
 * 🛰️ REBUILD_LOGS_VOL_1_V1.1
 * 🛡️ Project: Bic-Saving / Rebuild Logs
 * 💎 Purpose: 17年前の原点（なべ塾）と「静的HTML」時代の技術的追憶
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
    Database,
    Code2,
    History,
    FileCode2,
    ArrowRightLeft
} from 'lucide-react';
import { constructMetadata } from '@/shared/lib/utils/metadata';

export async function generateMetadata() {
    return constructMetadata({
        title: "Vol.1 2008年、なべ塾開校と「ゆこゆこ」の500円 | BIC-SAVING",
        description: "1件500円の積み上げが教えてくれたシステムの力。CSVTOHTMLと歩んだHTML量産時代の記録。",
    });
}

export default function RebuildLogsVol1() {
    return (
        <div className="min-h-screen bg-[#0a0a0c] text-slate-300 py-12 lg:py-20 px-6">
            <article className="max-w-3xl mx-auto">
                
                {/* 🔖 ナビゲーション */}
                <nav className="flex items-center justify-between text-xs font-mono text-slate-500 mb-12 border-b border-white/5 pb-4">
                    <Link href="/series/rebuild-logs" className="hover:text-emerald-500 flex items-center gap-1 transition-colors">
                        <List className="w-3 h-3" /> INDEX
                    </Link>
                    <span className="text-emerald-500/50">REBUILD_LOGS // VOL.01</span>
                </nav>

                {/* 🚀 記事ヘッダー */}
                <header className="mb-16">
                    <h1 className="text-3xl md:text-5xl font-bold text-white mb-8 leading-tight">
                        2008年、なべ塾開校と「ゆこゆこ」の500円
                    </h1>

                    <div className="flex flex-wrap gap-6 text-xs font-mono text-slate-500">
                        <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-emerald-500" /> 2026.04.13</div>
                        <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-emerald-500" /> 6 MIN READ</div>
                        <div className="flex items-center gap-2"><User className="w-4 h-4 text-emerald-500" /> AUTHOR: NABE</div>
                    </div>
                </header>

                {/* 📝 本文 */}
                <div className="prose prose-invert prose-emerald max-w-none 
                    prose-headings:text-white prose-headings:font-bold
                    prose-p:leading-relaxed prose-p:text-slate-300
                    prose-strong:text-emerald-400 prose-code:text-emerald-300">
                    
                    <p className="text-xl leading-relaxed text-slate-400 italic mb-12 border-l-2 border-emerald-500 pl-6">
                        "公立中学校の臨時教諭を辞めた後、私は自宅兼店舗の2階で渡辺学習塾を開始した。当時、静かな教室の片隅で回していたのは、1件500円の報酬を積み上げるための『システム』だった。"
                    </p>

                    <h2 id="section1">1. 15人の生徒と、深夜のモニター光</h2>
                    <p>
                        塾のスタート時の生徒数は15人ほど。教壇に立ち、子供たちに数学や理科を教える傍ら、私の意識の半分は常にパソコンに向いていました。大学時代、卒業論文で<strong>「自然言語処理」</strong>を専攻していた私にとって、テキストデータを解析し、構造化することは、もはや本能に近い趣味だったのです。
                    </p>

                    <div className="my-10 p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl flex gap-4">
                        <History className="text-emerald-500 w-6 h-6 shrink-0" />
                        <div>
                            <h4 className="text-emerald-500 font-bold m-0 uppercase text-sm">Background</h4>
                            <p className="text-sm mt-2 mb-0">
                                公立中学の臨時教諭から個人塾経営へ。この転身が、時間的な自由と「技術を収益に変える」ための実験場を私に与えてくれました。
                            </p>
                        </div>
                    </div>

                    <h2 id="section2">2. 「ゆこゆこネット」という名のデータベース</h2>
                    <p>
                        当時のアフィリエイトは今よりもずっとデータドリブンな側面がありました。目をつけたのは温泉予約サイト「ゆこゆこネット」。
                        1件の成約報酬はわずか500円。しかし、リンクシェアが提供する膨大なホテル情報のCSVファイルを見た瞬間、私にはそれが「お宝の山」に見えました。
                    </p>

                    <div className="my-10 p-6 bg-blue-500/5 border border-blue-500/20 rounded-2xl flex gap-4">
                        <Database className="text-blue-500 w-6 h-6 shrink-0" />
                        <div>
                            <h4 className="text-blue-500 font-bold m-0 uppercase text-sm">The Logic of 500 Yen</h4>
                            <p className="text-sm mt-2 mb-0">
                                数十件の予約を待つのではない。数千件、数万件の宿泊施設ページを生成し、インターネットの海に網を張る。1件500円の報酬を、システムの力で月200万へと昇華させる戦いが始まりました。
                            </p>
                        </div>
                    </div>

                    <h2 id="section3">3. CSVTOHTML：原始的なSSGの衝撃</h2>
                    <p>
                        「CSVTOHTML」というソフトを覚えているでしょうか。リンクシェアから落としたCSVを読み込み、静的HTMLを叩き出す。今のNext.jsでいうところのSSG（Static Site Generation）の原型とも言える手法です。
                        深夜、塾の授業案を作る手を止め、MT（Movable Type）の再構築ボタンを押し、大量のファイルをサーバーへデプロイする。その瞬間に感じる「仕組みが動いている感覚」こそが、現在の <strong>Bic-Saving</strong> の思想へと繋がっています。
                    </p>

                    <div className="my-10 p-6 bg-slate-500/5 border border-slate-800 rounded-2xl flex gap-4 font-mono text-xs">
                        <Code2 className="text-slate-500 w-6 h-6 shrink-0" />
                        <div className="overflow-x-auto w-full">
                            <span className="text-slate-500 leading-none">// Workflow Memory</span>
                            <ul className="mt-2 space-y-1 list-none p-0 text-emerald-400/80">
                                <li>DATA_SOURCE: Linkshare_CSV</li>
                                <li>CONVERSION_TOOL: CSVTOHTML</li>
                                <li>PLATFORM: Movable Type</li>
                                <li>TRANSFER: FTP (Binary Mode)</li>
                            </ul>
                        </div>
                    </div>

                    <h2 id="section4">4. 「.html」という名の絶対的な資産</h2>
                    <p>
                        今でこそ App Router だ Hydration だと騒がしいですが、当時は <strong>.html という拡張子が世界のすべて</strong>でした。
                        CSVTOHTML が書き出すのは、サーバーに置けばそのまま表示される完成されたファイル。
                        1枚1枚は単純な構造でしたが、それが数万枚重なったとき、Google の検索結果を占拠する「巨大な壁」へと変貌しました。
                    </p>

                    <div className="my-10 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
                            <div className="flex items-center gap-2 mb-4">
                                <FileCode2 className="w-4 h-4 text-slate-500" />
                                <h4 className="text-slate-400 font-bold m-0 text-xs uppercase tracking-wider">Then: 2008 (Static)</h4>
                            </div>
                            <ul className="text-sm list-none p-0 space-y-2 text-slate-500 font-mono">
                                <li>- File: index.html</li>
                                <li>- Style: inline / table layout</li>
                                <li>- Logic: CSV-to-Static-HTML</li>
                                <li>- Deploy: FTP Upload (Long wait)</li>
                            </ul>
                        </div>
                        <div className="p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl">
                            <div className="flex items-center gap-2 mb-4">
                                <ArrowRightLeft className="w-4 h-4 text-emerald-500" />
                                <h4 className="text-emerald-500 font-bold m-0 text-xs uppercase tracking-wider">Now: 2026 (Modern)</h4>
                            </div>
                            <ul className="text-sm list-none p-0 space-y-2 text-slate-300 font-mono">
                                <li>- File: page.tsx (Next.js)</li>
                                <li>- Style: Tailwind CSS</li>
                                <li>- Logic: React / Server Components</li>
                                <li>- Deploy: Vercel / Docker (CI/CD)</li>
                            </ul>
                        </div>
                    </div>

                    <p>
                        塾の授業が終わる22時。そこから翌朝まで、静まり返った教室内でPCだけが熱を帯び、数千のHTMLを生成し続けていた。
                        「なべ塾」というリアルの教育現場と、「HTML量産」というバーチャルな錬金術。
                        その二足の草鞋が、私のエンジニアとしてのキャリアを決定づけたのです。
                    </p>

                </div>

                {/* 🧭 フッターナビゲーション */}
                <footer className="mt-24 pt-12 border-t border-white/5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-6 rounded-2xl border border-dashed border-slate-800 flex items-center justify-center text-slate-600 text-sm italic font-mono">
                            PREVIOUS: GENESIS
                        </div>
                        
                        <Link 
                            href="/series/rebuild-logs/vol-2" 
                            className="group p-6 rounded-2xl border border-slate-800 bg-white/5 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all"
                        >
                            <span className="text-[10px] text-emerald-500 font-mono block mb-2">NEXT EPISODE</span>
                            <div className="flex items-center justify-between">
                                <span className="text-white font-bold group-hover:text-emerald-400 transition-colors">
                                    Vol.2 再構築ボタンとFTPの転送音
                                </span>
                                <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-emerald-500 transition-all group-hover:translate-x-1" />
                            </div>
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