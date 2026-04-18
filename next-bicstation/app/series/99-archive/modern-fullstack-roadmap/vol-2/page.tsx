/* eslint-disable react/no-unescaped-entities */
/**
 * =====================================================================
 * 🚀 MODERN_FULLSTACK_SERIES_VOL_2_V1.0
 * 🛡️ Maya's Strategy: Django REST Framework の堅牢性をアピール
 * 💎 Purpose: 大規模データを安全に提供する API 基盤の設計論を詳解
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
    Braces,
    Zap
} from 'lucide-react';
import { constructMetadata } from '@/shared/lib/utils/metadata';

export async function generateMetadata() {
    return constructMetadata({
        title: "Vol.2 Django REST Framework による API 基盤の構築 | BICSTATION",
        description: "365万件のデータを Next.js へ。型安全性と柔軟なクエリを両立する Django REST Framework の実装術。",
    });
}

export default function SeriesVol2() {
    return (
        <div className="min-h-screen bg-[#0a0a0c] text-slate-300 py-12 lg:py-20 px-6">
            <article className="max-w-3xl mx-auto">
                
                {/* 🔖 ナビゲーション */}
                <nav className="flex items-center justify-between text-xs font-mono text-slate-500 mb-12 border-b border-white/5 pb-4">
                    <Link href="/series/99-archive/modern-fullstack-roadmap" className="hover:text-blue-400 flex items-center gap-1 transition-colors">
                        <List className="w-3 h-3" /> INDEX
                    </Link>
                    <span className="text-blue-500/50">MODERN_FULLSTACK // VOL.02</span>
                </nav>

                {/* 🚀 記事ヘッダー */}
                <header className="mb-16 border-l-4 border-blue-500 pl-6">
                    <h1 className="text-3xl md:text-5xl font-bold text-white mb-8 leading-tight">
                        Django REST Framework による<br />API 基盤の構築
                    </h1>

                    <div className="flex flex-wrap gap-6 text-xs font-mono text-slate-500">
                        <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-blue-500" /> 2026.04.14</div>
                        <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-blue-500" /> 8 MIN READ</div>
                        <div className="flex items-center gap-2"><User className="w-4 h-4 text-blue-500" /> AUTHOR: MAYA</div>
                    </div>
                </header>

                {/* 📝 本文 */}
                <div className="prose prose-invert prose-blue max-w-none 
                    prose-headings:text-white prose-headings:font-bold
                    prose-p:leading-relaxed prose-p:text-slate-300
                    prose-strong:text-blue-400 prose-code:text-blue-300">
                    
                    <p className="text-xl leading-relaxed text-slate-400 italic mb-12 border-l-2 border-blue-500 pl-6">
                        "フロントエンドが Next.js に進化したとしても、その背後に流れるデータの質が低ければ意味がありません。Django REST Framework は、その『データの盾』となります。"
                    </p>

                    <h2 id="why-drf">1. なぜ Django REST Framework なのか</h2>
                    <p>
                        PHP MVC編で自作したモデル層のロジックは美しかったですが、現代的な API 開発には、より強力なシリアライザーと認証認可の仕組みが必要です。DRFを採用したことで、複雑なリレーションを持つ365万件のデータを、一貫した JSON 形式で Next.js に届けることが可能になりました。
                    </p>

                    <div className="my-10 p-6 bg-blue-500/5 border border-blue-500/20 rounded-2xl flex gap-4">
                        <Braces className="text-blue-500 w-6 h-6 shrink-0" />
                        <div>
                            <h4 className="text-blue-500 font-bold m-0 uppercase text-sm">Serializer Logic</h4>
                            <p className="text-sm mt-2 mb-0">
                                入力値のバリデーション、データ変換、そして出力制御。これらをシリアライザーに集約することで、エンドポイントのコードは極限まで簡潔になります。
                            </p>
                        </div>
                    </div>

                    <h2 id="query-optimization">2. パフォーマンスへの執念</h2>
                    <p>
                        API の応答速度は 0.1秒単位で削る必要があります。Django の `select_related` や `prefetch_related` を駆使し、N+1問題を根本から解決しました。これは、レンタルサーバー時代には物理的なリソース不足で難しかった「高度なクエリ制御」です。
                    </p>

                    <div className="my-10 p-6 bg-white/5 border border-slate-800 rounded-2xl">
                        <div className="flex items-center gap-2 mb-4">
                            <Zap className="text-yellow-500 w-4 h-4" />
                            <span className="text-sm font-bold uppercase">Modern API Benefits</span>
                        </div>
                        <ul className="text-sm space-y-2 list-none p-0">
                            <li className="flex gap-2 text-slate-400 border-b border-white/5 pb-2">
                                <span className="text-blue-400">●</span> 厳密なデータ型定義によるフロントエンドとの高い親和性
                            </li>
                            <li className="flex gap-2 text-slate-400 border-b border-white/5 pb-2">
                                <span className="text-blue-400">●</span> Django 管理画面による直感的なデータメンテナンス
                            </li>
                            <li className="flex gap-2 text-slate-400">
                                <span className="text-blue-400">●</span> JWT を用いたセキュアな認証基盤
                            </li>
                        </ul>
                    </div>

                    <h2 id="to-next-gen">3. API 駆動開発への移行</h2>
                    <p>
                        サーバーサイドでの描画を主体としていた PHP 時代から、API を中心とした疎結合なアーキテクチャへ。この転換が、BICSTATION を「単なるブログ」から「動的なウェブアプリケーション」へと押し上げる鍵となりました。
                    </p>
                </div>

                {/* 🧭 フッターナビゲーション */}
                <footer className="mt-24 pt-12 border-t border-white/5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Link 
                            href="/series/99-archive/modern-fullstack-roadmap/vol-1" 
                            className="group p-6 rounded-2xl border border-slate-800 hover:border-blue-500/50 transition-all text-left"
                        >
                            <span className="text-[10px] text-slate-500 font-mono block mb-2">PREVIOUS</span>
                            <div className="flex items-center gap-2">
                                <ChevronLeft className="w-5 h-5 text-slate-600 group-hover:text-blue-500 transition-all group-hover:-translate-x-1" />
                                <span className="text-white font-bold group-hover:text-blue-400 transition-colors">Vol.1 インフラ選定</span>
                            </div>
                        </Link>
                        
                        <Link 
                            href="/series/99-archive/modern-fullstack-roadmap/vol-3" 
                            className="group p-6 rounded-2xl border border-slate-800 bg-white/5 hover:border-blue-500/50 transition-all text-right"
                        >
                            <span className="text-[10px] text-blue-500 font-mono block mb-2">NEXT</span>
                            <div className="flex items-center justify-between">
                                <span className="text-white font-bold group-hover:text-blue-400 transition-colors">Vol.3 巨大DBの高速化</span>
                                <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-blue-500 transition-all group-hover:translate-x-1" />
                            </div>
                        </Link>
                    </div>
                </footer>
            </article>
        </div>
    );
}