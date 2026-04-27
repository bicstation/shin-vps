/* eslint-disable react/no-unescaped-entities */
/**
 * =====================================================================
 * 🚀 MODERN_FULLSTACK_SERIES_VOL_3_V1.0
 * 🛡️ Maya's Strategy: 365万件という「具体的な数字」に基づく最適化を提示
 * 💎 Purpose: 大規模データ処理のスキルを証明し、サイトの権威性を高める
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
    Database,
    Zap
} from 'lucide-react';
import { constructMetadata } from '@/shared/lib/utils/metadata';

export async function generateMetadata() {
    return constructMetadata({
        title: "Vol.3 365万件のデータベース高速化戦略 | BICSTATION",
        description: "PostgreSQL のインデックス設計から Django 側のチューニングまで。膨大なデータを 100ms 以内で返すための執念。",
    });
}

export default function SeriesVol3() {
    return (
        <div className="min-h-screen bg-[#0a0a0c] text-slate-300 py-12 lg:py-20 px-6">
            <article className="max-w-3xl mx-auto">
                
                {/* 🔖 ナビゲーション */}
                <nav className="flex items-center justify-between text-xs font-mono text-slate-500 mb-12 border-b border-white/5 pb-4">
                    <Link href="/series/99-archive/modern-fullstack-roadmap" className="hover:text-blue-400 flex items-center gap-1 transition-colors">
                        <List className="w-3 h-3" /> INDEX
                    </Link>
                    <span className="text-blue-500/50">MODERN_FULLSTACK // VOL.03</span>
                </nav>

                {/* 🚀 記事ヘッダー */}
                <header className="mb-16 border-l-4 border-blue-500 pl-6">
                    <h1 className="text-3xl md:text-5xl font-bold text-white mb-8 leading-tight">
                        365万件のデータベース<br />高速化戦略
                    </h1>

                    <div className="flex flex-wrap gap-6 text-xs font-mono text-slate-500">
                        <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-blue-500" /> 2026.04.15</div>
                        <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-blue-500" /> 11 MIN READ</div>
                        <div className="flex items-center gap-2"><User className="w-4 h-4 text-blue-500" /> AUTHOR: MAYA</div>
                    </div>
                </header>

                {/* 📝 本文 */}
                <div className="prose prose-invert prose-blue max-w-none 
                    prose-headings:text-white prose-headings:font-bold
                    prose-p:leading-relaxed prose-p:text-slate-300
                    prose-strong:text-blue-400 prose-code:text-blue-300">
                    
                    <p className="text-xl leading-relaxed text-slate-400 italic mb-12 border-l-2 border-blue-500 pl-6">
                        "データ量が増えることは恐怖ではありません。むしろ、設計の真価が問われる最高のステージです。"
                    </p>

                    <h2 id="index-strategy">1. インデックス：検索の高速道路を作る</h2>
                    <p>
                        単一カラムへのインデックスだけでは足りません。BICSTATIONの検索クエリを徹底的に分析し、頻出する組み合わせに対する「複合インデックス（Composite Index）」を適用。これにより、全件スキャンを回避し、365万件の中から目的のレコードをミリ秒単位で特定可能にしました。
                    </p>

                    <div className="my-10 p-6 bg-blue-500/5 border border-blue-500/20 rounded-2xl flex gap-4">
                        <Database className="text-blue-500 w-6 h-6 shrink-0" />
                        <div>
                            <h4 className="text-blue-500 font-bold m-0 uppercase text-sm">PostgreSQL Tuning</h4>
                            <p className="text-sm mt-2 mb-0">
                                実行計画（EXPLAIN ANALYZE）を読み解き、コストの高いクエリを一つずつ潰していく地道な作業。これが、ユーザーへの爆速体験に直結します。
                            </p>
                        </div>
                    </div>

                    <h2 id="django-optimization">2. Django ORM のオーバーヘッドを削る</h2>
                    <p>
                        Django の ORM は便利ですが、不用意に使うとメモリを食いつぶします。`iterator()` によるメモリ節約や、必要なカラムだけを取得する `only()` / `defer()` の活用。これら「引き算」の最適化が、VPS（メモリ8GB）のポテンシャルを最大限に引き出しました。
                    </p>

                    <div className="my-10 p-6 bg-white/5 border border-slate-800 rounded-2xl">
                        <div className="flex items-center gap-2 mb-4">
                            <Zap className="text-yellow-500 w-4 h-4" />
                            <span className="text-sm font-bold uppercase tracking-tight">Latency Breakthrough</span>
                        </div>
                        <ul className="text-sm space-y-2 list-none p-0">
                            <li className="flex justify-between border-b border-white/5 pb-1 text-slate-400">
                                <span>Initial Query Time</span>
                                <span className="text-red-400 line-through">2.4s</span>
                            </li>
                            <li className="flex justify-between border-b border-white/5 pb-1 text-slate-400">
                                <span>After Indexing</span>
                                <span className="text-yellow-400">0.45s</span>
                            </li>
                            <li className="flex justify-between text-slate-400">
                                <span>Current Response (Avg)</span>
                                <span className="text-blue-400 font-mono">0.08s</span>
                            </li>
                        </ul>
                    </div>

                    <h2 id="conclusion">3. 止まらない進化</h2>
                    <p>
                        バックエンドの高速化が完了し、次はフロントエンドへのバトンパスです。Next.js のサーバーサイドレンダリングをいかに効率化し、この大量データを美しく見せるか。挑戦は続きます。
                    </p>
                </div>

                {/* 🧭 フッターナビゲーション */}
                <footer className="mt-24 pt-12 border-t border-white/5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Link 
                            href="/series/99-archive/modern-fullstack-roadmap/vol-2" 
                            className="group p-6 rounded-2xl border border-slate-800 hover:border-blue-500/50 transition-all text-left"
                        >
                            <span className="text-[10px] text-slate-500 font-mono block mb-2">PREVIOUS</span>
                            <div className="flex items-center gap-2">
                                <ChevronLeft className="w-5 h-5 text-slate-600 group-hover:text-blue-500 transition-all group-hover:-translate-x-1" />
                                <span className="text-white font-bold group-hover:text-blue-400 transition-colors">Vol.2 Django REST 基盤</span>
                            </div>
                        </Link>
                        
                        <Link 
                            href="/series/99-archive/modern-fullstack-roadmap/vol-4" 
                            className="group p-6 rounded-2xl border border-slate-800 bg-white/5 hover:border-blue-500/50 transition-all text-right"
                        >
                            <span className="text-[10px] text-blue-500 font-mono block mb-2">NEXT</span>
                            <div className="flex items-center justify-between">
                                <span className="text-white font-bold group-hover:text-blue-400 transition-colors">Vol.4 Next.js App Router 移行</span>
                                <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-blue-500 transition-all group-hover:translate-x-1" />
                            </div>
                        </Link>
                    </div>
                </footer>
            </article>
        </div>
    );
}