/* eslint-disable react/no-unescaped-entities */
/**
 * =====================================================================
 * 🛰️ PHP_MVC_SERIES_VOL_6_V1.0
 * 🛡️ Maya's Strategy: Fat Controller 回避による「保守性」の向上を提示
 * 💎 Purpose: オブジェクト指向に基づいた Model 設計の重要性を解説
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
    Blocks,
    FileCode2
} from 'lucide-react';
import { constructMetadata } from '@/shared/lib/utils/metadata';

export async function generateMetadata() {
    return constructMetadata({
        title: "Vol.6 モデル層へのロジック集約と Fat Controller 回避 | BICSTATION",
        description: "コントローラーはただの『交通整理』。ビジネスロジックを Model へ閉じ込め、テスタビリティを確保する設計術。",
    });
}

export default function SeriesVol6() {
    return (
        <div className="min-h-screen bg-[#0a0a0c] text-slate-300 py-12 lg:py-20 px-6">
            <article className="max-w-3xl mx-auto">
                
                {/* 🔖 ナビゲーション */}
                <nav className="flex items-center justify-between text-xs font-mono text-slate-500 mb-12 border-b border-white/5 pb-4">
                    <Link href="/series/99-archive/php-mvc-legacy" className="hover:text-emerald-500 flex items-center gap-1 transition-colors">
                        <List className="w-3 h-3" /> INDEX
                    </Link>
                    <span className="text-emerald-500/50">PHP_MVC_SERIES // VOL.06</span>
                </nav>

                {/* 🚀 記事ヘッダー */}
                <header className="mb-16">
                    <h1 className="text-3xl md:text-5xl font-bold text-white mb-8 leading-tight">
                        モデル層へのロジック集約と<br />Fat Controller 回避
                    </h1>

                    <div className="flex flex-wrap gap-6 text-xs font-mono text-slate-500">
                        <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-emerald-500" /> 2026.04.18</div>
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
                        "コントローラーに何百行ものコードを書くのは、指揮者が楽器を奪って自分で演奏を始めるようなものです。"
                    </p>

                    <h2 id="fat-controller">1. 指揮者に専念させる</h2>
                    <p>
                        初期の開発では、データの加工もバリデーションもすべてコントローラーに書きがちです。私はこの「Fat Controller（肥大なコントローラー）」を避け、コントローラーの責務を「リクエストを受け取り、適切なモデルを呼び出し、ビューを返す」という3点に限定しました。
                    </p>

                    <div className="my-10 p-6 bg-white/5 border border-slate-800 rounded-2xl">
                        <div className="flex items-center gap-2 mb-4">
                            <Blocks className="text-emerald-500 w-5 h-5" />
                            <span className="text-sm font-bold uppercase tracking-wider text-white">Ideal MVC Flow</span>
                        </div>
                        <ul className="text-sm space-y-3 list-none p-0">
                            <li className="flex gap-2 text-slate-400 border-b border-white/5 pb-2">
                                <strong className="text-white w-24 shrink-0">Controller:</strong> ユーザーの意図を解釈する
                            </li>
                            <li className="flex gap-2 text-slate-400 border-b border-white/5 pb-2">
                                <strong className="text-emerald-400 w-24 shrink-0">Model:</strong> データの計算・保存・ルールを担う
                            </li>
                            <li className="flex gap-2 text-slate-400">
                                <strong className="text-white w-24 shrink-0">View:</strong> モデルの状態を視覚化する
                            </li>
                        </ul>
                    </div>

                    <h2 id="domain-logic">2. ドメインロジックの隠蔽</h2>
                    <p>
                        たとえば「投稿の公開条件」などのビジネスルールは Model 内のメソッドに閉じ込めます。これにより、API 経由でも画面経由でも、同じ Model を呼び出すだけで一貫した挙動が保証されます。この設計思想が、後の BICSTATION の堅牢性を支えることになりました。
                    </p>

                    <div className="my-10 p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl flex gap-4">
                        <FileCode2 className="text-emerald-500 w-6 h-6 shrink-0" />
                        <div>
                            <h4 className="text-emerald-500 font-bold m-0 uppercase text-sm">Encapsulation Example</h4>
                            <p className="text-sm mt-2 mb-0">
                                {/* ✅ 修正点: アロー演算子を含むテキストをテンプレートリテラルで囲む */}
                                {`$post->publish()`} と呼ぶだけで、日付チェックやステータス変更、ログ記録が内部で完結する。利用側はその詳細を知る必要はありません。
                            </p>
                        </div>
                    </div>
                </div>

                {/* 🧭 フッターナビゲーション */}
                <footer className="mt-24 pt-12 border-t border-white/5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Link href="/series/99-archive/php-mvc-legacy/vol-5" className="group p-6 rounded-2xl border border-slate-800 hover:border-emerald-500/50 transition-all text-left">
                            <span className="text-[10px] text-slate-500 font-mono block mb-2">PREVIOUS</span>
                            <div className="flex items-center gap-2">
                                <ChevronLeft className="w-5 h-5 text-slate-600 group-hover:text-emerald-500 transition-all group-hover:-translate-x-1" />
                                <span className="text-white font-bold group-hover:text-emerald-400 transition-colors">Vol.5 PDO シングルトン</span>
                            </div>
                        </Link>
                        
                        <Link href="/series/99-archive/php-mvc-legacy/vol-7" className="group p-6 rounded-2xl border border-slate-800 bg-white/5 hover:border-emerald-500/50 transition-all text-right">
                            <span className="text-[10px] text-emerald-500 font-mono block mb-2">NEXT</span>
                            <div className="flex items-center justify-between">
                                <span className="text-white font-bold group-hover:text-emerald-400 transition-colors">Vol.7 テンプレートエンジンと XSS 対策</span>
                                <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-emerald-500 transition-all group-hover:translate-x-1" />
                            </div>
                        </Link>
                    </div>
                </footer>
            </article>
        </div>
    );
}