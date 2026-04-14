/* eslint-disable react/no-unescaped-entities */
'use client';

/**
 * =====================================================================
 * 🛰️ SAVING_STACK_VOL_4_V1.1 (Platform Integration & Bridge)
 * 🛡️ Project: Bic-Saving / Saving Stack
 * 💎 Purpose: Amazonとd払いの「システム統合」による還元の二重取り
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
    Link2,
    Zap,
    Settings,
    ShieldCheck,
    Box,
    ExternalLink,
    Workflow
} from 'lucide-react';

export default function SavingStackVol4() {
    return (
        <div className="min-h-screen bg-[#0a0a0c] text-slate-300 py-12 lg:py-20 px-6 font-sans selection:bg-blue-500/30">
            <article className="max-w-3xl mx-auto">
                
                {/* 🔖 ナビゲーション */}
                <nav className="flex items-center justify-between text-xs font-mono text-slate-500 mb-12 border-b border-white/5 pb-4">
                    <Link href="/series/saving-stack" className="hover:text-blue-400 flex items-center gap-1 transition-colors font-bold text-blue-500/80 group">
                        <List className="w-3 h-3 group-hover:rotate-90 transition-transform" /> SERIES_INDEX
                    </Link>
                    <span className="text-blue-500/50 uppercase tracking-[0.2em] font-bold font-mono">Saving_Stack // Vol.04</span>
                </nav>

                {/* 🚀 記事ヘッダー */}
                <header className="mb-16">
                    <div className="inline-block px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-[10px] font-mono mb-6 tracking-widest uppercase animate-pulse">
                        Platform Integration Layer
                    </div>
                    <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-10 leading-[1.1] tracking-tight">
                        Amazon × ドコモ提携を<br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500">
                            「d払い」でシステム統合する
                        </span>
                    </h1>

                    <div className="flex flex-wrap gap-8 text-[11px] font-mono text-slate-500 border-l border-white/10 pl-6">
                        <div className="flex flex-col gap-1">
                            <span className="text-blue-500/50 block">DATE</span>
                            <div className="flex items-center gap-2 text-slate-300"><Calendar className="w-3.5 h-3.5" /> 2026.04.21</div>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-blue-500/50 block">STATUS</span>
                            <div className="flex items-center gap-2 text-slate-300 uppercase tracking-wider">Production_Ready</div>
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
                        <Workflow className="absolute -right-4 -top-4 w-32 h-32 text-blue-500/5 -rotate-12" />
                        <p className="relative z-10 text-xl md:text-2xl leading-relaxed text-slate-300 italic font-medium m-0 text-center">
                            "異なるプラットフォーム間の『仕様変更』は絶好の機会だ。<br className="hidden md:block"/>
                            AmazonとドコモのAPI（連携）を正しく叩き、<br className="hidden md:block"/>
                            還元のブリッジを架けよ。"
                        </p>
                    </div>

                    <h2 id="section1" className="flex items-center gap-3 !text-2xl tracking-tight border-l-4 border-blue-500 pl-4">
                        <Link2 className="w-6 h-6 text-blue-500" /> 1. Amazonが「ドコモ経済圏」に統合された日
                    </h2>
                    <p>
                        2024年のAmazonとドコモの提携。これは単なるポイントキャンペーンではありません。エンジニアの視点で見れば、**「Amazonという世界最大のフロントエンド」と「ドコモという国内最強の決済・ポイントバックエンド」が公式にバインドされた**ことを意味します。
                    </p>
                    <p>
                        これまでAmazonでの買い物は、自社カード以外には閉じられた仕様でした。しかし現在は「d払い」という共通プロトコルを通すことで、一気に汎用的な還元ルートをデプロイできるようになっています。
                    </p>

                    <h2 id="section2" className="flex items-center gap-3 !text-2xl tracking-tight border-l-4 border-indigo-500 pl-4">
                        <Settings className="w-6 h-6 text-indigo-500" /> 2. 設定（Config）：アカウントのバインド
                    </h2>
                    <p>
                        このスタックを有効化するには、まず両プラットフォームのアカウントを正しく接続（アカウント・バイディング）する必要があります。一度設定すれば、あとはバックグラウンドで自動的に処理されます。
                    </p>
                    
                    <div className="my-10 p-8 bg-slate-900/50 border border-blue-500/20 rounded-3xl font-mono relative overflow-hidden group shadow-2xl">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Box className="w-16 h-16 text-blue-400" />
                        </div>
                        <div className="flex items-center gap-2 text-blue-400 mb-6 uppercase tracking-[0.2em] text-[11px] font-bold">
                            <Settings className="w-4 h-4 animate-spin-slow" /> setup_integration.yaml
                        </div>
                        <div className="space-y-4 text-sm leading-relaxed">
                            <div className="flex gap-4 p-3 hover:bg-white/5 rounded-xl transition-colors">
                                <span className="text-blue-500 font-bold">STEP_01</span>
                                <span className="text-slate-300">Amazon公式サイトの「dポイント」特設ページで`AUTH_REQUEST`を開始。</span>
                            </div>
                            <div className="flex gap-4 p-3 hover:bg-white/5 rounded-xl transition-colors">
                                <span className="text-blue-500 font-bold">STEP_02</span>
                                <span className="text-slate-300">dアカウントでSSO認証を行い、Amazonとの`REWARD_API`連携を承認。</span>
                            </div>
                            <div className="flex gap-4 p-3 hover:bg-white/5 rounded-xl transition-colors">
                                <span className="text-blue-500 font-bold">STEP_03</span>
                                <span className="text-slate-300">決済手段に「d払い（電話料金合算）」を追加。これをデフォルトの`PAYMENT_METHOD`に設定。</span>
                            </div>
                            <div className="flex gap-4 p-3 hover:bg-white/5 rounded-xl transition-colors">
                                <span className="text-blue-500 font-bold">STEP_04</span>
                                <span className="text-slate-300">プライム特典がトリガーされる「1回5,000円以上」の買い物を実行。</span>
                            </div>
                        </div>
                    </div>

                    <h2 id="section3" className="flex items-center gap-3 !text-2xl tracking-tight border-l-4 border-blue-500 pl-4">
                        <Zap className="w-6 h-6 text-blue-500" /> 3. 還元率の「二重取り」アルゴリズム
                    </h2>
                    <p>
                        この設定の真価は、Amazon側のポイントとd払い側のポイントが**並列して発生する（並行処理される）**点にあります。
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-10 font-mono text-[13px]">
                        <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl border-l-4 border-l-blue-500 shadow-lg group hover:bg-blue-500/5 transition-all">
                            <div className="text-blue-500 font-bold mb-2 uppercase tracking-widest text-[10px]">Primary_Return</div>
                            <div className="text-white font-bold mb-2">Amazon Point</div>
                            <p className="text-slate-500 m-0 text-xs">商品固有の還元率（通常通り付与）。フロントエンドでの値引きに相当。</p>
                        </div>
                        <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl border-l-4 border-l-indigo-500 shadow-lg group hover:bg-indigo-500/5 transition-all">
                            <div className="text-indigo-500 font-bold mb-2 uppercase tracking-widest text-[10px]">Secondary_Return</div>
                            <div className="text-white font-bold mb-2">d-Point (Network)</div>
                            <p className="text-slate-500 m-0 text-xs">5,000円以上の決済で1.0%還元。プラットフォームを跨いだバックエンド還元。</p>
                        </div>
                    </div>

                    <p>
                        さらに、毎週金・土曜日の「d曜日」キャンペーンをブースト（+2.0%〜）として組み合わせれば、Amazonでの買い物が**実質4〜5%以上の高還元**へと自動アップデートされます。これは単一のクレジットカード（1.0%還元）を叩くよりも、圧倒的にリソース効率の高い「最適化されたパイプライン」です。
                    </p>

                    <div className="my-12 p-8 bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent border border-blue-500/20 rounded-3xl relative overflow-hidden group">
                        <ShieldCheck className="absolute -right-4 -bottom-4 w-32 h-32 text-blue-500/10 group-hover:scale-110 transition-transform duration-700" />
                        <h4 className="flex items-center gap-3 text-blue-400 font-bold mt-0 mb-6 uppercase text-xs tracking-[0.3em] font-mono leading-none">
                            <ShieldCheck className="w-4 h-4" /> Security & Policy Check
                        </h4>
                        <p className="text-sm m-0 leading-relaxed italic text-slate-300 font-medium">
                            「Amazonでd払いを利用するには、ドコモ回線の契約（電話料金合算払い）が必須だ。これは強力な物理的認証（SIM認証）として機能し、セキュリティを担保しつつ、決済を一本のストリームに統合できるメリットがある。」
                        </p>
                    </div>

                    <h2 id="section4" className="!text-2xl">まとめ：エコシステムを越境せよ</h2>
                    <p>
                        「Amazonで買うからAmazonカード」という固定観念を捨て、**「プラットフォームの隙間（連携仕様）」**を突く。これこそが、エンジニア的な節約スタック「BIC-SAVING」の真骨頂です。
                    </p>
                    <p>
                        しかし、ここで一つの課題が残ります。「5,000円以上の同時決済」というトリガーをどう効率的に引くか。
                    </p>
                    <p>
                        次回は、その「決済タイミングの制御」について。**バッチ処理的なまとめ買い管理術**で、還元率を最大化する戦略を解説します。
                    </p>
                </div>

                {/* 🧭 フッターナビゲーション */}
                <footer className="mt-24 pt-12 border-t border-white/5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono">
                        <Link 
                            href="/series/saving-stack/vol-3" 
                            className="group p-8 rounded-3xl border border-slate-800 bg-white/[0.02] hover:border-blue-500/50 hover:bg-blue-500/5 transition-all text-left relative overflow-hidden shadow-xl"
                        >
                            <span className="text-[10px] text-blue-500 font-bold block mb-4 tracking-[0.2em]">PREV_STP / VOL_03</span>
                            <span className="text-white font-bold group-hover:text-blue-400 transition-colors text-sm leading-tight block font-sans">
                                第3回：給油決済の「バックエンド」に<br/>三井住友カードを選ぶ理由
                            </span>
                        </Link>
                        
                        <Link 
                            href="/series/saving-stack/vol-5" 
                            className="group p-8 rounded-3xl border border-slate-800 bg-white/[0.02] hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all text-right relative overflow-hidden shadow-xl"
                        >
                            <span className="text-[10px] text-emerald-500 font-bold block mb-4 tracking-[0.2em]">NEXT_STP / VOL_05</span>
                            <div className="flex items-center justify-end gap-4">
                                <span className="text-white font-bold group-hover:text-emerald-400 transition-colors text-sm leading-tight block font-sans">
                                    第5回：Amazonの「バッチ処理」で<br/>ポイント還元を最大化する
                                </span>
                                <ArrowRight className="w-5 h-5 text-slate-600 group-hover:text-emerald-500 transition-all group-hover:translate-x-2" />
                            </div>
                        </Link>
                    </div>

                    <div className="mt-16 flex items-center justify-center gap-4">
                        <div className="h-px w-12 bg-white/5"></div>
                        <Link href="/series/saving-stack" className="text-[10px] font-mono text-slate-500 hover:text-white transition-colors tracking-widest uppercase font-bold group flex items-center gap-2">
                            Return to Series Index <ExternalLink className="w-3 h-3 group-hover:scale-110 transition-transform" />
                        </Link>
                        <div className="h-px w-12 bg-white/5"></div>
                    </div>
                </footer>
            </article>
        </div>
    );
}