/* eslint-disable @next/next/no-img-element */
import React from 'react';
import Link from 'next/link';
import { 
    History, Database, Cpu, Terminal, 
    Binary, Code2, Layers, 
    ChevronRight, ArrowLeft,
    Monitor, Briefcase, BookOpen, Globe,
    Server, Zap, BrainCircuit
} from 'lucide-react';

import styles from './page.module.css';

export const metadata = {
    title: 'LAYER_99: システムアーカイブ | 44年のエンジニア知見',
    description: '14歳のマシン語から始まった44年の技術履歴と、現行プロジェクトの全インデックス。',
};

export default function ArchiveIndexPage() {
    return (
        <div className="min-h-screen bg-black text-zinc-300 font-sans selection:bg-emerald-500/30">
            {/* 🌌 背景グリッドエフェクト */}
            <div className="fixed inset-0 opacity-20 pointer-events-none">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#10b98110,transparent)]"></div>
                <div className="absolute w-full h-full bg-[url('/grid.svg')] bg-repeat opacity-10"></div>
            </div>

            <div className="relative z-10 max-w-6xl mx-auto px-6 py-20">
                
                {/* 🔙 戻るボタン */}
                <Link href="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-emerald-400 transition-colors mb-12 group">
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-[10px] font-mono tracking-[0.2em] uppercase">Return to Root</span>
                </Link>

                {/* 🛡️ ページヘッダー */}
                <header className="mb-20 border-l-4 border-emerald-500 pl-8">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/50 rounded text-emerald-400 font-mono text-[11px] font-black tracking-[0.3em]">
                            LAYER_99
                        </div>
                        <span className="text-zinc-600 font-mono text-[10px] animate-pulse uppercase tracking-widest">
                            Archive_Node_Connected
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tighter">
                        SYSTEM_ARCHIVE<span className="text-emerald-500">.</span>
                    </h1>
                    <p className="max-w-2xl text-zinc-400 leading-relaxed text-sm md:text-base">
                        これは単なる記事のリストではありません。1982年から現在に至るまで、
                        技術の変遷を実体験として刻んできた「知見の要塞」の全インデックスです。
                    </p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    
                    {/* 📂 左・中：既存記事ディレクトリ（データノード） */}
                    <div className="lg:col-span-2 space-y-12">
                        <h2 className="flex items-center gap-3 text-xs font-bold text-white uppercase tracking-[0.3em] mb-8 pb-4 border-b border-zinc-800">
                            <Database size={16} className="text-emerald-500" /> Active_Data_Nodes
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                            {/* Node 01: AI Intelligence Engine */}
                            <DataNodeCard 
                                href="/series/99-archive/ai-intelligence-engine"
                                title="AI_Intelligence_Engine"
                                desc="LLM（大規模言語モデル）の実装から、Pythonによる知的自動化、推論エンジンの構築ログ。1980年代のPrologから続く論理の現代的帰結。"
                                icon={<BrainCircuit className="text-purple-400" size={24} />}
                                tag="Python / LLM / PyTorch"
                            />

                            {/* Node 02: Modern Fullstack Roadmap */}
                            <DataNodeCard 
                                href="/series/99-archive/modern-fullstack-roadmap"
                                title="Modern_Fullstack_Roadmap"
                                desc="Next.jsとDjangoを軸にした、現代最強のフルスタック構成。フロントエンドの表現力と、バックエンドの堅牢性を融合させる再構築の全記録。"
                                icon={<Zap className="text-yellow-400" size={24} />}
                                tag="Next.js / Django / TypeScript"
                            />

                            {/* Node 03: PHP MVC Legacy */}
                            <DataNodeCard 
                                href="/series/99-archive/php-mvc-legacy"
                                title="PHP_MVC_Legacy_Assets"
                                desc="1998年から20年間にわたりビジネスの現場を支え続けたPHP/MVCモデルの知見。レガシーから何を学び、どう移行すべきかの技術資産。"
                                icon={<Server className="text-blue-400" size={24} />}
                                tag="PHP / Laravel / MySQL"
                            />
                        </div>
                    </div>

                    {/* 🛡️ 右：Trust Chronicle (あなたの経歴) */}
                    <aside className="space-y-8">
                        <h2 className="flex items-center gap-3 text-xs font-bold text-white uppercase tracking-[0.3em] mb-8 pb-4 border-b border-zinc-800">
                            <History size={16} className="text-emerald-500" /> Trust_Chronicle
                        </h2>
                        
                        <div className="relative pl-6 border-l border-zinc-800 space-y-10">
                            <TimelineItem 
                                year="1982-1984"
                                title="PC-8001 マシン語"
                                desc="14歳。ベーマガ掲載という原体験。ハードの仕組みをレジスタ単位で理解する。"
                                icon={<Monitor size={14} />}
                                active
                            />
                            <TimelineItem 
                                year="1987-1991"
                                title="自然言語処理 & Prolog"
                                desc="UNIX研究室。AIの哲学的基礎。記号論理学による知能の構造化を研究。"
                                icon={<BookOpen size={14} />}
                            />
                            <TimelineItem 
                                year="1998-2018"
                                title="経営とWeb開発の融合"
                                desc="現場主義のフルスタック開発。実ビジネスで「動く技術」の価値を追求。"
                                icon={<Briefcase size={14} />}
                            />
                            <TimelineItem 
                                year="2026-PRES"
                                title="フルスタック再構築"
                                desc="Next.js/Djangoによる最終統合。44年の知見をAI時代へ完全同期。"
                                icon={<Cpu size={14} />}
                            />
                        </div>

                        {/* システムステータス */}
                        <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-xl mt-12">
                            <div className="text-[10px] font-mono text-zinc-500 mb-2 uppercase">Integrity_Check</div>
                            <div className="flex items-center gap-2 text-emerald-500 text-xs font-mono">
                                <Binary size={14} /> 44_YEARS_PROVEN_LOGS
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}

// ✅ データノード（既存ディレクトリ）用カード
function DataNodeCard({ href, title, desc, icon, tag }: any) {
    return (
        <Link href={href} className="group relative block p-8 bg-zinc-900/30 border border-zinc-800 rounded-2xl hover:border-emerald-500/50 transition-all overflow-hidden">
            <div className="absolute right-0 top-0 p-4 opacity-[0.05] group-hover:opacity-[0.1] transition-opacity">
                {icon}
            </div>
            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                    {icon}
                    <h3 className="text-xl font-bold text-white font-mono tracking-tight group-hover:text-emerald-400 transition-colors">{title}</h3>
                </div>
                <p className="text-sm text-zinc-500 leading-relaxed mb-6 max-w-xl">
                    {desc}
                </p>
                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-zinc-600 bg-black px-2 py-1 rounded border border-zinc-800 uppercase tracking-widest">{tag}</span>
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-500 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                        ACCESS_NODE <ChevronRight size={14} />
                    </div>
                </div>
            </div>
        </Link>
    );
}

// ✅ タイムラインアイテム用
function TimelineItem({ year, title, desc, icon, active = false }: any) {
    return (
        <div className="relative">
            {/* ポインター */}
            <div className={`absolute -left-[31px] top-1 w-2.5 h-2.5 rounded-full border-2 border-black ${active ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-zinc-700'}`}></div>
            
            <div className="mb-1 text-[10px] font-mono text-emerald-500/70 tracking-widest uppercase flex items-center gap-2">
                {icon} {year}
            </div>
            <h4 className="text-sm font-bold text-zinc-200 mb-2">{title}</h4>
            <p className="text-[11px] text-zinc-500 leading-relaxed italic">{desc}</p>
        </div>
    );
}