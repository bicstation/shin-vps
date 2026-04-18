/* eslint-disable react/no-unescaped-entities */
/**
 * =====================================================================
 * 🚀 NEXT_GEN_FULLSTACK_ROADMAP_VOL_2_V2.0
 * 🛡️ Maya's Logic: 365万件を「秒」で捌くDB戦略を提示
 * 💎 Purpose: アイキャッチ画像を追加し、バックエンドの技術的説得力を強化
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
    Database,
    Zap,
    Code2,
    TrendingUp
} from 'lucide-react';
import { constructMetadata } from '@/shared/lib/utils/metadata';

// ✅ 修正：重複を排除し、画像パス（AI CPU）を設定
export async function generateMetadata() {
    return constructMetadata({
        title: "Vol.2 DRF による「高機動」API の構築 | BICSTATION",
        description: "数百万件のレコードを高速に捌くためのDBインデックス戦略。Djangoを選ぶべき決定的な理由を解説。",
        image: "/images/series/ai-cpu-eyecatch.webp", 
    });
}

export default function NextGenVol2() {
    return (
        <div className="min-h-screen bg-[#0a0a0c] text-slate-300 py-12 lg:py-20 px-6 font-sans">
            <article className="max-w-3xl mx-auto">
                
                {/* 🔖 ナビゲーション */}
                <nav className="flex items-center justify-between text-xs font-mono text-slate-500 mb-12 border-b border-white/5 pb-4">
                    <Link href="/series/99-archive/ai-intelligence-engine" className="hover:text-emerald-400 flex items-center gap-1 transition-colors">
                        <List className="w-3 h-3" /> INDEX
                    </Link>
                    <span className="text-emerald-500/50 uppercase tracking-tighter">Roadmap // Vol.02</span>
                </nav>

                {/* 🚀 記事ヘッダー */}
                <header className="mb-16">
                    <span className="text-emerald-500 font-mono text-[10px] tracking-[0.3em] uppercase block mb-4">第1章：データ基盤</span>
                    <h1 className="text-3xl md:text-5xl font-bold text-white mb-8 leading-tight tracking-tight">
                        Django REST Framework による<br className="hidden md:block" />「高機動」API の構築
                    </h1>

                    <div className="flex flex-wrap gap-6 text-[10px] font-mono text-slate-500 uppercase mb-12">
                        <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-emerald-500" /> 2026.04.19</div>
                        <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-emerald-500" /> 10 MIN READ</div>
                        <div className="flex items-center gap-2"><User className="w-4 h-4 text-emerald-500" /> AUTHOR: MAYA</div>
                    </div>

                    {/* ✅ アイキャッチ画像（AI CPU） */}
                    <div className="relative aspect-[16/9] w-full overflow-hidden rounded-3xl border border-white/10 shadow-2xl shadow-emerald-500/10 mb-16">
                        <Image
                            src="/images/series/ai-cpu-eyecatch.webp" 
                            alt="BICSTATION Roadmap Vol.2: AI CPU and Data Analytics"
                            fill
                            className="object-cover object-center transition-transform duration-500 hover:scale-105"
                            priority
                            sizes="(max-w-768px) 100vw, 768px"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-transparent to-transparent" />
                        <div className="absolute bottom-6 left-6 flex items-center gap-3 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10">
                            <Database className="w-4 h-4 text-emerald-400" />
                            <span className="text-xs font-mono text-white uppercase tracking-widest">Backend Infrastructure</span>
                        </div>
                    </div>
                </header>

                {/* 📝 本文 */}
                <div className="prose prose-invert prose-emerald max-w-none 
                    prose-headings:text-white prose-headings:font-bold
                    prose-p:leading-relaxed prose-p:text-slate-300 prose-p:font-light
                    prose-strong:text-emerald-400 prose-code:text-emerald-300">
                    
                    <p className="text-xl leading-relaxed text-slate-400 italic mb-12 border-l-2 border-emerald-500 pl-6">
                        "365万件のデータは、ただ存在するだけでは『重り』です。適切なAPI設計こそが、その重りを『動力』に変える唯一の手段です。"
                    </p>

                    <h2 id="why-django">1. Djangoを選ぶ決定的な理由</h2>
                    <p>
                        大規模データを扱う際、生のSQLを書き続けるのは保守性の観点からリスクがあります。DjangoのORM（Object-Relational Mapping）は、型安全に近い状態でクエリを構築でき、さらに<strong>強力な管理画面（Admin）</strong>をデフォルトで備えています。
                        データ入力や修正が頻繁に発生するBICSTATIONにおいて、この「開発効率の高さ」は生命線でした。
                    </p>

                    <h2 id="index-strategy">2. 1秒の壁を超えるインデックス戦略</h2>
                    <p>
                        365万件を相手にする場合、`filter()`一つでもインデックスがなければ数秒のフリーズを招きます。
                        私たちは、検索頻度の高いカラムに対して複合インデックス（Composite Index）を適切に配置し、PostgreSQLの実行計画を最適化しました。
                    </p>

                    <div className="my-10 p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl flex gap-4">
                        <Zap className="text-emerald-500 w-6 h-6 shrink-0" />
                        <div>
                            <h4 className="text-emerald-500 font-bold m-0 uppercase text-sm">Optimization Fact</h4>
                            <p className="text-sm mt-2 mb-0">
                                インデックス適用前は4.8秒かかっていた特定スペックの絞り込みが、<strong>0.02秒（20ms）</strong>まで短縮。Next.jsへ瞬時にデータを渡す「高機動」がここで実現しました。
                            </p>
                        </div>
                    </div>

                    <h2 id="serializer">3. Serializer：データの整形工場</h2>
                    <p>
                        DRFのSerializerは、DBから取り出したレコードを、フロントエンドが最も扱いやすいJSON形式に変換する「工場」です。
                        BICSTATIONでは、無駄なフィールドを徹底的に排除し、ペイロード（通信量）を最小化。さらに、AI解析結果を動的に結合するカスタムフィールドを実装しています。
                    </p>

                    <div className="my-10 p-6 bg-white/[0.03] border border-slate-800 rounded-2xl">
                        <div className="flex items-center gap-2 mb-4 text-emerald-400">
                            <Code2 className="w-4 h-4" />
                            <span className="text-xs font-mono uppercase">Key Concept</span>
                        </div>
                        <ul className="text-sm space-y-3 list-none p-0">
                            <li className="flex items-start gap-3 border-b border-white/5 pb-2 text-slate-400">
                                <span className="text-emerald-500">■</span>
                                <span>Pagination: 巨大データを一度に返さない「ページネーション」の徹底。</span>
                            </li>
                            <li className="flex items-start gap-3 border-b border-white/5 pb-2 text-slate-400">
                                <span className="text-emerald-500">■</span>
                                <span>Select Related: N+1問題を解決する結合クエリの最適化。</span>
                            </li>
                            <li className="flex items-start gap-3 text-slate-400">
                                <span className="text-emerald-500">■</span>
                                <span>Throttle: APIの乱用を防ぎ、VPSの資源を守るレート制限。</span>
                            </li>
                        </ul>
                    </div>

                    <h2 id="next-step">次回予告：データ・クレンジングの全貌</h2>
                    <p>
                        APIという出口が整ったら、次は「中身」を磨き上げます。
                        第3回では、バラバラな生データをどのようにAIが扱いやすい形にクレンジングし、正規化していくのか。その具体的なバッチ処理のノウハウを公開します。
                    </p>

                </div>

                {/* 🧭 フッターナビゲーション */}
                <footer className="mt-24 pt-12 border-t border-white/5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Link 
                            href="/series/99-archive/ai-intelligence-engine/vol-1" 
                            className="group p-6 rounded-2xl border border-slate-800 bg-white/5 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all duration-300 shadow-lg shadow-black/40"
                        >
                            <span className="text-[10px] text-emerald-500 font-mono block mb-2 uppercase tracking-widest">Previous Episode</span>
                            <div className="flex items-center justify-start gap-4">
                                <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-emerald-500 transition-all group-hover:-translate-x-1 rotate-180" />
                                <span className="text-white font-bold group-hover:text-emerald-400 transition-colors text-left">
                                    Vol.1 なぜ今、Next.js × Django なのか？
                                </span>
                            </div>
                        </Link>

                        <Link 
                            href="/series/99-archive/ai-intelligence-engine/vol-3" 
                            className="group p-6 rounded-2xl border border-slate-800 bg-white/5 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all duration-300 shadow-lg shadow-black/40"
                        >
                            <span className="text-[10px] text-emerald-500 font-mono block mb-2 uppercase tracking-widest text-right">Next Episode</span>
                            <div className="flex items-center justify-between gap-4">
                                <span className="text-white font-bold group-hover:text-emerald-400 transition-colors">
                                    Vol.3 365万件のデータ・クレンジング
                                </span>
                                <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-emerald-500 transition-all group-hover:translate-x-1" />
                            </div>
                        </Link>
                    </div>

                    <div className="mt-12 text-center">
                        <Link href="/series/99-archive/ai-intelligence-engine" className="text-[10px] font-mono text-slate-600 hover:text-emerald-500 transition-colors uppercase tracking-[0.2em]">
                            Back to Roadmap Index
                        </Link>
                    </div>
                </footer>
            </article>
        </div>
    );
}