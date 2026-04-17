/* eslint-disable react/no-unescaped-entities */
/**
 * =====================================================================
 * 🚀 NEXT_GEN_FULLSTACK_ROADMAP_VOL_6_V1.0
 * 🛡️ Maya's Logic: 365万ページを静的ファイルとして扱い、物理限界を超える
 * 💎 Purpose: ビルド時間の最適化と、ユーザー体験の最大化を両立させる
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
    Zap,
    Wind,
    Layers
} from 'lucide-react';
import { constructMetadata } from '@/shared/lib/utils/metadata';

export async function generateMetadata() {
    return constructMetadata({
        title: "Vol.6 Next.js App Router による爆速SSG | BICSTATION",
        description: "大規模サイトにおける generateStaticParams の運用とビルド時間の最適化。ISRを活用した最新情報の同期。",
    });
}

export default function NextGenVol6() {
    return (
        <div className="min-h-screen bg-[#0a0a0c] text-slate-300 py-12 lg:py-20 px-6 font-sans">
            <article className="max-w-3xl mx-auto">
                
                {/* 🔖 ナビゲーション */}
                <nav className="flex items-center justify-between text-xs font-mono text-slate-500 mb-12 border-b border-white/5 pb-4">
                    <Link href="/series/ai-intelligence-engine" className="hover:text-emerald-400 flex items-center gap-1 transition-colors">
                        <List className="w-3 h-3" /> INDEX
                    </Link>
                    <span className="text-emerald-500/50 uppercase tracking-tighter">Roadmap // Vol.06</span>
                </nav>

                {/* 🚀 記事ヘッダー */}
                <header className="mb-16">
                    <span className="text-emerald-500 font-mono text-[10px] tracking-[0.3em] uppercase block mb-4">第3章：フロントエンド・高速化</span>
                    <h1 className="text-3xl md:text-5xl font-bold text-white mb-8 leading-tight tracking-tight">
                        Next.js App Router による<br className="hidden md:block" />爆速SSG（静的サイト生成）
                    </h1>

                    <div className="flex flex-wrap gap-6 text-[10px] font-mono text-slate-500 uppercase">
                        <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-emerald-500" /> 2026.04.23</div>
                        <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-emerald-500" /> 10 MIN READ</div>
                        <div className="flex items-center gap-2"><User className="w-4 h-4 text-emerald-500" /> AUTHOR: MAYA</div>
                    </div>
                </header>

                {/* 📝 本文 */}
                <div className="prose prose-invert prose-emerald max-w-none 
                    prose-headings:text-white prose-headings:font-bold
                    prose-p:leading-relaxed prose-p:text-slate-300 prose-p:font-light
                    prose-strong:text-emerald-400 prose-code:text-emerald-300">
                    
                    <p className="text-xl leading-relaxed text-slate-400 italic mb-12 border-l-2 border-emerald-500 pl-6">
                        "1,000件のページを速くするのは簡単です。しかし、3,650,000件のページを『全速力』で動かすには、従来のWebの常識を捨てる必要がありました。"
                    </p>

                    <h2 id="ssg-limit">1. generateStaticParams：静的生成の暴力</h2>
                    <p>
                        Next.js 14の真骨頂は、ビルド時にデータをHTMLとして書き出しておくSSG（Static Site Generation）にあります。
                        365万件ものレコードがある場合、全ページを一度にビルドするのは現実的ではありません。私たちは、**「アクセスが多い主要1万ページを事前にビルド」**し、残りはオンデマンドで生成するハイブリッド戦略を採用しました。
                    </p>

                    <div className="my-10 p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl flex gap-4">
                        <Wind className="text-emerald-500 w-6 h-6 shrink-0" />
                        <div>
                            <h4 className="text-emerald-500 font-bold m-0 uppercase text-sm">Performance Score</h4>
                            <p className="text-sm mt-2 mb-0">
                                LCP（最大視覚コンテンツの表示）は<strong>0.8秒</strong>を記録。サーバーのDB検索を待たず、CDNから直接HTMLを配信することで、GoogleのCore Web Vitalsで満点を叩き出します。
                            </p>
                        </div>
                    </div>

                    <h2 id="isr-strategy">2. ISR（Incremental Static Regeneration）の運用</h2>
                    <p>
                        データは常に更新されます。365万件のDBが更新されるたびに再ビルドしていては身が持ちません。
                        BICSTATIONでは、`revalidate`（ISR）を活用。ユーザーが古いページにアクセスした際、裏側でそっと最新データに差し替える「バックグラウンド更新」を実装し、情報の鮮度と爆速な表示を両立させています。
                    </p>

                    <h2 id="build-optimization">3. ビルド時間の最適化：1分1秒を削る工夫</h2>
                    <p>
                        大規模プロジェクトにおいて、ビルド時間はエンジニアの寿命を削る課題です。
                        私たちは、ビルドプロセスを並列化し、Django APIへのリクエストをキャッシュすることで、無駄なオーバーヘッドを排除。Next.jsのサーバーコンポーネントが、DRFから受け取った「精製済みデータ」を最短距離でHTMLに流し込むフローを完成させました。
                    </p>

                    <div className="my-10 p-6 bg-white/[0.03] border border-slate-800 rounded-2xl">
                        <div className="flex items-center gap-2 mb-4 text-emerald-400">
                            <Layers className="w-4 h-4" />
                            <span className="text-xs font-mono uppercase">Key Technical Points</span>
                        </div>
                        <ul className="text-sm space-y-3 list-none p-0">
                            <li className="flex items-start gap-3 border-b border-white/5 pb-2 text-slate-400">
                                <span className="text-emerald-500">■</span>
                                <span>Streaming: データ読み込み中にスケルトンを表示し、体感速度を向上。</span>
                            </li>
                            <li className="flex items-start gap-3 border-b border-white/5 pb-2 text-slate-400">
                                <span className="text-emerald-500">■</span>
                                <span>Partial Prerendering: 静的部分と動的部分を分離した次世代レンダリング。</span>
                            </li>
                            <li className="flex items-start gap-3 text-slate-400">
                                <span className="text-emerald-500">■</span>
                                <span>Memory Leak Prevention: 数百万のループを回しても死なないNode.js管理。</span>
                            </li>
                        </ul>
                    </div>

                    <h2 id="next-step">次回予告：システム美の実装</h2>
                    <p>
                        圧倒的な「速さ」を手に入れたら、次は「美しさ」です。
                        第7回では、エンジニアリングの誇りを視覚化するLucide-ReactとTailwind CSSを駆使した、BICSTATION独自の「グリッチUI」とダークモードの実装哲学を公開します。
                    </p>

                </div>

                {/* 🧭 フッターナビゲーション */}
                <footer className="mt-24 pt-12 border-t border-white/5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Link 
                            href="/series/ai-intelligence-engine/vol-5" 
                            className="group p-6 rounded-2xl border border-slate-800 bg-white/5 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all duration-300 shadow-lg shadow-black/40"
                        >
                            <span className="text-[10px] text-emerald-500 font-mono block mb-2 uppercase tracking-widest text-left">Previous Episode</span>
                            <div className="flex items-center justify-start gap-4">
                                <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-emerald-500 transition-all group-hover:-translate-x-1 rotate-180" />
                                <span className="text-white font-bold group-hover:text-emerald-400 transition-colors text-left text-sm">
                                    Vol.5 「AIコメント」の動的UIパース術
                                </span>
                            </div>
                        </Link>

                        <Link 
                            href="/series/ai-intelligence-engine/vol-7" 
                            className="group p-6 rounded-2xl border border-slate-800 bg-white/5 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all duration-300 shadow-lg shadow-black/40"
                        >
                            <span className="text-[10px] text-emerald-500 font-mono block mb-2 uppercase tracking-widest text-right">Next Episode</span>
                            <div className="flex items-center justify-between gap-4">
                                <span className="text-white font-bold group-hover:text-emerald-400 transition-colors text-sm">
                                    Vol.7 システム美の実装（Tailwind/Lucide）
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