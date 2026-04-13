/* eslint-disable react/no-unescaped-entities */
'use client';

/**
 * =====================================================================
 * 🛰️ SAVING_STACK_VOL_7_V1.1 (Runtime Exception Patch)
 * 🛡️ Project: Bic-Saving / Saving Stack
 * 🛠️ Fix: Lucide-react undefined element crash
 * =====================================================================
 */

import React from 'react';
import Link from 'next/link';
// 安全性の高い標準的なアイコン名に統一
import { 
    List, 
    Calendar, 
    Clock, 
    User, 
    ArrowRight,
    Play,          // Youtubeの代替（より確実）
    ShieldCheck,
    GitMerge,
    Box,
    Plus,
    Activity,
    Search
} from 'lucide-react';

export default function SavingStackVol7() {
    return (
        <div className="min-h-screen bg-[#0a0a0c] text-slate-300 py-12 lg:py-20 px-6 font-sans selection:bg-red-600/30">
            <article className="max-w-3xl mx-auto">
                
                {/* 🔖 ナビゲーション */}
                <nav className="flex items-center justify-between text-xs font-mono text-slate-500 mb-12 border-b border-white/5 pb-4">
                    <Link href="/series/saving-stack" className="hover:text-red-500 flex items-center gap-1 transition-colors font-bold text-red-500/80 group">
                        <List className="w-3 h-3 group-hover:rotate-90 transition-transform" /> SERIES_INDEX
                    </Link>
                    <span className="text-red-500/50 uppercase tracking-[0.2em] font-bold font-mono">Saving_Stack // Vol.07</span>
                </nav>

                {/* 🚀 記事ヘッダー */}
                <header className="mb-16">
                    <div className="inline-block px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-mono mb-6 tracking-widest uppercase animate-pulse">
                        Service Patching Layer
                    </div>
                    <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-10 leading-[1.1] tracking-tight">
                        YouTube / DAZNの<br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-white to-red-600">
                            「サブスク・パッチ」運用術
                        </span>
                    </h1>

                    <div className="flex flex-wrap gap-8 text-[11px] font-mono text-slate-500 border-l border-white/10 pl-6">
                        <div className="flex flex-col gap-1">
                            <span className="text-red-500/50 block">DATE</span>
                            <div className="flex items-center gap-2 text-slate-300"><Calendar className="w-3.5 h-3.5" /> 2026.05.02</div>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-red-500/50 block">METHOD</span>
                            <div className="flex items-center gap-2 text-slate-300 uppercase tracking-wider italic font-bold">Dependency_Injection</div>
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
                        <GitMerge className="absolute -right-4 -top-4 w-32 h-32 text-red-500/5 -rotate-12" />
                        <p className="relative z-10 text-xl md:text-2xl leading-relaxed text-slate-300 italic font-medium m-0 text-center">
                            "散在するサブスクリプションは、管理コストを増大させる『技術的負債』だ。<br className="hidden md:block"/>
                            ハブとなる決済基盤にDI（依存性の注入）を行い、<br className="hidden md:block"/>
                            還元効率を統合せよ。"
                        </p>
                    </div>

                    <h2 id="section1" className="flex items-center gap-3 !text-2xl tracking-tight border-l-4 border-red-500 pl-4">
                        <Play className="w-6 h-6 text-red-600 fill-red-600/20" /> 1. YouTube Premiumへの「パッチ適用」
                    </h2>
                    <p>
                        前回のNetflix同様、YouTube Premiumも「直接課金」は非効率です。ドコモの決済ハブを経由させることで、月額料金の20%（eximo/ahamo/ギガホ契約時）がdポイントとして還流されるようになります。
                    </p>
                    <p>
                        これにより、広告フリーの快適な視聴環境（ランタイム）を維持しつつ、実質的なコストを大幅にダウンさせる「パッチ」が完了します。
                    </p>

                    <h2 id="section2" className="flex items-center gap-3 !text-2xl tracking-tight border-l-4 border-slate-500 pl-4">
                        <Plus className="w-6 h-6 text-slate-500" /> 2. マルチサブスクの「依存関係」を解く
                    </h2>
                    <p>
                        この戦略の真骨頂は、複数のサービスをドコモ経由で「一括契約」することによるシナジーにあります。
                    </p>
                    
                    <div className="my-10 p-8 bg-slate-900/50 border border-red-500/20 rounded-3xl font-mono relative overflow-hidden group shadow-2xl">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Box className="w-16 h-16 text-red-400" />
                        </div>
                        <div className="flex items-center gap-2 text-red-400 mb-6 uppercase tracking-[0.2em] text-[11px] font-bold">
                            <Activity className="w-4 h-4" /> dependency_graph.json
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                            <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                                <span className="text-red-500 font-bold block mb-1">YouTube Premium</span>
                                <span className="text-slate-400">還元率: 20% (d-point)</span>
                            </div>
                            <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                                <span className="text-red-500 font-bold block mb-1">DAZN for docomo</span>
                                <span className="text-slate-400">還元率: 最大20% / セット割対象</span>
                            </div>
                            <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                                <span className="text-red-500 font-bold block mb-1">Lemino Premium</span>
                                <span className="text-slate-400">還元率: 10% / 10%ポイント還元</span>
                            </div>
                            <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                                <span className="text-red-500 font-bold block mb-1">マネフォ for docomo</span>
                                <span className="text-slate-400">管理コストの統合（後述）</span>
                            </div>
                        </div>
                    </div>

                    <h2 id="section3" className="flex items-center gap-3 !text-2xl tracking-tight border-l-4 border-red-500 pl-4">
                        <Search className="w-6 h-6 text-red-500" /> 3. 「マネーフォワード for docomo」の活用
                    </h2>
                    <p>
                        家計を監視（モニタリング）するためのツール自体を、最適化された還元スタックに組み込む。これこそが、自己参照的（セルフホスティング）な家計管理の理想形です。
                    </p>

                    <div className="my-12 p-8 bg-gradient-to-br from-red-500/10 via-red-500/5 to-transparent border border-red-500/20 rounded-3xl relative overflow-hidden group">
                        <ShieldCheck className="absolute -right-4 -bottom-4 w-32 h-32 text-red-500/10 group-hover:scale-110 transition-transform duration-700" />
                        <h4 className="flex items-center gap-3 text-red-400 font-bold mt-0 mb-6 uppercase text-xs tracking-[0.3em] font-mono leading-none">
                            <ShieldCheck className="w-4 h-4" /> System Integration Check
                        </h4>
                        <p className="text-sm m-0 leading-relaxed italic text-slate-300 font-medium">
                            「複数のサブスクをドコモ経由に集約することで、万が一の支払遅延やカード更新時の修正（ホットフィックス）も一箇所で済むようになる。これは家計の『可用性』を高める保守戦略でもある。」
                        </p>
                    </div>

                    <h2 id="section4" className="!text-2xl text-white">まとめ：エンタメ代を「資産」に変える</h2>
                    <p>
                        月額数千円のサブスクも、年間で見れば数万円。その20%をポイントとして回収し続けることは、実質的なインフラ維持費の削減と同義です。
                    </p>
                </div>

                {/* 🧭 フッターナビゲーション */}
                <footer className="mt-24 pt-12 border-t border-white/5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono">
                        <Link 
                            href="/series/saving-stack/vol-6" 
                            className="group p-8 rounded-3xl border border-slate-800 bg-white/[0.02] hover:border-red-500/50 hover:bg-red-500/5 transition-all text-left relative overflow-hidden shadow-xl"
                        >
                            <span className="text-[10px] text-red-500 font-bold block mb-4 tracking-[0.2em]">PREV_STP / VOL_06</span>
                            <span className="text-white font-bold group-hover:text-red-400 transition-colors text-sm leading-tight block font-sans">
                                第6回：Netflix代を<br/>最大20%還元する
                            </span>
                        </Link>
                        
                        <Link 
                            href="/series/saving-stack/vol-8" 
                            className="group p-8 rounded-3xl border border-slate-800 bg-white/[0.02] hover:border-blue-500/50 hover:bg-blue-500/5 transition-all text-right relative overflow-hidden shadow-xl"
                        >
                            <span className="text-[10px] text-blue-500 font-bold block mb-4 tracking-[0.2em]">NEXT_STP / VOL_08</span>
                            <div className="flex items-center justify-end gap-4">
                                <span className="text-white font-bold group-hover:text-blue-400 transition-colors text-sm leading-tight block font-sans text-right">
                                    第8回：三井住友カード<br/>「7%還元」対象店舗を網羅
                                </span>
                                <ArrowRight className="w-5 h-5 text-slate-600 group-hover:text-blue-500 transition-all group-hover:translate-x-2" />
                            </div>
                        </Link>
                    </div>

                    <div className="mt-16 flex items-center justify-center gap-4 text-center">
                        <div className="h-px w-12 bg-white/5"></div>
                        <Link href="/series/saving-stack" className="text-[10px] font-mono text-slate-500 hover:text-white transition-colors tracking-widest uppercase font-bold group flex items-center gap-2">
                             SERIES_INDEX <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <div className="h-px w-12 bg-white/5"></div>
                    </div>
                </footer>
            </article>
        </div>
    );
}