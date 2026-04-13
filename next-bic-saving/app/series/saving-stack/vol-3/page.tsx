/* eslint-disable react/no-unescaped-entities */
'use client';

/**
 * =====================================================================
 * 🛰️ SAVING_STACK_VOL_3_V1.3 (Backend Architecture & Logic)
 * 🛡️ Project: Bic-Saving / Saving Stack
 * 💎 Purpose: 不安定な価格変数を「決済ロジック」で吸収する
 * =====================================================================
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { 
    List, 
    Calendar, 
    Clock, 
    User, 
    Database,
    ArrowRight,
    CreditCard,
    Zap,
    Calculator,
    RefreshCcw,
    Activity,
    TrendingDown,
    LineChart,
    ShieldCheck
} from 'lucide-react';

export default function SavingStackVol3() {
    // ⛽ ガソリン単価の変数化 (Environment Variable)
    const [gasPrice, setGasPrice] = useState(175);
    const appDiscount = 7; // フロントエンド値引き定数
    const pointReturnRate = 0.015; // 三井住友カード ゴールドNL +α 想定 (1.5%)

    // 演算ロジック (Business Logic)
    const afterDiscount = gasPrice - appDiscount;
    const pointsEarned = afterDiscount * pointReturnRate;
    const realPrice = afterDiscount - pointsEarned;
    const totalSavingPerLiter = gasPrice - realPrice;

    return (
        <div className="min-h-screen bg-[#0a0a0c] text-slate-300 py-12 lg:py-20 px-6 font-sans selection:bg-emerald-500/30">
            <article className="max-w-3xl mx-auto">
                
                {/* 🔖 ナビゲーション */}
                <nav className="flex items-center justify-between text-xs font-mono text-slate-500 mb-12 border-b border-white/5 pb-4">
                    <Link href="/series/saving-stack" className="hover:text-emerald-400 flex items-center gap-1 transition-colors font-bold text-emerald-500/80 group">
                        <List className="w-3 h-3 group-hover:rotate-90 transition-transform" /> SERIES_INDEX
                    </Link>
                    <span className="text-emerald-500/50 uppercase tracking-[0.2em] font-bold font-mono">Saving_Stack // Vol.03</span>
                </nav>

                {/* 🚀 記事ヘッダー */}
                <header className="mb-16">
                    <div className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-mono mb-6 tracking-widest uppercase animate-pulse">
                        Backend Architecture & Data Pipeline
                    </div>
                    <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-10 leading-[1.1] tracking-tight">
                        給油決済の「バックエンド」に<br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-blue-500">
                            三井住友カードをデプロイする
                        </span>
                    </h1>

                    <div className="flex flex-wrap gap-8 text-[11px] font-mono text-slate-500 border-l border-white/10 pl-6">
                        <div className="flex flex-col gap-1">
                            <span className="text-emerald-500/50 block">DATE</span>
                            <div className="flex items-center gap-2 text-slate-300"><Calendar className="w-3.5 h-3.5" /> 2026.04.18</div>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-emerald-500/50 block">READ_TIME</span>
                            <div className="flex items-center gap-2 text-slate-300"><Clock className="w-3.5 h-3.5" /> 14 MIN READ</div>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-emerald-500/50 block">VERSION</span>
                            <div className="flex items-center gap-2 text-slate-300 font-bold underline decoration-emerald-500/30 cursor-help">v1.3-STABLE</div>
                        </div>
                    </div>
                </header>

                <div className="prose prose-invert prose-emerald max-w-none 
                    prose-headings:text-white prose-headings:font-bold
                    prose-p:leading-relaxed prose-p:text-slate-400 prose-p:text-lg
                    prose-strong:text-emerald-400 prose-code:text-emerald-300 prose-code:bg-emerald-500/10 prose-code:px-1 prose-code:rounded">
                    
                    <div className="relative mb-16 py-10 px-8 bg-white/[0.02] border-y border-white/5 overflow-hidden">
                        <LineChart className="absolute -left-4 -top-4 w-32 h-32 text-emerald-500/5 rotate-12" />
                        <p className="relative z-10 text-xl md:text-2xl leading-relaxed text-slate-300 italic font-medium m-0 text-center">
                            "マーケット（価格）のボラティリティは制御不能だ。<br className="hidden md:block"/>
                            ならば、決済という『ロジック』で<br className="hidden md:block"/>
                            実効コストをねじ伏せるしかない。"
                        </p>
                    </div>

                    <h2 id="section1" className="flex items-center gap-3 !text-2xl tracking-tight border-l-4 border-emerald-500 pl-4">
                        <Activity className="w-6 h-6 text-emerald-500" /> 1. 不安定な外部変数への対抗策
                    </h2>
                    <p>
                        最近のガソリン価格は、まるで未テストのベータ版ソフトウェアのように不安定です。この**「ボラティリティ」**は、家計という名の本番サーバーを運用する我々にとって、許容しがたい「不確実性」です。
                    </p>
                    <p>
                        第2回で実装した「物理レイヤー（EneKey）」は強力ですが、それはフロントエンドでの「値引き」に過ぎません。真に家計を安定させるには、決済という**バックエンド・レイヤー**に、三井住友カード（Olive / ゴールドNL）のような「高還元エンジン」を導入し、価格変動を吸収する抽象化レイヤーを構築する必要があります。
                    </p>

                    {/* 📊 インタラクティブ・シミュレーター */}
                    <div className="my-12 p-8 bg-slate-900 border border-emerald-500/20 rounded-3xl relative overflow-hidden group shadow-[0_20px_50px_rgba(16,185,129,0.1)]">
                        <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-20 transition-all duration-700">
                            <RefreshCcw className="w-32 h-32 text-emerald-500 animate-[spin_10s_linear_infinite]" />
                        </div>
                        
                        <div className="relative z-10">
                            <h3 className="flex items-center gap-2 text-white text-lg font-bold mb-8 mt-0 font-mono tracking-tight">
                                <Calculator className="w-5 h-5 text-emerald-500" /> 
                                EFFECTIVE_PRICE_SIMULATOR <span className="text-[10px] text-slate-500 font-normal">v1.3 // Runtime</span>
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                                {/* Input Side */}
                                <div className="space-y-8">
                                    <div className="space-y-4">
                                        <label className="block text-[11px] font-mono text-slate-500 uppercase tracking-[0.3em] font-bold">
                                            Environment: Market Gas Price
                                        </label>
                                        <div className="flex items-baseline gap-4 mb-2">
                                            <span className="text-6xl font-extrabold text-white font-mono tracking-tighter tabular-nums italic text-shadow-glow">
                                                {gasPrice}
                                            </span>
                                            <span className="text-xs font-mono text-emerald-500 font-bold uppercase tracking-widest">JPY / L</span>
                                        </div>
                                        <input 
                                            type="range" 
                                            min="140" 
                                            max="200" 
                                            value={gasPrice}
                                            onChange={(e) => setGasPrice(Number(e.target.value))}
                                            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 hover:accent-emerald-400 transition-all"
                                        />
                                    </div>
                                    <p className="text-[10px] leading-relaxed text-slate-500 font-mono italic">
                                        // スライダーを操作して、市場単価の変動が実効コストに与える影響を確認してください。
                                    </p>
                                </div>

                                {/* Result Side */}
                                <div className="p-8 bg-[#0a0a0c]/80 border border-white/5 rounded-2xl space-y-5 backdrop-blur-xl shadow-inner relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-1 h-full bg-emerald-500/20"></div>
                                    <div className="flex justify-between items-center text-xs border-b border-white/5 pb-4 group/item">
                                        <span className="text-slate-500 font-mono tracking-wider">FRONTEND DISCOUNT</span>
                                        <span className="text-emerald-400 font-mono font-bold">-{appDiscount} JPY</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs border-b border-white/5 pb-4">
                                        <span className="text-slate-500 font-mono tracking-wider">BACKEND REWARD (V-PT)</span>
                                        <span className="text-blue-400 font-mono font-bold">-{pointsEarned.toFixed(2)} JPY</span>
                                    </div>
                                    <div className="pt-4">
                                        <div className="text-[10px] text-emerald-500/50 font-mono uppercase font-bold mb-2 tracking-[0.2em]">Effective Real Price</div>
                                        <div className="flex items-baseline gap-3">
                                            <span className="text-4xl text-white font-mono font-extrabold tracking-tighter tabular-nums underline decoration-emerald-500/20 underline-offset-8">
                                                {realPrice.toFixed(2)}
                                            </span>
                                            <span className="text-xs text-emerald-500 font-bold uppercase font-mono tracking-widest">JPY/L</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="mt-10 pt-6 border-t border-white/5 flex items-center justify-between">
                                <div className="flex items-center gap-3 text-emerald-500">
                                    <TrendingDown className="w-5 h-5 animate-bounce" />
                                    <span className="text-[11px] font-mono font-extrabold uppercase tracking-[0.2em]">Total Optimization Impact</span>
                                </div>
                                <span className="text-lg text-white font-mono font-extrabold tabular-nums bg-emerald-500/10 px-4 py-1 rounded-full border border-emerald-500/20">
                                    -{totalSavingPerLiter.toFixed(2)} JPY / L
                                </span>
                            </div>
                        </div>
                    </div>

                    <h2 id="section2" className="flex items-center gap-3 !text-2xl tracking-tight border-l-4 border-blue-500 pl-4">
                        <CreditCard className="w-6 h-6 text-blue-500" /> 2. なぜ「三井住友カード」がコアなのか
                    </h2>
                    <p>
                        単なる還元率だけを見るなら、他にも選択肢はあるでしょう。しかし、私が三井住友カードをバックエンドに選ぶのは、それが**「Vポイント経済圏」という巨大なAPI群の中核**だからです。
                    </p>
                    <p>
                        給油で発生したVポイントは、即座にSBI証券での投資信託買い付けに充当（デプロイ）可能です。つまり、ガソリンを入れれば入れるほど、私のポートフォリオに微細な流動性が供給される。この**「消費から投資へのCI/CDパイプライン」**こそが、エンジニアが構築すべき家計のオートメーションです。
                    </p>

                    <h2 id="section3" className="flex items-center gap-3 !text-2xl tracking-tight border-l-4 border-emerald-500 pl-4">
                        <ShieldCheck className="w-6 h-6 text-emerald-500" /> 3. 決済レイヤーの「冗長化と可用性」
                    </h2>
                    <p>
                        三井住友カードを軸に据えることで、SBI証券、Vポイント、提携ポイントといった「マルチクラウド」的な運用が可能になります。一つのサービスが改悪されても、コアの決済基盤さえ揺るぎなければ、接続先（ポイント交換先）を切り替えるだけで最適解を維持できる。
                    </p>
                    <p>
                        ガソリンスタンドという物理ノードに依存せず、どこでも一定のパフォーマンスを維持できるこの**冗長性**が、システム運用（家計管理）における心の可用性を高めます。
                    </p>

                    <div className="my-12 p-8 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/20 rounded-3xl relative overflow-hidden group">
                        <Zap className="absolute -right-4 -bottom-4 w-32 h-32 text-emerald-500/10 group-hover:scale-110 transition-transform duration-700" />
                        <h4 className="flex items-center gap-3 text-emerald-400 font-bold mt-0 mb-6 uppercase text-xs tracking-[0.3em] font-mono leading-none">
                            <Zap className="w-4 h-4" /> Optimization Philosophy
                        </h4>
                        <p className="text-lg m-0 leading-relaxed italic text-slate-200 font-medium">
                            「価格の変動に一喜一憂するのは、コードのバグに振り回されるのと同じだ。我々がすべきは、どんな入力値（市場単価）が来ても、常に最適な出力（還元）を生成する堅牢な『純粋関数』を実装することである。」
                        </p>
                    </div>

                    <h2 id="section4" className="!text-2xl">まとめ：堅牢なバックエンドが、自由を作る</h2>
                    <p>
                        ガソリン価格という外部変数を定数化することはできませんが、決済ロジックによって「影響を最小化」することは可能です。
                    </p>
                    <p>
                        バックエンドが安定したところで、次回はいよいよフロントエンドの巨頭、**「Amazon × ドコモ提携」**という外部APIの統合に挑みます。家計のマイクロサービス化は、さらに加速します。
                    </p>
                </div>

                {/* 🧭 フッターナビゲーション */}
                <footer className="mt-24 pt-12 border-t border-white/5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono">
                        <Link 
                            href="/series/saving-stack/vol-2" 
                            className="group p-8 rounded-3xl border border-slate-800 bg-white/[0.02] hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all text-left relative overflow-hidden shadow-xl"
                        >
                            <span className="text-[10px] text-emerald-500 font-bold block mb-4 tracking-[0.2em]">PREV_STP / VOL_02</span>
                            <span className="text-white font-bold group-hover:text-emerald-400 transition-colors text-sm leading-tight block font-sans">
                                第2回：物理レイヤー攻略<br/>（EneKey & App Binding）
                            </span>
                        </Link>
                        
                        <Link 
                            href="/series/saving-stack/vol-4" 
                            className="group p-8 rounded-3xl border border-slate-800 bg-white/[0.02] hover:border-blue-500/50 hover:bg-blue-500/5 transition-all text-right relative overflow-hidden shadow-xl"
                        >
                            <span className="text-[10px] text-blue-500 font-bold block mb-4 tracking-[0.2em]">NEXT_STP / VOL_04</span>
                            <div className="flex items-center justify-end gap-4">
                                <span className="text-white font-bold group-hover:text-blue-400 transition-colors text-sm leading-tight block font-sans">
                                    第4回：外部API統合<br/>（Amazon × ドコモ連携）
                                </span>
                                <ArrowRight className="w-5 h-5 text-slate-600 group-hover:text-blue-500 transition-all group-hover:translate-x-2" />
                            </div>
                        </Link>
                    </div>

                    <div className="mt-16 flex items-center justify-center gap-4">
                        <div className="h-px w-12 bg-white/5"></div>
                        <Link href="/series/saving-stack" className="text-[10px] font-mono text-slate-500 hover:text-emerald-500 transition-colors tracking-widest uppercase font-bold">
                            Return to Series Index
                        </Link>
                        <div className="h-px w-12 bg-white/5"></div>
                    </div>
                </footer>
            </article>
        </div>
    );
}