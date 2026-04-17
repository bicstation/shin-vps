/* eslint-disable react/no-unescaped-entities */
/**
 * =====================================================================
 * 🚀 NEXT_GEN_FULLSTACK_ROADMAP_VOL_7_V2.0
 * 🛡️ Maya's Logic: デザインを「コードの反映」と定義。美しさは機能に従う。
 * 💎 Purpose: Tailwind CSSによる高速開発と、エンジニアの誇りを込めたUI実装。
 * =====================================================================
 */

import React from 'react';
import Link from 'next/link';
import Image from 'next/image'; // ✅ 追加
import { 
    ChevronRight, 
    List, 
    Calendar, 
    Clock, 
    User, 
    Monitor,
    Palette,
    Terminal,
    Code2,
    Sparkles
} from 'lucide-react';
import { constructMetadata } from '@/shared/lib/utils/metadata';

// ✅ メタデータ：システム美を体現するビジュアルを指定
export async function generateMetadata() {
    return constructMetadata({
        title: "Vol.7 Lucide-React と Tailwind CSS による「システム美」の実装 | BICSTATION",
        description: "エンジニアリングの誇りを視覚化するダークモードとグリッチUI。Tailwind CSSによる一貫性のあるデザイン設計。",
        image: "/images/series/system-aesthetic-eyecatch.webp",
    });
}

export default function NextGenVol7() {
    return (
        <div className="min-h-screen bg-[#0a0a0c] text-slate-300 py-12 lg:py-20 px-6 font-sans">
            <article className="max-w-3xl mx-auto">
                
                {/* 🔖 ナビゲーション */}
                <nav className="flex items-center justify-between text-xs font-mono text-slate-500 mb-12 border-b border-white/5 pb-4">
                    <Link href="/series/ai-intelligence-engine" className="hover:text-emerald-400 flex items-center gap-1 transition-colors">
                        <List className="w-3 h-3" /> INDEX
                    </Link>
                    <span className="text-emerald-500/50 uppercase tracking-tighter">Roadmap // Vol.07</span>
                </nav>

                {/* 🚀 記事ヘッダー */}
                <header className="mb-16">
                    <span className="text-emerald-500 font-mono text-[10px] tracking-[0.3em] uppercase block mb-4">第3章：フロントエンド・高速化</span>
                    <h1 className="text-3xl md:text-5xl font-bold text-white mb-8 leading-tight tracking-tight">
                        Lucide と Tailwind による<br className="hidden md:block" />「システム美」の実装術
                    </h1>

                    <div className="flex flex-wrap gap-6 text-[10px] font-mono text-slate-500 uppercase mb-12">
                        <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-emerald-500" /> 2026.04.24</div>
                        <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-emerald-500" /> 9 MIN READ</div>
                        <div className="flex items-center gap-2"><User className="w-4 h-4 text-emerald-500" /> AUTHOR: MAYA</div>
                    </div>

                    {/* ✅ アイキャッチ画像（System Aesthetic / Cyberpunk UI Visual） */}
                    <div className="relative aspect-[16/9] w-full overflow-hidden rounded-3xl border border-white/10 shadow-2xl shadow-emerald-500/10 mb-16">
                        <Image
                            src="/images/series/system-aesthetic-eyecatch.webp" 
                            alt="BICSTATION Roadmap Vol.7: System Aesthetic with Tailwind and Lucide"
                            fill
                            className="object-cover object-center transition-transform duration-500 hover:scale-105"
                            priority
                            sizes="(max-w-768px) 100vw, 768px"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-transparent to-transparent" />
                        <div className="absolute bottom-6 left-6 flex items-center gap-3 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10">
                            <Palette className="w-4 h-4 text-emerald-400" />
                            <span className="text-xs font-mono text-white uppercase tracking-widest">Aesthetic Protocol</span>
                        </div>
                    </div>
                </header>

                {/* 📝 本文 */}
                <div className="prose prose-invert prose-emerald max-w-none 
                    prose-headings:text-white prose-headings:font-bold
                    prose-p:leading-relaxed prose-p:text-slate-300 prose-p:font-light
                    prose-strong:text-emerald-400 prose-code:text-emerald-300">
                    
                    <p className="text-xl leading-relaxed text-slate-400 italic mb-12 border-l-2 border-emerald-500 pl-6">
                        "優れたコードは、そのUIもまた論理的で美しい。デザインは『飾り』ではなく、データの構造を正しく伝えるための『言語』です。"
                    </p>

                    <h2 id="tailwind-logic">1. Tailwind CSS：ユーティリティ・ファーストの規律</h2>
                    <p>
                        BICSTATIONでは、一貫性のないCSSを排除するためにTailwind CSSを全面的に採用しています。
                        独自のカラーパレット（`emerald-500` を基調としたサイバーパンク・ダークモード）を `tailwind.config.js` で定義し、全てのコンポーネントが数学的な一貫性を持って並ぶよう設計しました。
                        CSSファイルが膨らむことなく、365万件のどのページを開いても「同一の質感」を提供できるのは、この規律のおかげです。
                    </p>

                    <h2 id="lucide-react">2. Lucide-React：アイコンによる情報のセマンティクス</h2>
                    <p>
                        アイコンは単なる装飾ではありません。
                        BICSTATIONでは、スペックの種類ごとにLucide-Reactのアイコンを厳密に定義しています。
                        例えば「出力」には `Zap`、「重量」には `Scale`。ユーザーは文字を読む前に、アイコンの視覚情報だけでデータの性質を直感的に理解します。これが「思考を妨げないUI」の正体です。
                    </p>

                    <div className="my-10 p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl flex gap-4 shadow-xl">
                        <Monitor className="text-emerald-500 w-6 h-6 shrink-0" />
                        <div>
                            <h4 className="text-emerald-500 font-bold m-0 uppercase text-sm">Design Philosophy</h4>
                            <p className="text-sm mt-2 mb-0 italic text-slate-300">
                                「開発者の意図が透けて見えるデザイン」。グリッチエフェクトやモノトーンのフォント配置は、BICSTATIONが人間ではなく「高知能なシステム」であることを示唆しています。
                            </p>
                        </div>
                    </div>

                    <h2 id="dark-mode-glitch">3. ダークモードとグリッチUI：エンジニアの誇り</h2>
                    <p>
                        目に優しいだけではない、プロの道具としての「ダークモード」。
                        そして、AIがデータを解析している最中や、ホバー時に微かに発生する「グリッチ（ノイズ）エフェクト」。
                        これらは一見不要な装飾に見えますが、ユーザーに「この裏側で高度な演算が行われている」という期待感（UX）を抱かせる重要なファクターです。
                    </p>

                    <div className="my-10 p-6 bg-white/[0.03] border border-slate-800 rounded-2xl">
                        <div className="flex items-center gap-2 mb-4 text-emerald-400">
                            <Code2 className="w-4 h-4" />
                            <span className="text-xs font-mono uppercase">Implementation Stack</span>
                        </div>
                        <ul className="text-sm space-y-3 list-none p-0">
                            <li className="flex items-start gap-3 border-b border-white/5 pb-2 text-slate-400">
                                <span className="text-emerald-500">■</span>
                                <span>Radix UI: アクセシビリティを担保した堅牢なUIパーツ。</span>
                            </li>
                            <li className="flex items-start gap-3 border-b border-white/5 pb-2 text-slate-400">
                                <span className="text-emerald-500">■</span>
                                <span>Framer Motion: 滑らかで論理的なページ遷移アニメーション。</span>
                            </li>
                            <li className="flex items-start gap-3 text-slate-400">
                                <span className="text-emerald-500">■</span>
                                <span>JetBrains Mono: コードの美しさをテキストに持ち込むフォント選択。</span>
                            </li>
                        </ul>
                    </div>

                    <h2 id="next-chapter">次回、第4章突入：インフラ・デプロイ</h2>
                    <p>
                        フロントエンドが完成しました。次はこれを「世界」へ公開する番です。
                        第8回からは**第4章：インフラ・デプロイ編**。
                        Dockerを駆使して、VPS上にNext.jsとDjangoの要塞を築き上げるプロセスを詳解します。
                    </p>

                </div>

                {/* 🧭 フッターナビゲーション */}
                <footer className="mt-24 pt-12 border-t border-white/5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Link 
                            href="/series/ai-intelligence-engine/vol-6" 
                            className="group p-6 rounded-2xl border border-slate-800 bg-white/5 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all duration-300 shadow-lg shadow-black/40"
                        >
                            <span className="text-[10px] text-emerald-500 font-mono block mb-2 uppercase tracking-widest text-left">Previous Episode</span>
                            <div className="flex items-center justify-start gap-4">
                                <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-emerald-500 transition-all group-hover:-translate-x-1 rotate-180" />
                                <span className="text-white font-bold group-hover:text-emerald-400 transition-colors text-left text-sm">
                                    Vol.6 Next.js App Router による爆速SSG
                                </span>
                            </div>
                        </Link>

                        <Link 
                            href="/series/ai-intelligence-engine/vol-8" 
                            className="group p-6 rounded-2xl border border-slate-800 bg-white/5 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all duration-300 shadow-lg shadow-black/40"
                        >
                            <span className="text-[10px] text-emerald-500 font-mono block mb-2 uppercase tracking-widest text-right">Next Episode</span>
                            <div className="flex items-center justify-between gap-4">
                                <span className="text-white font-bold group-hover:text-emerald-400 transition-colors text-sm">
                                    Vol.8 Docker による環境の完全同期
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