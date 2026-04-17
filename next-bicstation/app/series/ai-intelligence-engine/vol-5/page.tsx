/* eslint-disable react/no-unescaped-entities */
/**
 * =====================================================================
 * 🚀 NEXT_GEN_FULLSTACK_ROADMAP_VOL_5_V1.0
 * 🛡️ Maya's Logic: 非構造化テキストを構造化UIへ変換するフロントエンドの妙
 * 💎 Purpose: AIの出力をそのまま出さない。デザインの一部として制御する。
 * =====================================================================
 */

import React from 'react';
import Link from 'next/link';
import { 
    ChevronRight, 
    List, 
    Calendar, 
    Clock, 
    User, 
    Scissors,
    Code2,
    Sparkles
} from 'lucide-react';
import { constructMetadata } from '@/shared/lib/utils/metadata';

export async function generateMetadata() {
    return constructMetadata({
        title: "Vol.5 「AIコメント」の動的UIパース術 | BICSTATION",
        description: "AIが吐き出した長文を、Reactコンポーネントへ自動分配する技術。正規表現によるパースの極意。",
    });
}

export default function NextGenVol5() {
    return (
        <div className="min-h-screen bg-[#0a0a0c] text-slate-300 py-12 lg:py-20 px-6 font-sans">
            <article className="max-w-3xl mx-auto">
                
                {/* 🔖 ナビゲーション */}
                <nav className="flex items-center justify-between text-xs font-mono text-slate-500 mb-12 border-b border-white/5 pb-4">
                    <Link href="/series/ai-intelligence-engine" className="hover:text-emerald-400 flex items-center gap-1 transition-colors">
                        <List className="w-3 h-3" /> INDEX
                    </Link>
                    <span className="text-emerald-500/50 uppercase tracking-tighter">Roadmap // Vol.05</span>
                </nav>

                {/* 🚀 記事ヘッダー */}
                <header className="mb-16">
                    <span className="text-emerald-500 font-mono text-[10px] tracking-[0.3em] uppercase block mb-4">第2章：AI・インテリジェンス</span>
                    <h1 className="text-3xl md:text-5xl font-bold text-white mb-8 leading-tight tracking-tight">
                        正規表現による「AIコメント」の<br className="hidden md:block" />動的UIパース術
                    </h1>

                    <div className="flex flex-wrap gap-6 text-[10px] font-mono text-slate-500 uppercase">
                        <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-emerald-500" /> 2026.04.22</div>
                        <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-emerald-500" /> 9 MIN READ</div>
                        <div className="flex items-center gap-2"><User className="w-4 h-4 text-emerald-500" /> AUTHOR: MAYA</div>
                    </div>
                </header>

                {/* 📝 本文 */}
                <div className="prose prose-invert prose-emerald max-w-none 
                    prose-headings:text-white prose-headings:font-bold
                    prose-p:leading-relaxed prose-p:text-slate-300 prose-p:font-light
                    prose-strong:text-emerald-400 prose-code:text-emerald-300">
                    
                    <p className="text-xl leading-relaxed text-slate-400 italic mb-12 border-l-2 border-emerald-500 pl-6">
                        "AIに自由奔放に語らせ、エンジニアが厳格に型を整える。この緊張感のある関係性が、Webサイトに『インテリジェンスな質感』を与えます。"
                    </p>

                    <h2 id="anti-long-text">1. 「ただの長文」をユーザーは読まない</h2>
                    <p>
                        AIが生成したテキストをそのまま `&lt;p&gt;` タグで表示するのは、専門メディアとしては不十分です。ユーザーが瞬時に情報を理解できるよう、「要約」「注目点」「結論」といった要素に視覚的に分離する必要があります。
                        私たちは、AIの出力に特定のデリミタ（例：`[POINT1]`）を含めるようプロンプトで制御し、それをフロントエンドで分解する手法をとりました。
                    </p>

                    <h2 id="regex-power">2. 正規表現によるストリーム・パース</h2>
                    <p>
                        Djangoから送られてくる1つの文字列を、JavaScriptの `String.prototype.match()` や `split()` を駆使して分解します。
                        例えば、`### POINT` というマークダウンの見出しをフックに、自動的にLucideアイコン付きのカード型UIへ流し込む。これにより、データ構造を変えることなく、表現の自由度だけを最大化できます。
                    </p>

                    <div className="my-10 p-6 bg-white/[0.03] border border-slate-800 rounded-2xl">
                        <div className="flex items-center gap-2 mb-4 text-emerald-400 font-mono text-xs">
                            <Scissors className="w-4 h-4" />
                            <span>Parsing Logic Example</span>
                        </div>
                        <pre className="text-[11px] leading-relaxed text-emerald-300/80 font-mono bg-black/40 p-4 rounded-lg overflow-x-auto">
{`// 文字列から特定のセクションを抽出する
const summary = rawText.match(/\\[SUMMARY\\]([\\s\\S]*?)\\[\\/SUMMARY\\]/)?.[1];
const points = rawText.match(/POINT\\d:[^\\n]*/g);`}
                        </pre>
                    </div>

                    <h2 id="dynamic-ui">3. Reactコンポーネントへの自動分配</h2>
                    <p>
                        パースされた断片は、単なるテキストとしてではなく、専用のReactコンポーネントとしてレンダリングされます。
                        <strong>「ポイント1」</strong>には雷アイコン、<strong>「注意点」</strong>には警告アイコンを自動付与。
                        この「AIの言葉をUIにマッピングする」仕組みが、365万件全てのページに、まるで専属ライターがレイアウトしたかのような一貫性をもたらします。
                    </p>

                    <div className="my-10 p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl flex gap-4 shadow-xl">
                        <Sparkles className="text-emerald-500 w-6 h-6 shrink-0" />
                        <div>
                            <h4 className="text-emerald-500 font-bold m-0 uppercase text-sm">The Result</h4>
                            <p className="text-sm mt-2 mb-0">
                                ユーザー滞在時間は向上し、直帰率は低下。AIの知性とモダンなUIが融合した瞬間、サイトは単なるデータベースから「メディア」へと進化しました。
                            </p>
                        </div>
                    </div>

                    <h2 id="next-chapter">次回、第3章突入：爆速フロントエンド</h2>
                    <p>
                        知性を手に入れたサイトに、次は「速さ」という命を吹き込みます。
                        第6回からは<strong>第3章：フロントエンド・高速化編</strong>がスタート。Next.js App Routerを使い倒し、365万ページを瞬きする間に表示させるSSGの極意を解説します。
                    </p>

                </div> {/* 👈 本文の閉じ div (prose) */}

                {/* 🧭 フッターナビゲーション */}
                <footer className="mt-24 pt-12 border-t border-white/5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Link 
                            href="/series/ai-intelligence-engine/vol-4" 
                            className="group p-6 rounded-2xl border border-slate-800 bg-white/5 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all duration-300 shadow-lg shadow-black/40"
                        >
                            <span className="text-[10px] text-emerald-500 font-mono block mb-2 uppercase tracking-widest text-left">Previous Episode</span>
                            <div className="flex items-center justify-start gap-4">
                                <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-emerald-500 transition-all group-hover:-translate-x-1 rotate-180" />
                                <span className="text-white font-bold group-hover:text-emerald-400 transition-colors text-left text-sm">
                                    Vol.4 LLM を解析エンジンとして統合する
                                </span>
                            </div>
                        </Link>

                        <Link 
                            href="/series/ai-intelligence-engine/vol-6" 
                            className="group p-6 rounded-2xl border border-slate-800 bg-white/5 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all duration-300 shadow-lg shadow-black/40"
                        >
                            <span className="text-[10px] text-emerald-500 font-mono block mb-2 uppercase tracking-widest text-right">Next Episode</span>
                            <div className="flex items-center justify-between gap-4">
                                <span className="text-white font-bold group-hover:text-emerald-400 transition-colors text-sm">
                                    Vol.6 Next.js App Router による爆速SSG
                                </span>
                                <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-emerald-500 transition-all group-hover:translate-x-1" />
                            </div>
                        </Link>
                    </div>

                    <div className="mt-12 text-center">
                        <Link href="/series/ai-intelligence-engine" className="text-[10px] font-mono text-slate-600 hover:text-emerald-500 transition-colors uppercase tracking-[0.2em]">
                            Back to Roadmap Index
                        </Link>
                    </div>
                </footer>
            </article>
        </div>
    );
}