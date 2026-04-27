/* eslint-disable react/no-unescaped-entities */
/**
 * =====================================================================
 * 🛰️ PHP_MVC_SERIES_VOL_4_V1.0
 * 🛡️ Maya's Strategy: データベース設計の「正規化」による設計思想の提示
 * 💎 Purpose: 堅牢なデータ構造がシステムの寿命を決めることを技術的に証明
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
    DatabaseZap,
    Table2
} from 'lucide-react';
import { constructMetadata } from '@/shared/lib/utils/metadata';

export async function generateMetadata() {
    return constructMetadata({
        title: "Vol.4 ER図で描くデータの真の姿と正規化 | BICSTATION",
        description: "コードを書く前に、まず図を引く。不純なデータを許さない、第三正規化を越えた設計のプロセス。",
    });
}

export default function SeriesVol4() {
    return (
        <div className="min-h-screen bg-[#0a0a0c] text-slate-300 py-12 lg:py-20 px-6">
            <article className="max-w-3xl mx-auto">
                
                {/* 🔖 ナビゲーション */}
                <nav className="flex items-center justify-between text-xs font-mono text-slate-500 mb-12 border-b border-white/5 pb-4">
                    <Link href="/series/99-archive/php-mvc-legacy" className="hover:text-emerald-500 flex items-center gap-1 transition-colors">
                        <List className="w-3 h-3" /> INDEX
                    </Link>
                    <span className="text-emerald-500/50">PHP_MVC_SERIES // VOL.04</span>
                </nav>

                {/* 🚀 記事ヘッダー */}
                <header className="mb-16">
                    <h1 className="text-3xl md:text-5xl font-bold text-white mb-8 leading-tight">
                        ER図で描くデータの真の姿と<br />正規化のプロセス
                    </h1>

                    <div className="flex flex-wrap gap-6 text-xs font-mono text-slate-500">
                        <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-emerald-500" /> 2026.04.16</div>
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
                        "コードは書き直せますが、一度汚れたデータ構造を直すには多大な苦痛が伴います。だからこそ、最初の一歩は SQL ではなく『図』であるべきです。"
                    </p>

                    <h2 id="normalization">1. 「1事実1箇所」の原則</h2>
                    <p>
                        データの冗長性を排除する「第三正規化」を徹底しました。カテゴリ名、タグ情報、投稿本文。これらを適切なテーブルに切り分け、リレーションシップ（外部キー制約）を張ることで、更新時の不整合をシステムレベルで防止する設計を追求しました。
                    </p>

                    <div className="my-10 p-6 bg-white/5 border border-slate-800 rounded-2xl">
                        <div className="flex items-center gap-2 mb-4">
                            <Table2 className="text-emerald-500 w-5 h-5" />
                            <span className="text-sm font-bold uppercase tracking-wider text-white">Schema Design Policy</span>
                        </div>
                        <ul className="text-sm space-y-3 list-none p-0">
                            <li className="flex gap-2 text-slate-400">
                                <span className="text-emerald-500">✔</span> 全テーブルへのプライマリキー設定と型の厳密化
                            </li>
                            <li className="flex gap-2 text-slate-400">
                                <span className="text-emerald-500">✔</span> 外部キーによる参照整合性の担保
                            </li>
                            <li className="flex gap-2 text-slate-400">
                                <span className="text-emerald-500">✔</span> 適切なインデックス対象カラムの事前選定
                            </li>
                        </ul>
                    </div>

                    <h2 id="er-diagram">2. 脳内の構造を可視化する</h2>
                    <p>
                        ER図を描く過程で、自分でも気づいていなかった「ビジネスロジックの矛盾」が次々と浮き彫りになりました。この設計段階での試行錯誤が、後の BICSTATION における365万件という巨大なデータセットの管理基盤となりました。
                    </p>

                    <div className="my-10 p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl flex gap-4">
                        <DatabaseZap className="text-emerald-500 w-6 h-6 shrink-0" />
                        <div>
                            <h4 className="text-emerald-500 font-bold m-0 uppercase text-sm">Long-term Scalability</h4>
                            <p className="text-sm mt-2 mb-0">
                                正規化されたデータ構造は、将来的な機能拡張（例：多言語対応や複雑な検索条件）にも柔軟に対応できる「余白」をシステムに与えてくれます。
                            </p>
                        </div>
                    </div>
                </div>

                {/* 🧭 フッターナビゲーション */}
                <footer className="mt-24 pt-12 border-t border-white/5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Link href="/series/99-archive/php-mvc-legacy/vol-3" className="group p-6 rounded-2xl border border-slate-800 hover:border-emerald-500/50 transition-all text-left">
                            <span className="text-[10px] text-slate-500 font-mono block mb-2">PREVIOUS</span>
                            <div className="flex items-center gap-2">
                                <ChevronLeft className="w-5 h-5 text-slate-600 group-hover:text-emerald-500 transition-all group-hover:-translate-x-1" />
                                <span className="text-white font-bold group-hover:text-emerald-400 transition-colors">Vol.3 ルーティングの実装</span>
                            </div>
                        </Link>
                        
                        <Link href="/series/99-archive/php-mvc-legacy/vol-5" className="group p-6 rounded-2xl border border-slate-800 bg-white/5 hover:border-emerald-500/50 transition-all text-right">
                            <span className="text-[10px] text-emerald-500 font-mono block mb-2">NEXT</span>
                            <div className="flex items-center justify-between">
                                <span className="text-white font-bold group-hover:text-emerald-400 transition-colors">Vol.5 PDO シングルトンと SQL 対策</span>
                                <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-emerald-500 transition-all group-hover:translate-x-1" />
                            </div>
                        </Link>
                    </div>
                </footer>
            </article>
        </div>
    );
}