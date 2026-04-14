/* eslint-disable react/no-unescaped-entities */
/**
 * =====================================================================
 * 🛰️ SAVING_STACK_VOL_1_V1.1 (Identity & Architecture)
 * 🛡️ Project: Bic-Saving / Saving Stack
 * 💎 Purpose: 家計を「システム」と定義し、最適化の全体像を提示する
 * =====================================================================
 */

import React from 'react';
import Link from 'next/link';
import { 
    List, 
    Calendar, 
    Clock, 
    User, 
    Layers,
    ArrowRight,
    Cpu,
    Database,
    Smartphone,
    TrendingDown,
    ShieldCheck,
    Terminal,
    Workflow
} from 'lucide-react';

export default function SavingStackVol1() {
    return (
        <div className="min-h-screen bg-[#0a0a0c] text-slate-300 py-12 lg:py-20 px-6 font-sans selection:bg-emerald-500/30">
            <article className="max-w-3xl mx-auto">
                
                {/* 🔖 ナビゲーション */}
                <nav className="flex items-center justify-between text-xs font-mono text-slate-500 mb-12 border-b border-white/5 pb-4">
                    <Link href="/series/saving-stack" className="hover:text-emerald-400 flex items-center gap-1 transition-colors font-bold text-emerald-500/80 group">
                        <List className="w-3 h-3 group-hover:rotate-90 transition-transform" /> SERIES_INDEX
                    </Link>
                    <span className="text-emerald-500/50 uppercase tracking-[0.2em] font-bold">Saving_Stack // Vol.01</span>
                </nav>

                {/* 🚀 記事ヘッダー */}
                <header className="mb-16 relative">
                    <div className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-mono mb-6 tracking-widest uppercase animate-pulse">
                        System Architecture & Paradigm
                    </div>
                    <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-10 leading-[1.1] tracking-tight">
                        家計は「システム」だ。<br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-blue-500 to-purple-600">
                            2026年版・節約技術スタックの全貌
                        </span>
                    </h1>

                    <div className="flex flex-wrap gap-8 text-[11px] font-mono text-slate-500 border-l border-white/10 pl-6">
                        <div className="flex flex-col gap-1">
                            <span className="text-emerald-500/50 block">DATE</span>
                            <div className="flex items-center gap-2 text-slate-300"><Calendar className="w-3.5 h-3.5" /> 2026.04.14</div>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-emerald-500/50 block">READ_TIME</span>
                            <div className="flex items-center gap-2 text-slate-300"><Clock className="w-3.5 h-3.5" /> 12 MIN READ</div>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-emerald-500/50 block">DEPLOYED_BY</span>
                            <div className="flex items-center gap-2 text-slate-300"><User className="w-3.5 h-3.5" /> NABE</div>
                        </div>
                    </div>
                </header>

                {/* 📝 本文 */}
                <div className="prose prose-invert prose-emerald max-w-none 
                    prose-headings:text-white prose-headings:font-bold
                    prose-p:leading-relaxed prose-p:text-slate-400 prose-p:text-lg
                    prose-strong:text-emerald-400 prose-code:text-emerald-300 prose-code:bg-emerald-500/10 prose-code:px-1 prose-code:rounded">
                    
                    <div className="relative mb-16 py-10 px-8 bg-white/[0.02] border-y border-white/5 overflow-hidden">
                        <Terminal className="absolute -left-4 -top-4 w-32 h-32 text-emerald-500/5 rotate-12" />
                        <p className="relative z-10 text-xl md:text-2xl leading-relaxed text-slate-300 italic font-medium m-0 text-center">
                            "家計管理に必要なのは「我慢」ではない。<br className="hidden md:block"/>
                            不必要なパケット（支出）を遮断し、<br className="hidden md:block"/>
                            ルーティングを最適化する『技術』だ。"
                        </p>
                    </div>

                    <h2 id="section1" className="flex items-center gap-3 !text-2xl tracking-tight border-l-4 border-emerald-500 pl-4">
                        <Cpu className="w-6 h-6 text-emerald-500" /> 1. 節約を「リソース最適化」として再定義する
                    </h2>
                    <p>
                        世間一般で言われる「節約」には、どこか悲壮感が漂います。欲しいものを諦め、生活の質を落とす……。しかし、我々エンジニアにとって、無駄なリソース消費をカットし、パフォーマンスを最大化させる作業は、むしろ**「至上の快感」**のはずです。
                    </p>
                    <p>
                        家計も全く同じです。
                        銀行口座は「データベース」、クレジットカードは「ゲートウェイ」、そして日々の支払いは「リクエスト」です。
                        このシリーズでは、家計を一つのシステムスタックとして捉え、2026年現在、最も効率的にリワード（還元）を生成する構成図を公開します。
                    </p>

                    <h2 id="section2" className="flex items-center gap-3 !text-2xl tracking-tight border-l-4 border-blue-500 pl-4">
                        <Layers className="w-6 h-6 text-blue-500" /> 2. 2026年版：Bic-Saving 推奨スタック
                    </h2>
                    <p>
                        私が設計し、現在も本番環境（＝我が家）で稼働しているアーキテクチャは以下の通りです。
                    </p>

                    {/* 🛠️ Architecture Visualization */}
                    <div className="my-12 p-8 bg-gradient-to-br from-slate-900 to-[#0a0a0c] border border-white/5 rounded-3xl font-mono text-sm relative overflow-hidden shadow-2xl">
                        <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none">
                            <Workflow className="w-64 h-64" />
                        </div>
                        
                        <div className="space-y-6 relative z-10">
                            <div className="flex flex-col md:flex-row md:items-center gap-4 group">
                                <div className="w-32 text-slate-500 uppercase text-[10px] tracking-widest font-bold">UI / Frontend</div>
                                <div className="flex-1 p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl text-emerald-400 font-bold group-hover:bg-emerald-500/10 transition-all shadow-lg shadow-emerald-500/5">
                                    <div className="text-[10px] text-emerald-500/50 mb-1">USER_TOUCHPOINT</div>
                                    スマホタッチ決済 / EneKey / d払い
                                </div>
                            </div>
                            
                            <div className="flex justify-center ml-0 md:ml-32"><ArrowRight className="w-5 h-5 text-slate-800 rotate-90" /></div>
                            
                            <div className="flex flex-col md:flex-row md:items-center gap-4 group">
                                <div className="w-32 text-slate-500 uppercase text-[10px] tracking-widest font-bold">Logic / Gateway</div>
                                <div className="flex-1 p-4 bg-blue-500/5 border border-blue-500/20 rounded-2xl text-blue-400 font-bold group-hover:bg-blue-500/10 transition-all shadow-lg shadow-blue-500/5">
                                    <div className="text-[10px] text-blue-500/50 mb-1">VALIDATION_&_REWARD_LOGIC</div>
                                    三井住友カード (NL) / Olive / Amazon連携
                                </div>
                            </div>
                            
                            <div className="flex justify-center ml-0 md:ml-32"><ArrowRight className="w-5 h-5 text-slate-800 rotate-90" /></div>
                            
                            <div className="flex flex-col md:flex-row md:items-center gap-4 group">
                                <div className="w-32 text-slate-500 uppercase text-[10px] tracking-widest font-bold">Infrastructure</div>
                                <div className="flex-1 p-4 bg-white/[0.03] border border-white/10 rounded-2xl text-slate-300 font-bold group-hover:bg-white/[0.05] transition-all">
                                    <div className="text-[10px] text-slate-500 mb-1">DATA_PERSISTENCE</div>
                                    三井住友銀行 / SBI証券（Vポイント投資）
                                </div>
                            </div>
                        </div>
                    </div>

                    <p>
                        このスタックの最大の特徴は、**「一度組んでしまえば、意識せずとも勝手にポイントが貯まる」**という自動化にあります。
                        コンビニでの支払いをスマホのタッチ決済に変えるだけで最大7%還元。ガソリンを給油すればリッター7円引き。
                        これらは「努力」ではなく**「初期設定（Provisioning）」**の問題です。
                    </p>

                    <h2 id="section3" className="flex items-center gap-3 !text-2xl tracking-tight border-l-4 border-emerald-500 pl-4">
                        <Smartphone className="w-6 h-6 text-emerald-500" /> 3. 17年前の「CSV」から続く探究心
                    </h2>
                    <p>
                        かつてアフィリエイトで月200万を稼いでいた頃、私は「報酬の発生条件（トリガー）」を血眼になって探していました。膨大なCSVを読み込み、キーワードと成約の相関をデバッグし、収益という名のログを最大化させる……。
                    </p>
                    <p>
                        今、その情熱は「還元の最大化」に向けられています。
                        三井住友カードのVポイントと、ドコモのdポイントは、Amazonという巨大なプラットフォームを介して強力に結合しました。この**「ポイントの相互乗り入れ（Interoperability）」**こそが、2026年の家計管理における最大の攻略ポイントです。
                    </p>

                    <div className="my-10 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-8 bg-white/[0.03] border border-white/5 rounded-3xl group hover:border-emerald-500/50 transition-all">
                            <TrendingDown className="w-10 h-10 text-emerald-500 mb-6 group-hover:scale-110 transition-transform" />
                            <h4 className="text-white text-lg font-bold mb-3">固定費のパッチ当て</h4>
                            <p className="text-sm text-slate-400 m-0 leading-relaxed font-sans">
                                サブスク、ガソリン代、通信費。一度見直せば永続的に効果を発揮する「静的最適化（Static Optimization）」。
                            </p>
                        </div>
                        <div className="p-8 bg-white/[0.03] border border-white/5 rounded-3xl group hover:border-blue-500/50 transition-all">
                            <ShieldCheck className="w-10 h-10 text-blue-500 mb-6 group-hover:scale-110 transition-transform" />
                            <h4 className="text-white text-lg font-bold mb-3">安全なアセット管理</h4>
                            <p className="text-sm text-slate-400 m-0 leading-relaxed font-sans">
                                怪しい投資ではなく、大手決済インフラの還元をSBI証券で「デプロイ」する、冗長性の高い資産運用。
                            </p>
                        </div>
                    </div>

                    <h2 id="section4" className="!text-2xl">まとめ：あなたの家計を「リビルド」しよう</h2>
                    <p>
                        これからの連載では、上記のスタックを一つずつ解説し、具体的な手順（＝設定ファイルの書き方のようなもの）を公開していきます。
                        17年前に私がCSVを量産して未来を切り拓こうとしたように、今度はこのスタックで、あなたの家計に「新しい自由」を実装しましょう。
                    </p>
                    <p className="font-bold text-white italic">
                        "準備はいいですか？ 最初のデプロイ先は、ガソリンスタンドです。"
                    </p>
                </div>

                {/* 🧭 フッターナビゲーション */}
                <footer className="mt-24 pt-12 border-t border-white/5">
                    <div className="flex justify-end font-mono">
                        <Link 
                            href="/series/saving-stack/vol-2" 
                            className="group p-8 rounded-3xl border border-slate-800 bg-white/[0.02] hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all text-right w-full md:w-2/3 relative overflow-hidden shadow-2xl"
                        >
                            <div className="absolute top-0 right-0 w-1 h-full bg-emerald-500 scale-y-0 group-hover:scale-y-100 transition-transform origin-top"></div>
                            <span className="text-[10px] text-emerald-500 font-bold block mb-4 tracking-[0.2em]">NEXT_STP / VOL_02</span>
                            <div className="flex items-center justify-end gap-4">
                                <span className="text-white font-bold group-hover:text-emerald-400 transition-colors text-lg tracking-tight font-sans leading-tight">
                                    ガソリン代リッター7円引きの<br/>「物理レイヤー」攻略
                                </span>
                                <ArrowRight className="w-6 h-6 text-slate-600 group-hover:text-emerald-500 transition-all group-hover:translate-x-2" />
                            </div>
                        </Link>
                    </div>

                    <div className="mt-16 flex items-center justify-center gap-4">
                        <div className="h-px w-12 bg-white/5"></div>
                        <Link href="/series/saving-stack" className="text-[10px] font-mono text-slate-500 hover:text-emerald-500 transition-colors tracking-widest uppercase font-bold">
                            Return to Index
                        </Link>
                        <div className="h-px w-12 bg-white/5"></div>
                    </div>
                </footer>
            </article>
        </div>
    );
}