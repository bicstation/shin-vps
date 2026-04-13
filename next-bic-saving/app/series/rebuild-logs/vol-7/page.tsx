/* eslint-disable react/no-unescaped-entities */
/**
 * =====================================================================
 * 🛰️ REBUILD_LOGS_VOL_7_V1.0
 * 🛡️ Project: Bic-Saving / Rebuild Logs
 * 💎 Purpose: 格差社会における「節約」という名の最適化戦略
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
    TrendingDown,
    Scale,
    Calculator,
    ShieldCheck,
    AlertCircle
} from 'lucide-react';
import { constructMetadata } from '@/shared/lib/utils/metadata';

export async function generateMetadata() {
    return constructMetadata({
        title: "Vol.7 節約は「負けないアフィリエイト」である | BIC-SAVING",
        description: "平均給与という罠、格差の拡大。現代日本で生き残るための、ロジカルな家計デバッグ。",
    });
}

export default function RebuildLogsVol7() {
    return (
        <div className="min-h-screen bg-[#0a0a0c] text-slate-300 py-12 lg:py-20 px-6">
            <article className="max-w-3xl mx-auto">
                
                {/* 🔖 ナビゲーション */}
                <nav className="flex items-center justify-between text-xs font-mono text-slate-500 mb-12 border-b border-white/5 pb-4">
                    <Link href="/series/rebuild-logs" className="hover:text-emerald-500 flex items-center gap-1 transition-colors">
                        <List className="w-3 h-3" /> INDEX
                    </Link>
                    <span className="text-emerald-500/50">REBUILD_LOGS // VOL.07</span>
                </nav>

                {/* 🚀 記事ヘッダー */}
                <header className="mb-16">
                    <h1 className="text-3xl md:text-5xl font-bold text-white mb-8 leading-tight">
                        節約は、<br/>「負けないアフィリエイト」だ。
                    </h1>

                    <div className="flex flex-wrap gap-6 text-xs font-mono text-slate-500">
                        <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-emerald-500" /> 2026.04.19</div>
                        <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-emerald-500" /> 10 MIN READ</div>
                        <div className="flex items-center gap-2"><User className="w-4 h-4 text-emerald-500" /> AUTHOR: NABE</div>
                    </div>
                </header>

                {/* 📝 本文 */}
                <div className="prose prose-invert prose-emerald max-w-none 
                    prose-headings:text-white prose-headings:font-bold
                    prose-p:leading-relaxed prose-p:text-slate-300
                    prose-strong:text-emerald-400 prose-code:text-emerald-300">
                    
                    <p className="text-xl leading-relaxed text-slate-400 italic mb-12 border-l-2 border-emerald-500 pl-6">
                        "1割の富裕層が釣り上げる『平均値』という名の幻想。その裏側で、9割の国民が静かに疲弊している。"
                    </p>

                    <h2 id="section1">1. 「平均給与」という計算式の罠</h2>
                    <p>
                        かつて公務員の世界に身を置いていたからこそ、私は知っています。公務員の給料は国民の「平均」を基準に計算されます。しかし、現代日本の就職ランキング1位が地方公務員であるという事実は、あまりに皮肉です。
                        本来なら「平均」しか貰えないはずの職種が、最も安定し、羨望の的となる。それは、**「平均以下の生活を強いられている層」が圧倒的多数派**になったことの証明に他なりません。
                    </p>

                    <div className="my-10 p-6 bg-red-500/5 border border-red-500/20 rounded-2xl flex gap-4">
                        <Scale className="text-red-500 w-6 h-6 shrink-0" />
                        <div>
                            <h4 className="text-red-500 font-bold m-0 uppercase text-sm">The Inequality Trap</h4>
                            <p className="text-sm mt-2 mb-0">
                                上位1割が平均を押し上げ、残り9割が取り残される構造。この環境下で「収入を増やす」という攻めの一手は、かつてのアフィリエイト黄金期よりも遥かに難易度が上がっています。
                            </p>
                        </div>
                    </div>

                    <h2 id="section2">2. 再現率100%の収益源：支出のデバッグ</h2>
                    <p>
                        アフィリエイトは、他人の意思決定を待つゲームです。記事を書き、リンクを張り、誰かが購入してくれるのを祈る。
                        対して「節約」は、自分の意思一つで完結します。
                        携帯代、ガソリン代、日々の決済。これらをエンジニアの眼で徹底的にデバッグし、月1万円の固定費を削る。それは、**「課税されない1万円の不労所得」**を永続的に手に入れたことと同義です。
                    </p>

                    <h2 id="section3">3. Bic-Saving が目指す「新しい自由」</h2>
                    <p>
                        日本国民のほとんどが「節約したい、お金を増やしたい」と願う切実な現実。
                        私のシステム（Bic-Saving）は、かつてCSVをこねくり回してGoogleをハックしていたエネルギーを、今度は**「家計の最適化」**へと向けています。
                        かつてのなべ塾が「知識」を授けたように、今のBic-Savingは「技術」で格差社会を生き抜くための武器を配りたい。
                    </p>

                    <div className="my-10 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl">
                            <AlertCircle className="w-8 h-8 text-yellow-500 mb-3" />
                            <div className="text-lg font-bold text-white">Market Risk</div>
                            <div className="text-xs text-slate-500">Ad revenue is unstable and dependent on others.</div>
                        </div>
                        <div className="p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl">
                            <ShieldCheck className="w-8 h-8 text-emerald-500 mb-3" />
                            <div className="text-lg font-bold text-white">Guaranteed Return</div>
                            <div className="text-xs text-slate-500">Every yen saved is a yen earned. 100% success rate.</div>
                        </div>
                    </div>

                </div>

                {/* 🧭 フッターナビゲーション */}
                <footer className="mt-24 pt-12 border-t border-white/5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Link 
                            href="/series/rebuild-logs/vol-6" 
                            className="group p-6 rounded-2xl border border-slate-800 bg-white/5 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all text-left"
                        >
                            <span className="text-[10px] text-blue-500 font-mono block mb-2 flex items-center gap-1">
                                <ChevronLeft className="w-3 h-3" /> PREVIOUS EPISODE
                            </span>
                            <span className="text-white font-bold group-hover:text-blue-400 transition-colors">
                                Vol.6 Next.jsとの出会い
                            </span>
                        </Link>
                        
                        <div className="p-6 rounded-2xl border border-dashed border-slate-800 flex items-center justify-center text-slate-600 text-sm italic font-mono text-center">
                            NEXT EPISODE:<br/>OPTIMIZING THE 7-YEN DISCOUNT
                        </div>
                    </div>
                </footer>
            </article>
        </div>
    );
}