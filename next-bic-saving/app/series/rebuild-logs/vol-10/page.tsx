/* eslint-disable react/no-unescaped-entities */
/**
 * =====================================================================
 * 🛰️ REBUILD_LOGS_VOL_10_FINAL_V1.2
 * 🛡️ Project: Bic-Saving / Rebuild Logs
 * 💎 Purpose: 17年の旅の終着点と、実践ガイド（Card Guide）への接続
 * =====================================================================
 */

import React from 'react';
import Link from 'next/link';
import { 
    ChevronLeft,
    List, 
    Calendar, 
    Clock, 
    User, 
    Flag,
    ArrowRight,
    ShieldCheck,
    Terminal,
    Code2
} from 'lucide-react';
import { constructMetadata } from '@/shared/lib/utils/metadata';

export async function generateMetadata() {
    return constructMetadata({
        title: "Vol.10 再起のBic-Saving。これが私の「なべ塾 2.0」だ。 | BIC-SAVING",
        description: "過去を供養し、技術と知恵で「新しい自由」を手に入れる。17年の旅を経て、実践のステージへ。",
    });
}

export default function RebuildLogsVol10() {
    return (
        <div className="min-h-screen bg-[#0a0a0c] text-slate-300 py-12 lg:py-20 px-6">
            <article className="max-w-3xl mx-auto">
                
                {/* 🔖 ナビゲーション */}
                <nav className="flex items-center justify-between text-xs font-mono text-slate-500 mb-12 border-b border-white/5 pb-4">
                    <Link href="/series/rebuild-logs" className="hover:text-emerald-500 flex items-center gap-1 transition-colors">
                        <List className="w-3 h-3" /> INDEX
                    </Link>
                    <span className="text-emerald-500/50">REBUILD_LOGS // VOL.10 [FINAL]</span>
                </nav>

                {/* 🚀 記事ヘッダー */}
                <header className="mb-20 text-center">
                    <div className="inline-block p-4 rounded-2xl bg-gradient-to-b from-emerald-500/20 to-transparent mb-8 ring-1 ring-emerald-500/20">
                        <Flag className="w-10 h-10 text-emerald-500" />
                    </div>
                    <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-8 tracking-tight leading-tight">
                        再起のBic-Saving。<br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500">
                            これが私の「なべ塾 2.0」だ。
                        </span>
                    </h1>

                    <div className="flex justify-center gap-6 text-xs font-mono text-slate-500">
                        <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-emerald-500" /> 2026.04.22</div>
                        <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-emerald-500" /> 15 MIN READ</div>
                        <div className="flex items-center gap-2"><User className="w-4 h-4 text-emerald-500" /> AUTHOR: NABE</div>
                    </div>
                </header>

                {/* 📝 本文 */}
                <div className="prose prose-invert prose-emerald max-w-none 
                    prose-headings:text-white prose-headings:font-bold
                    prose-p:leading-relaxed prose-p:text-slate-300
                    prose-strong:text-emerald-400 prose-code:text-emerald-300">
                    
                    <div className="relative py-12 px-8 mb-16 text-center overflow-hidden rounded-3xl border border-white/5">
                        <div className="absolute inset-0 bg-emerald-500/5 opacity-20 pointer-events-none" />
                        <p className="text-xl md:text-2xl leading-relaxed text-slate-200 italic m-0 relative z-10 font-serif">
                            "かつてGoogleに奪われたのは『収益』であって、<br className="hidden md:block" />
                            『技術を愛する心』ではなかった。"
                        </p>
                    </div>

                    <h2 id="section1" className="flex items-center gap-3">
                        <Terminal className="w-6 h-6 text-emerald-500" /> 1. 17年目の供養と再構築
                    </h2>
                    <p>
                        2008年、「なべ塾」というドメインを立ち上げたあの日。まさか17年後に自分がNext.jsやDockerを弄りながら、再びこの場所に帰ってくるとは思いもしませんでした。
                        月200万の報酬も、Googleからの消滅も、すべてはこの瞬間のための「経験値」だった。
                    </p>
                    <p>
                        nabejuku.comという名前を供養し、Bic-Savingとして再構築する。それは私にとって、過去を肯定するための唯一の儀式でした。
                    </p>

                    <h2 id="section2" className="flex items-center gap-3">
                        <Code2 className="w-6 h-6 text-blue-500" /> 2. 技術は「守る」ためにある
                    </h2>
                    <p>
                        PHPからNext.jsへ。アフィリエイトから「節約の最適化」へ。手法は変わりましたが、私のロジックは何も変わっていません。
                        格差が広がる日本で、平均給与という罠に嵌らず、自らの手で「還元ルート」を設計し、家計をデバッグする。
                    </p>
                    <p>
                        「なべ塾 2.0」は、かつてのように「稼がせる」場所ではなく、自立したエンジニアのように<strong>「賢く守り、増やす」</strong>ための技術を共有する場所です。
                    </p>

                    <div className="my-16 p-1 bg-gradient-to-r from-emerald-500/20 via-blue-500/20 to-emerald-500/20 rounded-[2rem]">
                        <div className="p-8 md:p-12 bg-[#0d0d0f] rounded-[1.9rem] text-center">
                            <ShieldCheck className="w-12 h-12 text-emerald-500 mx-auto mb-6" />
                            <h3 className="text-2xl md:text-3xl font-bold text-white m-0 mb-4">実践のステージへ</h3>
                            <p className="text-slate-400 mb-10 max-w-lg mx-auto leading-relaxed">
                                物語はここで終わりますが、あなたの「最適化」はここから始まります。
                                現代日本の最強還元スタックを組み合わせた「解」を、完全ガイドとして実装しました。
                            </p>
                            
                            <Link 
                                href="/guide/card" 
                                className="inline-flex items-center gap-3 px-8 py-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold transition-all group shadow-2xl shadow-emerald-500/20 active:scale-95"
                            >
                                クレジットカード最強攻略ガイドを見る
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </div>

                    <h2 id="section3">3. 最後に</h2>
                    <p>
                        息子に負けたくないという一心で覚えたモダンスタックが、私に新しい自由をくれました。
                        技術は裏切らない。そして、泥臭い経験こそがAIには書けない最高の武器になる。
                    </p>
                    <p>
                        これにて「再構築ログ」完結です。
                        Bic-Savingのビルドは、これからも続いていきます。
                    </p>

                </div>

                {/* 🧭 フッターナビゲーション */}
                <footer className="mt-32 pt-16 border-t border-white/5 text-center">
                    <div className="mb-12">
                        <span className="px-4 py-1.5 rounded-full bg-white/5 text-slate-500 text-[10px] font-mono tracking-[0.2em] uppercase">
                            --- End of Rebuild Logs Series ---
                        </span>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
                        <Link 
                            href="/series/rebuild-logs/vol-9" 
                            className="group flex items-center gap-2 text-sm font-mono text-slate-500 hover:text-emerald-500 transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            BACK TO VOL.09
                        </Link>
                        
                        <div className="h-px w-8 bg-white/10 hidden sm:block" />

                        <Link 
                            href="/series/rebuild-logs" 
                            className="px-10 py-4 rounded-xl border border-slate-800 bg-slate-900/50 hover:border-emerald-500/50 hover:bg-emerald-500/5 text-white transition-all text-xs font-mono tracking-widest"
                        >
                            SERIES INDEX
                        </Link>

                        <div className="h-px w-8 bg-white/10 hidden sm:block" />

                        <Link 
                            href="/" 
                            className="text-sm font-mono text-slate-500 hover:text-white transition-colors"
                        >
                            PORTFOLIO TOP
                        </Link>
                    </div>

                    <div className="mt-20 opacity-20 hover:opacity-100 transition-opacity duration-1000">
                        <p className="text-[10px] font-mono text-slate-500 italic">
                            System status: Rebuild complete. <br />
                            Execution time: 17 years, 4 months.
                        </p>
                    </div>
                </footer>
            </article>
        </div>
    );
}