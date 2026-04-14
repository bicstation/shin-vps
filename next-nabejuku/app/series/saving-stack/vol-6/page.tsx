/* eslint-disable react/no-unescaped-entities */
'use client';

/**
 * =====================================================================
 * 🛰️ SAVING_STACK_VOL_6_V1.0 (Service Migration & Subscription)
 * 🛡️ Project: Bic-Saving / Saving Stack
 * 💎 Purpose: Netflixアカウントのドコモ移送（マイグレーション）による還元最大化
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
    RefreshCw,
    Tv,
    ShieldCheck,
    Cpu,
    ArrowUpRight,
    Info,
    MoveRight
} from 'lucide-react';

export default function SavingStackVol6() {
    return (
        <div className="min-h-screen bg-[#0a0a0c] text-slate-300 py-12 lg:py-20 px-6 font-sans selection:bg-red-500/30">
            <article className="max-w-3xl mx-auto">
                
                {/* 🔖 ナビゲーション */}
                <nav className="flex items-center justify-between text-xs font-mono text-slate-500 mb-12 border-b border-white/5 pb-4">
                    <Link href="/series/saving-stack" className="hover:text-red-400 flex items-center gap-1 transition-colors font-bold text-red-500/80 group">
                        <List className="w-3 h-3 group-hover:rotate-90 transition-transform" /> SERIES_INDEX
                    </Link>
                    <span className="text-red-500/50 uppercase tracking-[0.2em] font-bold font-mono">Saving_Stack // Vol.06</span>
                </nav>

                {/* 🚀 記事ヘッダー */}
                <header className="mb-16">
                    <div className="inline-block px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-mono mb-6 tracking-widest uppercase animate-pulse">
                        Service Migration Layer
                    </div>
                    <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-10 leading-[1.1] tracking-tight">
                        Netflixを「爆上げセレクション」へ<br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-400 to-red-600">
                            マイグレーションせよ
                        </span>
                    </h1>

                    <div className="flex flex-wrap gap-8 text-[11px] font-mono text-slate-500 border-l border-white/10 pl-6">
                        <div className="flex flex-col gap-1">
                            <span className="text-red-500/50 block">DATE</span>
                            <div className="flex items-center gap-2 text-slate-300"><Calendar className="w-3.5 h-3.5" /> 2026.04.28</div>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-red-500/50 block">TASK</span>
                            <div className="flex items-center gap-2 text-slate-300 uppercase tracking-wider italic font-bold">Migration_01</div>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-red-500/50 block">AUTHOR</span>
                            <div className="flex items-center gap-2 text-slate-300 italic"><User className="w-3.5 h-3.5" /> NABE</div>
                        </div>
                    </div>
                </header>

                <div className="prose prose-invert prose-red max-w-none 
                    prose-headings:text-white prose-headings:font-bold
                    prose-p:leading-relaxed prose-p:text-slate-400 prose-p:text-lg
                    prose-strong:text-red-400 prose-code:text-red-300 prose-code:bg-red-500/10 prose-code:px-1 prose-code:rounded">
                    
                    <div className="relative mb-16 py-10 px-8 bg-red-500/[0.02] border-y border-white/5 overflow-hidden">
                        <Tv className="absolute -right-4 -top-4 w-32 h-32 text-red-500/5 rotate-12" />
                        <p className="relative z-10 text-xl md:text-2xl leading-relaxed text-slate-300 italic font-medium m-0 text-center">
                            "サブスクリプションは、一度定義すれば永続的にリソースを削り続ける。<br className="hidden md:block"/>
                            決済ルートを移送（マイグレーション）し、<br className="hidden md:block"/>
                            還元のバックドアを確保せよ。"
                        </p>
                    </div>

                    <h2 id="section1" className="flex items-center gap-3 !text-2xl tracking-tight border-l-4 border-red-500 pl-4">
                        <RefreshCw className="w-6 h-6 text-red-500" /> 1. サブスク決済の「再定義」
                    </h2>
                    <p>
                        Netflixの月額料金を、ただ「クレジットカード」で支払っていませんか？ それはエンジニアリング的に見れば、**最適化の余地を放置した「未整理のコード」**と同じです。
                    </p>
                    <p>
                        現在、ドコモが提供する「爆上げセレクション」という決済ハブを経由させることで、Netflixの視聴プランはそのままで、**最大20%（dポイント）の還元**を受けることが可能になります。これは単なる割引ではなく、サービスの「提供ルート」を書き換えるマイグレーション作業です。
                    </p>

                    <h2 id="section2" className="flex items-center gap-3 !text-2xl tracking-tight border-l-4 border-orange-500 pl-4">
                        <Cpu className="w-6 h-6 text-orange-500" /> 2. 移行プロトコル：アカウントの移送
                    </h2>
                    <p>
                        すでにNetflixを利用している場合でも、視聴履歴やプロフィールなどの「データ（State）」を保持したまま移行が可能です。
                    </p>
                    
                    <div className="my-10 p-8 bg-slate-900/50 border border-red-500/20 rounded-3xl font-mono relative overflow-hidden group shadow-2xl">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <RefreshCw className="w-16 h-16 text-red-400" />
                        </div>
                        <div className="flex items-center gap-2 text-red-400 mb-6 uppercase tracking-[0.2em] text-[11px] font-bold">
                            <Info className="w-4 h-4" /> migration_steps.log
                        </div>
                        <div className="space-y-4 text-sm leading-relaxed">
                            <div className="flex gap-4 p-3 hover:bg-white/5 rounded-xl transition-colors items-center">
                                <span className="text-red-500 font-bold w-12">01</span>
                                <span className="text-slate-300">現在のNetflix支払いを一度`STOP`（解約手続き）。</span>
                            </div>
                            <div className="flex gap-4 p-3 hover:bg-white/5 rounded-xl transition-colors items-center">
                                <span className="text-red-500 font-bold w-12">02</span>
                                <span className="text-slate-300">ドコモ経由でNetflixの`SUBSCRIPTION_REQUEST`を発行。</span>
                            </div>
                            <div className="flex gap-4 p-3 hover:bg-white/5 rounded-xl transition-colors items-center">
                                <span className="text-red-500 font-bold w-12">03</span>
                                <span className="text-slate-300">Netflixから届く「アカウント連携メール」を承認。</span>
                            </div>
                            <div className="flex gap-4 p-3 hover:bg-white/5 rounded-xl transition-colors items-center">
                                <span className="text-red-500 font-bold w-12">04</span>
                                <span className="text-slate-300">既存のNetflix IDでログインし、`REBIND`（紐付け）を完了。</span>
                            </div>
                        </div>
                    </div>

                    <h2 id="section3" className="flex items-center gap-3 !text-2xl tracking-tight border-l-4 border-red-500 pl-4">
                        <ArrowUpRight className="w-6 h-6 text-red-500" /> 3. 20%還元の「ブースト」要件
                    </h2>
                    <p>
                        このスタックの真価を発揮するには、ドコモ回線の契約プラン（ex: eximo / ahamo）が条件となります。
                    </p>
                    <ul>
                        <li><strong>Standard/Premiumプラン：</strong> 最大20%還元</li>
                        <li><strong>利用環境：</strong> 既存アカウントのデータをそのまま継承</li>
                        <li><strong>決済統合：</strong> 携帯料金と一括（電話料金合算）に統合され、管理が容易に</li>
                    </ul>
                    <p>
                        Netflix Premium（月額1,980円）であれば、毎月**約400ポイント**がバックされます。これは年間で**4,800円分**のリソース回収に相当し、サブスク1ヶ月分以上の「浮き」を自動生成するシステムへと進化します。
                    </p>

                    <div className="my-12 p-8 bg-gradient-to-br from-red-500/10 via-red-500/5 to-transparent border border-red-500/20 rounded-3xl relative overflow-hidden group">
                        <ShieldCheck className="absolute -right-4 -bottom-4 w-32 h-32 text-red-500/10 group-hover:scale-110 transition-transform duration-700" />
                        <h4 className="flex items-center gap-3 text-red-400 font-bold mt-0 mb-6 uppercase text-xs tracking-[0.3em] font-mono leading-none">
                            <ShieldCheck className="w-4 h-4" /> Migration Risk Check
                        </h4>
                        <p className="text-sm m-0 leading-relaxed italic text-slate-300 font-medium">
                            「既存の視聴データはメールアドレスをキーに紐付けられるため消失しない。ただし、決済ルートの二重発生を避けるため、既存のNetflix直接契約の解約（課金停止）を確実に先行させること。」
                        </p>
                    </div>

                    <h2 id="section4" className="!text-2xl text-white">まとめ：ランニングコストの最適化</h2>
                    <p>
                        Netflixのような「固定費」こそ、一度のマイグレーションで得られる長期的ベネフィットは絶大です。
                    </p>
                    <p>
                        次回は、この「爆上げセレクション」をさらに横断的に適用し、**YouTube PremiumやDAZNといったエンタメ全般のサブスク統合戦略**について解説します。
                    </p>
                </div>

                {/* 🧭 フッターナビゲーション */}
                <footer className="mt-24 pt-12 border-t border-white/5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono">
                        <Link 
                            href="/series/saving-stack/vol-5" 
                            className="group p-8 rounded-3xl border border-slate-800 bg-white/[0.02] hover:border-red-500/50 hover:bg-red-500/5 transition-all text-left relative overflow-hidden shadow-xl"
                        >
                            <span className="text-[10px] text-red-500 font-bold block mb-4 tracking-[0.2em]">PREV_STP / VOL_05</span>
                            <span className="text-white font-bold group-hover:text-red-400 transition-colors text-sm leading-tight block font-sans">
                                第5回：Amazonの「バッチ処理」で<br/>還元率を最大化せよ
                            </span>
                        </Link>
                        
                        <Link 
                            href="/series/saving-stack/vol-7" 
                            className="group p-8 rounded-3xl border border-slate-800 bg-white/[0.02] hover:border-blue-500/50 hover:bg-blue-500/5 transition-all text-right relative overflow-hidden shadow-xl"
                        >
                            <span className="text-[10px] text-blue-500 font-bold block mb-4 tracking-[0.2em]">NEXT_STP / VOL_07</span>
                            <div className="flex items-center justify-end gap-4">
                                <span className="text-white font-bold group-hover:text-blue-400 transition-colors text-sm leading-tight block font-sans text-right">
                                    第7回：エンタメ代の最適化：<br/>YouTubeやDAZNのパッチ当て
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