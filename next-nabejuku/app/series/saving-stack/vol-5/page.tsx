/* eslint-disable react/no-unescaped-entities */
'use client';

/**
 * =====================================================================
 * 🛰️ SAVING_STACK_VOL_5_V1.0 (Job Scheduling & Batch Processing)
 * 🛡️ Project: Bic-Saving / Saving Stack
 * 💎 Purpose: Amazonでの「バッチ処理（まとめ買い）」による還元トリガーの制御
 * =====================================================================
 */

import React from 'react';
import Link from 'next/link';
import { 
    List, 
    Calendar, 
    Clock, 
    User, 
    ArrowRight,
    Layers,
    Zap,
    Timer,
    Database,
    CheckCircle2,
    Package,
    Terminal,
    ArrowDownToLine
} from 'lucide-react';

export default function SavingStackVol5() {
    return (
        <div className="min-h-screen bg-[#0a0a0c] text-slate-300 py-12 lg:py-20 px-6 font-sans selection:bg-emerald-500/30">
            <article className="max-w-3xl mx-auto">
                
                {/* 🔖 ナビゲーション */}
                <nav className="flex items-center justify-between text-xs font-mono text-slate-500 mb-12 border-b border-white/5 pb-4">
                    <Link href="/series/saving-stack" className="hover:text-emerald-400 flex items-center gap-1 transition-colors font-bold text-emerald-500/80 group">
                        <List className="w-3 h-3 group-hover:rotate-90 transition-transform" /> SERIES_INDEX
                    </Link>
                    <span className="text-emerald-500/50 uppercase tracking-[0.2em] font-bold font-mono">Saving_Stack // Vol.05</span>
                </nav>

                {/* 🚀 記事ヘッダー */}
                <header className="mb-16">
                    <div className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-mono mb-6 tracking-widest uppercase animate-pulse">
                        Resource Optimization & Scheduling
                    </div>
                    <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-10 leading-[1.1] tracking-tight">
                        Amazonの「バッチ処理」で<br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-green-400 to-teal-500">
                            還元リソースを最大化する
                        </span>
                    </h1>

                    <div className="flex flex-wrap gap-8 text-[11px] font-mono text-slate-500 border-l border-white/10 pl-6">
                        <div className="flex flex-col gap-1">
                            <span className="text-emerald-500/50 block">DATE</span>
                            <div className="flex items-center gap-2 text-slate-300"><Calendar className="w-3.5 h-3.5" /> 2026.04.24</div>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-emerald-500/50 block">PROCESS</span>
                            <div className="flex items-center gap-2 text-slate-300 uppercase tracking-wider italic">Batch_Execution</div>
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
                        <Layers className="absolute -right-4 -top-4 w-32 h-32 text-emerald-500/5 rotate-12" />
                        <p className="relative z-10 text-xl md:text-2xl leading-relaxed text-slate-300 italic font-medium m-0 text-center">
                            "都度買いという『ストリーム処理』はオーバーヘッドが大きい。<br className="hidden md:block"/>
                            需要をキューに溜め、最適なタイミングで<br className="hidden md:block"/>
                            『バッチ実行』せよ。"
                        </p>
                    </div>

                    <h2 id="section1" className="flex items-center gap-3 !text-2xl tracking-tight border-l-4 border-emerald-500 pl-4">
                        <Timer className="w-6 h-6 text-emerald-500" /> 1. 「5,000円の壁」をどう解釈するか
                    </h2>
                    <p>
                        前回の「Amazon × d払い連携」において、最大の制約（バリデーション）は**「1回5,000円以上の決済」**という条件でした。少額の買い物（ストリーム）を繰り返すと、この還元トリガーは引かれません。
                    </p>
                    <p>
                        これをエンジニア的に解決する手法が、**「バッチ処理（まとめ買い）」**です。欲しいものをその都度ポチるのではなく、一度「カート」という名のキュー（Queue）にスタックし、5,000円を超えた瞬間にジョブを実行する。この制御フローが重要になります。
                    </p>

                    <h2 id="section2" className="flex items-center gap-3 !text-2xl tracking-tight border-l-4 border-teal-500 pl-4">
                        <Database className="w-6 h-6 text-teal-500" /> 2. 欲しいものリストを「Queue」として使う
                    </h2>
                    <p>
                        私はAmazonの「あとで買う」や「ほしい物リスト」を、単なるブックマークではなく**「未処理のタスクリスト」**として定義しています。
                    </p>
                    
                    <div className="my-10 p-8 bg-slate-900/50 border border-emerald-500/20 rounded-3xl font-mono relative overflow-hidden group shadow-2xl">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Terminal className="w-16 h-16 text-emerald-400" />
                        </div>
                        <div className="flex items-center gap-2 text-emerald-400 mb-6 uppercase tracking-[0.2em] text-[11px] font-bold">
                            <Zap className="w-4 h-4" /> purchase_lifecycle.go
                        </div>
                        <div className="space-y-6">
                            <div className="flex gap-4 items-start border-b border-white/5 pb-4">
                                <ArrowDownToLine className="w-5 h-5 text-emerald-500 mt-1" />
                                <div>
                                    <span className="text-white font-bold block mb-1 underline underline-offset-4">Enqueue (都度)</span>
                                    <span className="text-slate-400 text-xs italic leading-relaxed text-sm">日用品や消耗品を「あとで買う」へスタック。この時点では決済（IO）を発生させない。</span>
                                </div>
                            </div>
                            <div className="flex gap-4 items-start border-b border-white/5 pb-4">
                                <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-1" />
                                <div>
                                    <span className="text-white font-bold block mb-1 underline underline-offset-4">Validation (監視)</span>
                                    <span className="text-slate-400 text-xs italic leading-relaxed text-sm">リストの合計金額が5,000円を超えているか定期的にチェック（Health Check）。</span>
                                </div>
                            </div>
                            <div className="flex gap-4 items-start">
                                <Zap className="w-5 h-5 text-emerald-500 mt-1 animate-pulse" />
                                <div>
                                    <span className="text-white font-bold block mb-1 underline underline-offset-4">Execution (バッチ実行)</span>
                                    <span className="text-slate-400 text-xs italic leading-relaxed text-sm">d曜日の金・土に「一括購入」。還元率が最大化される「最高効率のジョブ」を完遂。</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <h2 id="section3" className="flex items-center gap-3 !text-2xl tracking-tight border-l-4 border-emerald-500 pl-4">
                        <Package className="w-6 h-6 text-emerald-500" /> 3. タイムセール祭りという「ブースト」
                    </h2>
                    <p>
                        このバッチ処理のパフォーマンスをさらに高めるのが、Amazonで定期開催される「ポイントアップキャンペーン」です。
                    </p>
                    <p>
                        この期間中、d払いのベース還元に加え、Amazon側でも+1%〜以上の加算が行われます。これらを**「同期（連携）」**させることで、普段は還元率の低い日用品であっても、実質10%近いリソース回収（還元）が可能になります。
                    </p>

                    <div className="my-12 p-8 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/20 rounded-3xl relative overflow-hidden group">
                        <Layers className="absolute -right-4 -bottom-4 w-32 h-32 text-emerald-500/10 group-hover:scale-110 transition-transform duration-700" />
                        <h4 className="flex items-center gap-3 text-emerald-400 font-bold mt-0 mb-6 uppercase text-xs tracking-[0.3em] font-mono leading-none">
                            <Layers className="w-4 h-4" /> Batch Optimization Logic
                        </h4>
                        <p className="text-lg m-0 leading-relaxed italic text-slate-200 font-medium">
                            「衝動的な都度買いは、無秩序なネットワークパケットと同じだ。トラフィックを束ね、帯域（還元）を最大限に確保するタイミングでバースト転送を行うこと。それが運用の美学である。」
                        </p>
                    </div>

                    <h2 id="section4" className="!text-2xl text-white">まとめ：キューを溜めて、一気に流す</h2>
                    <p>
                        欲しいと思った瞬間に買わない。この一瞬の「待機（Latency）」が、結果として家計というシステムの「スループット（実質還元）」を劇的に向上させます。
                    </p>
                    <p>
                        さて、次回はこの「BIC-SAVING」シリーズの完結編。これまで構築してきた「給油（物理レイヤー）」から「Amazon（プラットフォーム連携）」までの全スタックを統合し、**「家計というシステムのダッシュボード化」**について語ります。
                    </p>
                </div>

                {/* 🧭 フッターナビゲーション */}
                <footer className="mt-24 pt-12 border-t border-white/5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono">
                        <Link 
                            href="/series/saving-stack/vol-4" 
                            className="group p-8 rounded-3xl border border-slate-800 bg-white/[0.02] hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all text-left relative overflow-hidden shadow-xl"
                        >
                            <span className="text-[10px] text-emerald-500 font-bold block mb-4 tracking-[0.2em]">PREV_STP / VOL_04</span>
                            <span className="text-white font-bold group-hover:text-emerald-400 transition-colors text-sm leading-tight block font-sans">
                                第4回：外部API統合<br/>（Amazon × ドコモ連携）
                            </span>
                        </Link>
                        
                        <Link 
                            href="/series/saving-stack/vol-6" 
                            className="group p-8 rounded-3xl border border-slate-800 bg-white/[0.02] hover:border-blue-500/50 hover:bg-blue-500/5 transition-all text-right relative overflow-hidden shadow-xl"
                        >
                            <span className="text-[10px] text-blue-500 font-bold block mb-4 tracking-[0.2em]">FINAL_STP / VOL_06</span>
                            <div className="flex items-center justify-end gap-4">
                                <span className="text-white font-bold group-hover:text-blue-400 transition-colors text-sm leading-tight block font-sans text-right">
                                    第6回：Netflixを「爆上げセレクション」へ
                                </span>
                                <ArrowRight className="w-5 h-5 text-slate-600 group-hover:text-blue-500 transition-all group-hover:translate-x-2" />
                            </div>
                        </Link>
                    </div>

                    <div className="mt-16 flex items-center justify-center gap-4">
                        <div className="h-px w-12 bg-white/5"></div>
                        <Link href="/series/saving-stack" className="text-[10px] font-mono text-slate-500 hover:text-white transition-colors tracking-widest uppercase font-bold group flex items-center gap-2">
                            Return to Series Index
                        </Link>
                        <div className="h-px w-12 bg-white/5"></div>
                    </div>
                </footer>
            </article>
        </div>
    );
}