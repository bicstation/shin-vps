/* eslint-disable react/no-unescaped-entities */
/**
 * =====================================================================
 * 🛰️ REBUILD_LOGS_VOL_10_FINAL_V1.1
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
    Rocket,
    ArrowRight,
    Heart,
    RefreshCw,
    ShieldCheck
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
                <header className="mb-16 text-center">
                    <div className="inline-block p-3 rounded-full bg-emerald-500/10 mb-6">
                        <Flag className="w-8 h-8 text-emerald-500" />
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-8 leading-tight">
                        再起のBic-Saving。<br/>これが私の「なべ塾 2.0」だ。
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
                    
                    <p className="text-xl leading-relaxed text-slate-400 italic mb-12 border-l-2 border-emerald-500 pl-6 text-center border-l-0">
                        "かつてGoogleに奪われたのは『収益』であって、『技術を愛する心』ではなかった。"
                    </p>

                    <h2 id="section1">1. 17年目の供養と再構築</h2>
                    <p>
                        2008年、「なべ塾」というドメインを立ち上げたあの日。まさか17年後に自分がNext.jsやDockerを弄りながら、再びこの場所に帰ってくるとは思いもしませんでした。
                        月200万の報酬も、Googleからの消滅も、すべてはこの瞬間のための「経験値」だった。
                        nabejuku.comという名前を供養し、Bic-Savingとして再構築する。それは私にとって、過去を肯定するための唯一の儀式でした。
                    </p>

                    <h2 id="section2">2. 技術は「守る」ためにある</h2>
                    <p>
                        PHPからNext.jsへ。アフィリエイトから「節約の最適化」へ。
                        手法は変わりましたが、私のロジックは何も変わっていません。
                        格差が広がる日本で、平均給与という罠に嵌らず、自らの手で「還元ルート」を設計し、家計をデバッグする。
                        「なべ塾 2.0」は、かつてのように「稼がせる」場所ではなく、自立したエンジニアのように「賢く守り、増やす」ための技術を共有する場所です。
                    </p>

                    <div className="my-10 p-8 bg-gradient-to-br from-emerald-500/10 to-blue-500/10 border border-white/10 rounded-3xl">
                        <div className="flex items-center gap-4 mb-6">
                            <ShieldCheck className="w-10 h-10 text-emerald-500" />
                            <h3 className="text-2xl font-bold text-white m-0">実践のステージへ</h3>
                        </div>
                        <p className="text-slate-300 mb-8 leading-relaxed">
                            物語はここで終わりますが、あなたの「最適化」はここから始まります。
                            私が心血を注いで構築した、現代日本の最強還元スタック——三井住友カード、Olive、そしてAmazonカードを組み合わせた「解」を、以下のガイドにまとめました。
                        </p>
                        
                        <Link 
                            href="/guide/card" 
                            className="inline-flex items-center gap-2 px-6 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all group shadow-xl shadow-emerald-500/20"
                        >
                            クレジットカード最強攻略ガイドを見る
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    <h2 id="section3">3. 最後に</h2>
                    <p>
                        息子に負けたくないという一心で覚えたモダンスタックが、私に新しい自由をくれました。
                        技術は裏切らない。そして、泥臭い経験こそがAIには書けない最高の武器になる。
                        
                        これにて「再構築ログ」完結です。
                        Bic-Savingのビルドは、これからも続いていきます。
                    </p>

                </div>

                {/* 🧭 フッターナビゲーション */}
                <footer className="mt-24 pt-12 border-t border-white/5 text-center">
                    <p className="text-slate-500 text-sm mb-8 font-mono">--- END OF SERIES ---</p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link 
                            href="/series/rebuild-logs" 
                            className="px-8 py-3 rounded-full border border-slate-700 hover:border-emerald-500 hover:text-emerald-500 transition-all text-xs font-mono"
                        >
                            RETURN TO INDEX
                        </Link>
                        <Link 
                            href="/" 
                            className="px-8 py-3 rounded-full bg-slate-800 hover:bg-slate-700 text-white transition-all text-xs font-mono"
                        >
                            BACK TO TOP
                        </Link>
                    </div>
                </footer>
            </article>
        </div>
    );
}