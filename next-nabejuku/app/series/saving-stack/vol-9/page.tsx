/* eslint-disable react/no-unescaped-entities */
'use client';

/**
 * =====================================================================
 * 🛰️ SAVING_STACK_VOL_9_V1.0 (Data Persistence & Deployment)
 * 🛡️ Project: Bic-Saving / Saving Stack
 * 💎 Purpose: Vポイント/dポイントを資産（SBI証券等）へデプロイする出口戦略
 * =====================================================================
 */

import React from 'react';
import Link from 'next/link';
import { 
    List, 
    Calendar, 
    User, 
    ArrowRight,
    TrendingUp,
    Database,
    ArrowUpCircle,
    LineChart,
    ShieldCheck,
    RefreshCw,
    MoveRight,
    PieChart
} from 'lucide-react';

export default function SavingStackVol9() {
    return (
        <div className="min-h-screen bg-[#0a0a0c] text-slate-300 py-12 lg:py-20 px-6 font-sans selection:bg-emerald-600/30">
            <article className="max-w-3xl mx-auto">
                
                {/* 🔖 ナビゲーション */}
                <nav className="flex items-center justify-between text-xs font-mono text-slate-500 mb-12 border-b border-white/5 pb-4">
                    <Link href="/series/saving-stack" className="hover:text-emerald-400 flex items-center gap-1 transition-colors font-bold text-emerald-500/80 group">
                        <List className="w-3 h-3 group-hover:rotate-90 transition-transform" /> SERIES_INDEX
                    </Link>
                    <span className="text-emerald-500/50 uppercase tracking-[0.2em] font-bold font-mono">Saving_Stack // Vol.09</span>
                </nav>

                {/* 🚀 記事ヘッダー */}
                <header className="mb-16">
                    <div className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-mono mb-6 tracking-widest uppercase animate-pulse">
                        Data Persistence Layer
                    </div>
                    <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-10 leading-[1.1] tracking-tight">
                        ポイントを「資産」へ<br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-teal-400 to-blue-500">
                            本番デプロイせよ
                        </span>
                    </h1>

                    <div className="flex flex-wrap gap-8 text-[11px] font-mono text-slate-500 border-l border-white/10 pl-6">
                        <div className="flex flex-col gap-1">
                            <span className="text-emerald-500/50 block">DATE</span>
                            <div className="flex items-center gap-2 text-slate-300"><Calendar className="w-3.5 h-3.5" /> 2026.05.15</div>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-emerald-500/50 block">PROCESS</span>
                            <div className="flex items-center gap-2 text-slate-300 uppercase tracking-wider italic font-bold">Point_Deployment</div>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-emerald-500/50 block">AUTHOR</span>
                            <div className="flex items-center gap-2 text-slate-300 italic"><User className="w-3.5 h-3.5" /> NABE</div>
                        </div>
                    </div>
                </header>

                <div className="prose prose-invert prose-emerald max-w-none 
                    prose-headings:text-white prose-headings:font-bold
                    prose-p:leading-relaxed prose-p:text-slate-400 prose-p:text-lg
                    prose-strong:text-emerald-400 prose-code:text-emerald-300 prose-code:bg-emerald-500/10 prose-code:px-1 prose-code:rounded">
                    
                    <div className="relative mb-16 py-10 px-8 bg-emerald-500/[0.02] border-y border-white/5 overflow-hidden">
                        <Database className="absolute -right-4 -top-4 w-32 h-32 text-emerald-500/5 -rotate-12" />
                        <p className="relative z-10 text-xl md:text-2xl leading-relaxed text-slate-300 italic font-medium m-0 text-center">
                            "ポイントは、消費されるのを待つ一時的なキャッシュ（Cache）ではない。<br className="hidden md:block"/>
                            投資信託という永続ストレージへ移送し、<br className="hidden md:block"/>
                            複利による再生産を開始せよ。"
                        </p>
                    </div>

                    <h2 id="section1" className="flex items-center gap-3 !text-2xl tracking-tight border-l-4 border-emerald-500 pl-4">
                        <ArrowUpCircle className="w-6 h-6 text-emerald-500" /> 1. 出口戦略の重要性
                    </h2>
                    <p>
                        どれだけ還元率を高めても、そのポイントを「無駄な買い物」で消費してしまっては、システム全体の投資対効果（ROI）はマイナスです。貯まったポイントは、**「資産運用（投資）」に回すことで初めて、家計システムの純利益**として確定します。
                    </p>

                    <h2 id="section2" className="flex items-center gap-3 !text-2xl tracking-tight border-l-4 border-teal-500 pl-4">
                        <RefreshCw className="w-6 h-6 text-teal-500" /> 2. Vポイント投資のオートメーション
                    </h2>
                    <p>
                        三井住友カードで貯まったVポイントは、SBI証券の「Vポイント投資」と連携させることで、1ポイント単位で投資信託の購入に充当可能です。
                    </p>
                    
                    <div className="my-10 p-8 bg-slate-900/50 border border-emerald-500/20 rounded-3xl font-mono relative overflow-hidden group shadow-2xl">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <PieChart className="w-16 h-16 text-emerald-400" />
                        </div>
                        <div className="flex items-center gap-2 text-emerald-400 mb-6 uppercase tracking-[0.2em] text-[11px] font-bold">
                            <TrendingUp className="w-4 h-4" /> asset_allocation.json
                        </div>
                        <div className="space-y-6 text-sm">
                            <div className="border-l-2 border-emerald-500/30 pl-4 py-1">
                                <span className="text-white font-bold block">V-Point Integration</span>
                                <span className="text-slate-400 italic">SBI証券のメインポイントをVポイントに設定。積立の「一部または全額」をポイントで自動決済。</span>
                            </div>
                            <div className="border-l-2 border-blue-500/30 pl-4 py-1">
                                <span className="text-white font-bold block">d-Point Integration</span>
                                <span className="text-slate-400 italic">日興フロッギー等を利用し、dポイントを「株」に変える。あるいは「ポイント投資」で疑似運用。</span>
                            </div>
                            <div className="border-l-2 border-slate-500/30 pl-4 py-1 text-slate-500">
                                <span className="font-bold block tracking-tighter">Wait... // Point_Migration</span>
                                <span className="italic">Vポイントをdポイントへ移行（またはその逆）し、還元のハブを一本化する最適化も検討の余地あり。</span>
                            </div>
                        </div>
                    </div>

                    <h2 id="section3" className="flex items-center gap-3 !text-2xl tracking-tight border-l-4 border-blue-500 pl-4">
                        <LineChart className="w-6 h-6 text-blue-500" /> 3. 複利という名の「再帰関数」
                    </h2>
                    <p>
                        投資に回されたポイントは、市場の成長とともに増殖します。
                        これはプログラミングにおける**「再帰的な再生産」**です。節約で得たリソースが、さらなるリソースを生み出す。このループを回し始めることが、エンジニア式家計管理のゴールの一つです。
                    </p>

                    <div className="my-12 p-8 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/20 rounded-3xl relative overflow-hidden group">
                        <ShieldCheck className="absolute -right-4 -bottom-4 w-32 h-32 text-emerald-500/10 group-hover:scale-110 transition-transform duration-700" />
                        <h4 className="flex items-center gap-3 text-emerald-400 font-bold mt-0 mb-6 uppercase text-xs tracking-[0.3em] font-mono leading-none">
                            <ShieldCheck className="w-4 h-4" /> Persistence Strategy
                        </h4>
                        <p className="text-sm m-0 leading-relaxed italic text-slate-300 font-medium">
                            「ポイントは通貨ではなく、システムの『余剰メモリ』だ。そのまま放置すればインフレという名のメモリリークで価値が目減りする。速やかに資産という不揮発性ストレージへコミット（Commit）せよ。」
                        </p>
                    </div>

                    <h2 id="section4" className="!text-2xl text-white">まとめ：ポイントは「使う」から「育てる」へ</h2>
                    <p>
                        出口戦略を固定することで、日々の節約（Vol.1〜8）に対するモチベーションが「純利益の最大化」という明確な数値目標に変わります。
                    </p>
                    <p>
                        いよいよ次回、最終回。これまでのスタックを俯瞰し、**家計の「ダッシュボード化」と月次メンテナンス**という、システムの「運用フェーズ」について総括します。
                    </p>
                </div>

                {/* 🧭 フッターナビゲーション */}
                <footer className="mt-24 pt-12 border-t border-white/5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono">
                        <Link 
                            href="/series/saving-stack/vol-8" 
                            className="group p-8 rounded-3xl border border-slate-800 bg-white/[0.02] hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all text-left relative overflow-hidden shadow-xl"
                        >
                            <span className="text-[10px] text-emerald-500 font-bold block mb-4 tracking-[0.2em]">PREV_STP / VOL_08</span>
                            <span className="text-white font-bold group-hover:text-emerald-400 transition-colors text-sm leading-tight block font-sans">
                                第8回：三井住友カード<br/>「7%還元」対象店舗を網羅
                            </span>
                        </Link>
                        
                        <Link 
                            href="/series/saving-stack/vol-10" 
                            className="group p-8 rounded-3xl border border-slate-800 bg-white/[0.02] hover:border-blue-500/50 hover:bg-blue-500/5 transition-all text-right relative overflow-hidden shadow-xl"
                        >
                            <span className="text-[10px] text-blue-500 font-bold block mb-4 tracking-[0.2em]">FINAL_STP / VOL_10</span>
                            <div className="flex items-center justify-end gap-4">
                                <span className="text-white font-bold group-hover:text-blue-400 transition-colors text-sm leading-tight block font-sans text-right">
                                    最終回：家計の「ダッシュボード化」<br/>と継続的メンテナンス
                                </span>
                                <ArrowRight className="w-5 h-5 text-slate-600 group-hover:text-blue-500 transition-all group-hover:translate-x-2" />
                            </div>
                        </Link>
                    </div>

                    <div className="mt-16 flex items-center justify-center gap-4 text-center">
                        <div className="h-px w-12 bg-white/5"></div>
                        <Link href="/series/saving-stack" className="text-[10px] font-mono text-slate-500 hover:text-white transition-colors tracking-widest uppercase font-bold group flex items-center gap-2">
                             SERIES_INDEX <MoveRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <div className="h-px w-12 bg-white/5"></div>
                    </div>
                </footer>
            </article>
        </div>
    );
}