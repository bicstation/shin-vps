/* eslint-disable react/no-unescaped-entities */
/**
 * =====================================================================
 * 🚀 NEXT_GEN_FULLSTACK_ROADMAP_VOL_1_V2.0
 * 🛡️ Maya's Logic: WordPressの限界を提示し、Next.js×Djangoの優位性を確立
 * 💎 Purpose: アイキャッチ画像を追加し、専門性と「メディアとしての格」を極大化
 * =====================================================================
 */

import React from 'react';
import Link from 'next/link';
import Image from 'next/image'; // ✅ Next.jsのImageコンポーネントを追加
import { 
    ChevronRight, 
    List, 
    Calendar, 
    Clock, 
    User, 
    Zap,
    AlertTriangle,
    TrendingUp
} from 'lucide-react';
import { constructMetadata } from '@/shared/lib/utils/metadata';

// ✅ 修正：重複を排除し、画像パスを追加
export async function generateMetadata() {
    return constructMetadata({
        title: "Vol.1 なぜ今、Next.js × Django なのか？ | BICSTATION",
        description: "WordPressの限界（DB負荷・自由度）を突破し、365万件のデータを扱うためのNext.js × Djangoアーキテクチャ設計。",
        image: "/images/series/network-eyecatch.webp", // ✅ OGP画像を設定
    });
}

export default function NextGenVol1() {
    return (
        <div className="min-h-screen bg-[#0a0a0c] text-slate-300 py-12 lg:py-20 px-6 font-sans">
            <article className="max-w-3xl mx-auto">
                
                {/* 🔖 ナビゲーション */}
                <nav className="flex items-center justify-between text-xs font-mono text-slate-500 mb-12 border-b border-white/5 pb-4">
                    <Link href="/series/ai-intelligence-engine" className="hover:text-emerald-400 flex items-center gap-1 transition-colors">
                        <List className="w-3 h-3" /> INDEX
                    </Link>
                    <span className="text-emerald-500/50 uppercase tracking-tighter">Roadmap // Vol.01</span>
                </nav>

                {/* 🚀 記事ヘッダー */}
                <header className="mb-16">
                    <span className="text-emerald-500 font-mono text-[10px] tracking-[0.3em] uppercase block mb-4">序章：アーキテクチャ設計</span>
                    <h1 className="text-3xl md:text-5xl font-bold text-white mb-8 leading-tight tracking-tight">
                        なぜ今、Next.js × Django なのか？
                    </h1>

                    <div className="flex flex-wrap gap-6 text-[10px] font-mono text-slate-500 uppercase mb-12">
                        <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-emerald-500" /> 2026.04.18</div>
                        <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-emerald-500" /> 8 MIN READ</div>
                        <div className="flex items-center gap-2"><User className="w-4 h-4 text-emerald-500" /> AUTHOR: MAYA</div>
                    </div>

                    {/* ✅ アイキャッチ画像の挿入 */}
                    <div className="relative aspect-[16/9] w-full overflow-hidden rounded-3xl border border-white/10 shadow-2xl shadow-emerald-500/10 mb-16">
                        <Image
                            src="/images/series/network-eyecatch.webp" // 👈 保存した画像名に合わせてください
                            alt="BICSTATION Roadmap Vol.1: Futuristic City and Network"
                            fill
                            className="object-cover object-center transition-transform duration-500 hover:scale-105"
                            priority
                            sizes="(max-w-768px) 100vw, 768px"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-transparent to-transparent" />
                        <div className="absolute bottom-6 left-6 flex items-center gap-3 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10">
                            <TrendingUp className="w-4 h-4 text-emerald-400" />
                            <span className="text-xs font-mono text-white uppercase tracking-widest">Architecture Design</span>
                        </div>
                    </div>
                </header>

                {/* 📝 本文 */}
                <div className="prose prose-invert prose-emerald max-w-none 
                    prose-headings:text-white prose-headings:font-bold
                    prose-p:leading-relaxed prose-p:text-slate-300 prose-p:font-light
                    prose-strong:text-emerald-400 prose-code:text-emerald-300">
                    
                    <p className="text-xl leading-relaxed text-slate-400 italic mb-12 border-l-2 border-emerald-500 pl-6">
                        "数百万件のデータを自在に操り、AIがその価値を最大化する。このビジョンを実現するためには、WordPressという『完成された箱』を飛び出す必要がありました。"
                    </p>

                    <h2 id="wp-limit">1. WordPressの限界：DB負荷と自由度のトレードオフ</h2>
                    <p>
                        WordPressは素晴らしいCMSですが、数百万件のカスタムフィールドを持つデータを扱うには、RDB（MySQL）のスキーマ構造が最適化されていません。365万件のレコードを投げ込めば、管理画面は沈黙し、フロントの表示速度は壊滅的になります。
                    </p>

                    <div className="my-10 p-6 bg-red-500/5 border border-red-500/10 rounded-2xl flex gap-4">
                        <AlertTriangle className="text-red-500 w-6 h-6 shrink-0" />
                        <div>
                            <h4 className="text-red-500 font-bold m-0 uppercase text-sm">The Bottleneck</h4>
                            <p className="text-sm mt-2 mb-0 text-slate-400">
                                大規模データにおけるメタデータ検索の遅延、そしてPHPによる同期処理の限界。これが「独自のプラットフォーム」を必要とした最大の理由です。
                            </p>
                        </div>
                    </div>

                    <h2 id="django-advantage">2. Django：Pythonの知性をバックエンドに</h2>
                    <p>
                        365万件のデータを「ただ保存する」だけでなく「解析」するためには、Pythonのエコシステムが不可欠でした。Django REST Framework (DRF) を採用することで、堅牢な管理システムを維持しつつ、Next.jsへ純粋なデータ（JSON）を高速に供給するパイプラインが完成しました。
                    </p>

                    <h2 id="nextjs-advantage">3. Next.js：爆速の描画力とSEOの両立</h2>
                    <p>
                        ユーザーが求めているのは、365万ページの中から「自分の欲しい情報」に瞬時にアクセスできる体験です。Next.js 14のApp RouterによるSSG（静的サイト生成）は、数百万のページをまるで1枚の静的ファイルのように高速に配信することを可能にしました。
                    </p>

                    <div className="my-10 p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl flex gap-4 shadow-xl">
                        <Zap className="text-emerald-500 w-6 h-6 shrink-0" />
                        <div>
                            <h4 className="text-emerald-500 font-bold m-0 uppercase text-sm">Architecture Goal</h4>
                            <p className="text-sm mt-2 mb-0">
                                <strong>「解析はPython、描画はTypeScript」</strong>。この役割分担こそが、個人開発者がGoogleの評価（AdSense/SEO）を勝ち取るための現代最強の布陣です。
                            </p>
                        </div>
                    </div>

                    <h2 id="next-step">次回予告：高機動APIの構築</h2>
                    <p>
                        アーキテクチャが決まれば、次は「心臓部」の実装です。第2回では、365万件のデータを1秒以内にフロントへ届けるための、Djangoのインデックス戦略とエンドポイント設計を掘り下げます。
                    </p>

                </div>

                {/* 🧭 フッターナビゲーション */}
                <footer className="mt-24 pt-12 border-t border-white/5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-6 rounded-2xl border border-dashed border-slate-800 flex items-center justify-center text-slate-600 text-sm font-mono italic">
                            PREVIOUS: NONE (START)
                        </div>
                        
                        <Link 
                            href="/series/ai-intelligence-engine/vol-2" 
                            className="group p-6 rounded-2xl border border-slate-800 bg-white/5 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all duration-300 shadow-lg shadow-black/40"
                        >
                            <span className="text-[10px] text-emerald-500 font-mono block mb-2 uppercase tracking-widest text-right">Next Episode</span>
                            <div className="flex items-center justify-between gap-4">
                                <span className="text-white font-bold group-hover:text-emerald-400 transition-colors">
                                    Vol.2 DRF による「高機動」API の構築
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