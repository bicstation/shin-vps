/* eslint-disable react/no-unescaped-entities */
/**
 * =====================================================================
 * 🛰️ PHP_MVC_SERIES_VOL_2_V1.0
 * 🛡️ Maya's Strategy: 独自オートローダーの実装による「基礎力」の証明
 * 💎 Purpose: PSRに準拠しない環境下でのクラス管理術を提示し、専門性を担保
 * =====================================================================
 */

import React from 'react';
import Link from 'next/link';
import { 
    ChevronLeft, 
    ChevronRight, 
    List, 
    Calendar, 
    Clock, 
    User, 
    FolderTree,
    Cpu
} from 'lucide-react';
import { constructMetadata } from '@/shared/lib/utils/metadata';

export async function generateMetadata() {
    return constructMetadata({
        title: "Vol.2 ディレクトリ構造とオートローダーの実装 | BICSTATION",
        description: "require_once 地獄からの脱却。SPL_autoload_register を用いた、シンプルかつ強力なクラス読み込み機構。",
    });
}

export default function SeriesVol2() {
    return (
        <div className="min-h-screen bg-[#0a0a0c] text-slate-300 py-12 lg:py-20 px-6">
            <article className="max-w-3xl mx-auto">
                
                {/* 🔖 ナビゲーション */}
                <nav className="flex items-center justify-between text-xs font-mono text-slate-500 mb-12 border-b border-white/5 pb-4">
                    <Link href="/series/php-mvc-legacy" className="hover:text-emerald-500 flex items-center gap-1 transition-colors">
                        <List className="w-3 h-3" /> INDEX
                    </Link>
                    <span className="text-emerald-500/50">PHP_MVC_SERIES // VOL.02</span>
                </nav>

                {/* 🚀 記事ヘッダー */}
                <header className="mb-16">
                    <h1 className="text-3xl md:text-5xl font-bold text-white mb-8 leading-tight">
                        ディレクトリ構造と<br />オートローダーの実装
                    </h1>

                    <div className="flex flex-wrap gap-6 text-xs font-mono text-slate-500">
                        <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-emerald-500" /> 2026.04.14</div>
                        <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-emerald-500" /> 10 MIN READ</div>
                        <div className="flex items-center gap-2"><User className="w-4 h-4 text-emerald-500" /> AUTHOR: MAYA</div>
                    </div>
                </header>

                {/* 📝 本文 */}
                <div className="prose prose-invert prose-emerald max-w-none 
                    prose-headings:text-white prose-headings:font-bold
                    prose-p:leading-relaxed prose-p:text-slate-300
                    prose-strong:text-emerald-400 prose-code:text-emerald-300">
                    
                    <p className="text-xl leading-relaxed text-slate-400 italic mb-12 border-l-2 border-emerald-500 pl-6">
                        "美しいコードは、美しいディレクトリ構造から生まれます。Composer が使えない環境で、いかにして『疎結合』なファイル管理を実現するか。その答えがオートローダーでした。"
                    </p>

                    <h2 id="folder-structure">1. 意味のある「階層」を作る</h2>
                    <p>
                        MVCを自作するにあたり、まず徹底したのは `app/`, `core/`, `public/` の完全な分離です。コントローラーやモデルがどこに配置されるべきか。その物理的な配置が、システム全体の依存関係を決定づけます。
                    </p>

                    <div className="my-10 p-6 bg-white/5 border border-slate-800 rounded-2xl">
                        <div className="flex items-center gap-2 mb-4">
                            <FolderTree className="text-emerald-500 w-5 h-5" />
                            <span className="text-sm font-bold uppercase tracking-wider text-white">Ideal Directory Map</span>
                        </div>
                        <pre className="text-[11px] leading-tight text-emerald-300/80 bg-black/50 p-4 rounded-lg overflow-x-auto">
{`project/
├── app/          # Business Logic (Model, View, Controller)
├── core/         # Framework Engine (Router, Database, Auth)
├── public/       # Entry Point (index.php, assets)
└── config/       # Environment Settings`}
                        </pre>
                    </div>

                    <h2 id="autoloading">2. SPL_autoload_register の魔法</h2>
                    <p>
                        かつてのPHP開発は `require_once` の羅列でした。これを排除し、クラス名とファイルパスを動的に紐付けるオートローダーを `core/Bootstrap.php` に実装しました。
                    </p>

                    <div className="my-10 p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl flex gap-4">
                        <Cpu className="text-emerald-500 w-6 h-6 shrink-0" />
                        <div>
                            <h4 className="text-emerald-500 font-bold m-0 uppercase text-sm">Automated Loading</h4>
                            <p className="text-sm mt-2 mb-0">
                                クラスがインスタンス化される直前に、その名前から自動的にファイルを特定して読み込む。この単純な仕組みが、開発体験を劇的に向上させました。
                            </p>
                        </div>
                    </div>

                    <h2 id="conclusion">3. 「標準」への橋渡し</h2>
                    <p>
                        このオートローダーは PSR-4 に完全に準拠しているわけではありませんが、名前空間の概念を取り入れることで、将来的にモダンな環境へ移行する際の「痛み」を最小限にするための布石となりました。
                    </p>
                </div>

                {/* 🧭 フッターナビゲーション */}
                <footer className="mt-24 pt-12 border-t border-white/5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Link 
                            href="/series/php-mvc-legacy/vol-1" 
                            className="group p-6 rounded-2xl border border-slate-800 hover:border-emerald-500/50 transition-all text-left"
                        >
                            <span className="text-[10px] text-slate-500 font-mono block mb-2">PREVIOUS</span>
                            <div className="flex items-center gap-2">
                                <ChevronLeft className="w-5 h-5 text-slate-600 group-hover:text-emerald-500 transition-all group-hover:-translate-x-1" />
                                <span className="text-white font-bold group-hover:text-emerald-400 transition-colors">Vol.1 自作 MVC の確立</span>
                            </div>
                        </Link>
                        
                        <Link 
                            href="/series/php-mvc-legacy/vol-3" 
                            className="group p-6 rounded-2xl border border-slate-800 bg-white/5 hover:border-emerald-500/50 transition-all text-right"
                        >
                            <span className="text-[10px] text-emerald-500 font-mono block mb-2">NEXT</span>
                            <div className="flex items-center justify-between">
                                <span className="text-white font-bold group-hover:text-emerald-400 transition-colors">Vol.3 ルーティングの実装</span>
                                <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-emerald-500 transition-all group-hover:translate-x-1" />
                            </div>
                        </Link>
                    </div>
                </footer>
            </article>
        </div>
    );
}