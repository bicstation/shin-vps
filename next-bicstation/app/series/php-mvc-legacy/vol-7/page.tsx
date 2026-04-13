/* eslint-disable react/no-unescaped-entities */
/**
 * =====================================================================
 * 🛰️ PHP_MVC_SERIES_VOL_7_V1.0
 * 🛡️ Maya's Strategy: テンプレート分離による「メンテナンス性」の極致
 * 💎 Purpose: XSS 対策（サニタイズ）を自動化する仕組みを提示し、信頼性を担保
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
    Layout,
    EyeOff
} from 'lucide-react';
import { constructMetadata } from '@/shared/lib/utils/metadata';

export async function generateMetadata() {
    return constructMetadata({
        title: "Vol.7 テンプレートエンジンと XSS 対策 | BICSTATION",
        description: "HTMLの中に PHP を書かない。バッファリングを用いた描画制御と、エスケープ処理の自動化。",
    });
}

export default function SeriesVol7() {
    return (
        <div className="min-h-screen bg-[#0a0a0c] text-slate-300 py-12 lg:py-20 px-6">
            <article className="max-w-3xl mx-auto">
                
                {/* 🔖 ナビゲーション */}
                <nav className="flex items-center justify-between text-xs font-mono text-slate-500 mb-12 border-b border-white/5 pb-4">
                    <Link href="/series/php-mvc-legacy" className="hover:text-emerald-500 flex items-center gap-1 transition-colors">
                        <List className="w-3 h-3" /> INDEX
                    </Link>
                    <span className="text-emerald-500/50">PHP_MVC_SERIES // VOL.07</span>
                </nav>

                {/* 🚀 記事ヘッダー */}
                <header className="mb-16">
                    <h1 className="text-3xl md:text-5xl font-bold text-white mb-8 leading-tight">
                        テンプレートエンジンと<br />XSS 対策の実装
                    </h1>

                    <div className="flex flex-wrap gap-6 text-xs font-mono text-slate-500">
                        <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-emerald-500" /> 2026.04.19</div>
                        <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-emerald-500" /> 9 MIN READ</div>
                        <div className="flex items-center gap-2"><User className="w-4 h-4 text-emerald-500" /> AUTHOR: MAYA</div>
                    </div>
                </header>

                {/* 📝 本文 */}
                <div className="prose prose-invert prose-emerald max-w-none 
                    prose-headings:text-white prose-headings:font-bold
                    prose-p:leading-relaxed prose-p:text-slate-300
                    prose-strong:text-emerald-400 prose-code:text-emerald-300">
                    
                    <p className="text-xl leading-relaxed text-slate-400 italic mb-12 border-l-2 border-emerald-500 pl-6">
                        "デザインとロジックを混ぜることは、料理と掃除を同時に行うようなものです。どちらも中途半端に終わります。"
                    </p>

                    <h2 id="output-buffering">1. 出力バッファリングの活用</h2>
                    <p>
                        PHP の {`ob_start()`} と {`ob_get_clean()`} を使い、テンプレートファイルを一度メモリ上に展開してから変数に格納する仕組みを構築しました。これにより、コントローラーから「どのレイアウトにどのデータを流し込むか」を完全に制御できるようになります。
                    </p>

                    <div className="my-10 p-6 bg-white/5 border border-slate-800 rounded-2xl">
                        <div className="flex items-center gap-2 mb-4">
                            <Layout className="text-emerald-500 w-5 h-5" />
                            <span className="text-sm font-bold uppercase tracking-wider text-white">View Rendering Flow</span>
                        </div>
                        <pre className="text-[11px] leading-tight text-emerald-300/80 bg-black/50 p-4 rounded-lg overflow-x-auto">
{`extract($data); // データを変数として展開
ob_start();
require $template_file;
$content = ob_get_clean();
require $layout_file; // 最終的な外枠と合成`}
                        </pre>
                    </div>

                    <h2 id="xss-protection">2. 自動サニタイズという安全網</h2>
                    <p>
                        Web開発で最も多い脆弱性の一つがクロスサイトスクリプティング（XSS）です。出力時に {`htmlspecialchars()`} を通す共通関数 {`h()`} を定義。これをテンプレート内で徹底することで、悪意あるスクリプトの実行を未然に防ぎました。
                    </p>

                    <div className="my-10 p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl flex gap-4">
                        <EyeOff className="text-emerald-500 w-6 h-6 shrink-0" />
                        <div>
                            <h4 className="text-emerald-500 font-bold m-0 uppercase text-sm">Security as Default</h4>
                            <p className="text-sm mt-2 mb-0">
                                人間は必ず忘れる生き物です。だからこそ、システム側で「エスケープされていない出力」を許容しない仕組みづくりが重要なのです。
                            </p>
                        </div>
                    </div>
                </div>

                {/* 🧭 フッターナビゲーション */}
                <footer className="mt-24 pt-12 border-t border-white/5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Link href="/series/php-mvc-legacy/vol-6" className="group p-6 rounded-2xl border border-slate-800 hover:border-emerald-500/50 transition-all text-left">
                            <span className="text-[10px] text-slate-500 font-mono block mb-2">PREVIOUS</span>
                            <div className="flex items-center gap-2">
                                <ChevronLeft className="w-5 h-5 text-slate-600 group-hover:text-emerald-500 transition-all group-hover:-translate-x-1" />
                                <span className="text-white font-bold group-hover:text-emerald-400 transition-colors">Vol.6 モデル層へのロジック集約</span>
                            </div>
                        </Link>
                        
                        <Link href="/series/php-mvc-legacy/vol-8" className="group p-6 rounded-2xl border border-slate-800 bg-white/5 hover:border-emerald-500/50 transition-all text-right">
                            <span className="text-[10px] text-emerald-500 font-mono block mb-2">NEXT</span>
                            <div className="flex items-center justify-between">
                                <span className="text-white font-bold group-hover:text-emerald-400 transition-colors">Vol.8 フォーム処理とバリデーション</span>
                                <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-emerald-500 transition-all group-hover:translate-x-1" />
                            </div>
                        </Link>
                    </div>
                </footer>
            </article>
        </div>
    );
}