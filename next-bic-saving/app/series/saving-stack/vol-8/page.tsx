/* eslint-disable react/no-unescaped-entities */
'use client';

/**
 * =====================================================================
 * 🛰️ SAVING_STACK_VOL_8_V1.0 (Physical UI & Daily Routines)
 * 🛡️ Project: Bic-Saving / Saving Stack
 * 💎 Purpose: 実店舗での「7%還元」をルーチンにハードコーディングする
 * =====================================================================
 */

import React from 'react';
import Link from 'next/link';
import { 
    List, 
    Calendar, 
    User, 
    ArrowRight,
    Smartphone,
    CreditCard,
    Store,
    Coffee,
    CheckCircle,
    Zap,
    MoveRight,
    MapPin
} from 'lucide-react';

export default function SavingStackVol8() {
    return (
        <div className="min-h-screen bg-[#0a0a0c] text-slate-300 py-12 lg:py-20 px-6 font-sans selection:bg-blue-600/30">
            <article className="max-w-3xl mx-auto">
                
                {/* 🔖 ナビゲーション */}
                <nav className="flex items-center justify-between text-xs font-mono text-slate-500 mb-12 border-b border-white/5 pb-4">
                    <Link href="/series/saving-stack" className="hover:text-blue-400 flex items-center gap-1 transition-colors font-bold text-blue-500/80 group">
                        <List className="w-3 h-3 group-hover:rotate-90 transition-transform" /> SERIES_INDEX
                    </Link>
                    <span className="text-blue-500/50 uppercase tracking-[0.2em] font-bold font-mono">Saving_Stack // Vol.08</span>
                </nav>

                {/* 🚀 記事ヘッダー */}
                <header className="mb-16">
                    <div className="inline-block px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-[10px] font-mono mb-6 tracking-widest uppercase animate-pulse">
                        Physical Interface Layer
                    </div>
                    <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-10 leading-[1.1] tracking-tight">
                        日常の決済を<br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-500">
                            「7%還元」へ固定せよ
                        </span>
                    </h1>

                    <div className="flex flex-wrap gap-8 text-[11px] font-mono text-slate-500 border-l border-white/10 pl-6">
                        <div className="flex flex-col gap-1">
                            <span className="text-blue-500/50 block">DATE</span>
                            <div className="flex items-center gap-2 text-slate-300"><Calendar className="w-3.5 h-3.5" /> 2026.05.08</div>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-blue-500/50 block">INTERFACE</span>
                            <div className="flex items-center gap-2 text-slate-300 uppercase tracking-wider italic font-bold">Touch_Payment</div>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-blue-500/50 block">AUTHOR</span>
                            <div className="flex items-center gap-2 text-slate-300 italic"><User className="w-3.5 h-3.5" /> NABE</div>
                        </div>
                    </div>
                </header>

                <div className="prose prose-invert prose-blue max-w-none 
                    prose-headings:text-white prose-headings:font-bold
                    prose-p:leading-relaxed prose-p:text-slate-400 prose-p:text-lg
                    prose-strong:text-blue-400 prose-code:text-blue-300 prose-code:bg-blue-500/10 prose-code:px-1 prose-code:rounded">
                    
                    <div className="relative mb-16 py-10 px-8 bg-blue-500/[0.02] border-y border-white/5 overflow-hidden">
                        <Smartphone className="absolute -right-4 -top-4 w-32 h-32 text-blue-500/5 rotate-12" />
                        <p className="relative z-10 text-xl md:text-2xl leading-relaxed text-slate-300 italic font-medium m-0 text-center">
                            "コンビニやカフェでの支払いは、最も頻度の高いトランザクションだ。<br className="hidden md:block"/>
                            対象店舗をホワイトリスト化し、<br className="hidden md:block"/>
                            スマホタッチ決済をデフォルトに設定せよ。"
                        </p>
                    </div>

                    <h2 id="section1" className="flex items-center gap-3 !text-2xl tracking-tight border-l-4 border-blue-500 pl-4">
                        <CreditCard className="w-6 h-6 text-blue-500" /> 1. 「7%」のバリデーション
                    </h2>
                    <p>
                        三井住友カード（NL等）の最大の特徴は、対象店舗での**「スマホのVisa/Mastercardタッチ決済」**による7%還元です。ここで重要なのは「物理カード」ではなく「スマホ」で支払うこと。物理カードだと還元率が落ちる、という仕様は**「厳格な入力バリデーション」**と捉えるべきです。
                    </p>

                    <h2 id="section2" className="flex items-center gap-3 !text-2xl tracking-tight border-l-4 border-cyan-500 pl-4">
                        <Store className="w-6 h-6 text-cyan-500" /> 2. 対象店舗を「ホワイトリスト」化する
                    </h2>
                    <p>
                        「どこで使えるか？」をその都度考えるのは脳のリソース（CPU）を浪費します。主要な対象店舗を生活圏のホワイトリストとして頭にロードしておきましょう。
                    </p>
                    
                    <div className="my-10 p-8 bg-slate-900/50 border border-blue-500/20 rounded-3xl font-mono relative overflow-hidden group shadow-2xl">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <MapPin className="w-16 h-16 text-blue-400" />
                        </div>
                        <div className="flex items-center gap-2 text-blue-400 mb-6 uppercase tracking-[0.2em] text-[11px] font-bold">
                            <Zap className="w-4 h-4" /> target_store_whitelist.yaml
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <span className="text-white font-bold border-b border-white/10 block pb-1">Convenience</span>
                                <ul className="list-none p-0 m-0 text-sm text-slate-400">
                                    <li className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-emerald-500" /> セブン-イレブン</li>
                                    <li className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-emerald-500" /> ローソン</li>
                                    <li className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-emerald-500" /> セイコーマート</li>
                                </ul>
                            </div>
                            <div className="space-y-2">
                                <span className="text-white font-bold border-b border-white/10 block pb-1">Food & Cafe</span>
                                <ul className="list-none p-0 m-0 text-sm text-slate-400">
                                    <li className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-emerald-500" /> マクドナルド</li>
                                    <li className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-emerald-500" /> サイゼリヤ</li>
                                    <li className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-emerald-500" /> ドトールコーヒー</li>
                                    <li className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-emerald-500" /> すき家 / はま寿司</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <h2 id="section3" className="flex items-center gap-3 !text-2xl tracking-tight border-l-4 border-emerald-500 pl-4">
                        <Coffee className="w-6 h-6 text-emerald-500" /> 3. 習慣への「ハードコーディング」
                    </h2>
                    <p>
                        「コンビニ＝三井住友カード」という条件分岐（If-Else）を、反射レベルまで最適化します。
                        さらにVポイントはdポイント等へ等価交換が可能。Vol.7で解説した「ドコモ経済圏」へ合流（マージ）させることで、オフラインで稼いだ還元をサブスクの支払いに充当する、という**「還元の循環（ループ）」**が完成します。
                    </p>

                    <div className="my-12 p-8 bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent border border-blue-500/20 rounded-3xl relative overflow-hidden group">
                        <Smartphone className="absolute -right-4 -bottom-4 w-32 h-32 text-blue-500/10 group-hover:scale-110 transition-transform duration-700" />
                        <h4 className="flex items-center gap-3 text-blue-400 font-bold mt-0 mb-6 uppercase text-xs tracking-[0.3em] font-mono leading-none">
                            <Zap className="w-4 h-4" /> Physical Transaction Tip
                        </h4>
                        <p className="text-sm m-0 leading-relaxed italic text-slate-300 font-medium">
                            「レジで『カードで』と言うと物理差し込みを案内される場合がある。一貫して『クレジットのタッチで』、あるいはApple Pay/Google Payを宣言すること。決済プロトコルの不一致（Mismatch）を防ぐことが重要だ。」
                        </p>
                    </div>

                    <h2 id="section4" className="!text-2xl text-white">まとめ：フロントエンドを制する</h2>
                    <p>
                        生活のフロントエンド（実店舗）での高還元を固定することで、システムの末端まで最適化が浸透します。
                    </p>
                    <p>
                        次回は、これまで貯めてきた「ポイント」という名の非正規データを、SBI証券などを通じて**「資産」という名の本番DBへデプロイ（投資）する出口戦略**について語ります。
                    </p>
                </div>

                {/* 🧭 フッターナビゲーション */}
                <footer className="mt-24 pt-12 border-t border-white/5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono">
                        <Link 
                            href="/series/saving-stack/vol-7" 
                            className="group p-8 rounded-3xl border border-slate-800 bg-white/[0.02] hover:border-blue-500/50 hover:bg-blue-500/5 transition-all text-left relative overflow-hidden shadow-xl"
                        >
                            <span className="text-[10px] text-blue-500 font-bold block mb-4 tracking-[0.2em]">PREV_STP / VOL_07</span>
                            <span className="text-white font-bold group-hover:text-blue-400 transition-colors text-sm leading-tight block font-sans">
                                第7回：エンタメ代の最適化：<br/>YouTubeやDAZNのパッチ当て
                            </span>
                        </Link>
                        
                        <Link 
                            href="/series/saving-stack/vol-9" 
                            className="group p-8 rounded-3xl border border-slate-800 bg-white/[0.02] hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all text-right relative overflow-hidden shadow-xl"
                        >
                            <span className="text-[10px] text-emerald-500 font-bold block mb-4 tracking-[0.2em]">NEXT_STP / VOL_09</span>
                            <div className="flex items-center justify-end gap-4">
                                <span className="text-white font-bold group-hover:text-emerald-400 transition-colors text-sm leading-tight block font-sans text-right">
                                    第9回：ポイントの出口戦略：<br/>資産へのデプロイ
                                </span>
                                <ArrowRight className="w-5 h-5 text-slate-600 group-hover:text-emerald-500 transition-all group-hover:translate-x-2" />
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