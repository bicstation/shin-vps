/* eslint-disable react/no-unescaped-entities */
/**
 * =====================================================================
 * 🛰️ PHP_MVC_SERIES_VOL_8_V1.0
 * 🛡️ Maya's Strategy: サーバーサイドバリデーションによる「データの整合性」担保
 * 💎 Purpose: CSRF 対策やエラーハンドリングの実装により、実務的な安全性を提示
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
    CheckSquare,
    AlertCircle
} from 'lucide-react';
import { constructMetadata } from '@/shared/lib/utils/metadata';

export async function generateMetadata() {
    return constructMetadata({
        title: "Vol.8 フォーム処理とバリデーションの定石 | BICSTATION",
        description: "入力値を信じない。CSRF 対策から、ユーザーに親切なエラーフィードバックの実装まで。",
    });
}

export default function SeriesVol8() {
    return (
        <div className="min-h-screen bg-[#0a0a0c] text-slate-300 py-12 lg:py-20 px-6">
            <article className="max-w-3xl mx-auto">
                
                {/* 🔖 ナビゲーション */}
                <nav className="flex items-center justify-between text-xs font-mono text-slate-500 mb-12 border-b border-white/5 pb-4">
                    <Link href="/series/99-archive/php-mvc-legacy" className="hover:text-emerald-500 flex items-center gap-1 transition-colors">
                        <List className="w-3 h-3" /> INDEX
                    </Link>
                    <span className="text-emerald-500/50">PHP_MVC_SERIES // VOL.08</span>
                </nav>

                {/* 🚀 記事ヘッダー */}
                <header className="mb-16">
                    <h1 className="text-3xl md:text-5xl font-bold text-white mb-8 leading-tight">
                        フォーム処理と<br />バリデーションの定石
                    </h1>

                    <div className="flex flex-wrap gap-6 text-xs font-mono text-slate-500">
                        <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-emerald-500" /> 2026.04.20</div>
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
                        "バリデーションは、システムを守るための『盾』であると同時に、ユーザーを迷わせないための『ガイド』でもあります。"
                    </p>

                    <h2 id="validation-logic">1. サーバーサイド・ファースト</h2>
                    <p>
                        フロントエンドのバリデーションは回避可能です。BICSTATION の PHP MVC 構造では、Model 側にバリデーションルールを集約し、不正なデータがデータベースに到達するのを物理的に阻止する設計を徹底しました。
                    </p>

                    <div className="my-10 p-6 bg-white/5 border border-slate-800 rounded-2xl">
                        <div className="flex items-center gap-2 mb-4">
                            <CheckSquare className="text-emerald-500 w-5 h-5" />
                            <span className="text-sm font-bold uppercase tracking-wider text-white">Validation Pattern</span>
                        </div>
                        <ul className="text-sm space-y-3 list-none p-0">
                            <li className="flex gap-2 text-slate-400 border-b border-white/5 pb-2">
                                <span className="text-emerald-500 font-mono">Presence:</span> 必須項目の入力漏れチェック
                            </li>
                            <li className="flex gap-2 text-slate-400 border-b border-white/5 pb-2">
                                <span className="text-emerald-500 font-mono">Type/Format:</span> メールアドレスや数値型の厳密な検証
                            </li>
                            <li className="flex gap-2 text-slate-400">
                                <span className="text-emerald-500 font-mono">CSRF:</span> {`ワンタイムトークン`} によるクロスサイトリクエストフォージェリ対策
                            </li>
                        </ul>
                    </div>

                    <h2 id="error-handling">2. ユーザー体験を損なわないエラー処理</h2>
                    <p>
                        エラーが発生した際、入力内容を保持したまま適切なメッセージを返す「親切な設計」を実装。PHP のセッションを活用し、一時的なエラー情報を View へ橋渡しする仕組み（{`Flash Message`}）を構築しました。
                    </p>

                    <div className="my-10 p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl flex gap-4">
                        <AlertCircle className="text-emerald-500 w-6 h-6 shrink-0" />
                        <div>
                            <h4 className="text-emerald-500 font-bold m-0 uppercase text-sm">Feedback Design</h4>
                            <p className="text-sm mt-2 mb-0">
                                どこが、なぜ間違っているのか。エンジニアにしかわからないエラーではなく、ユーザーが自力で解決できる言葉で伝える。それが「品質」に繋がります。
                            </p>
                        </div>
                    </div>
                </div>

                {/* 🧭 フッターナビゲーション */}
                <footer className="mt-24 pt-12 border-t border-white/5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Link href="/series/99-archive/php-mvc-legacy/vol-7" className="group p-6 rounded-2xl border border-slate-800 hover:border-emerald-500/50 transition-all text-left">
                            <span className="text-[10px] text-slate-500 font-mono block mb-2">PREVIOUS</span>
                            <div className="flex items-center gap-2">
                                <ChevronLeft className="w-5 h-5 text-slate-600 group-hover:text-emerald-500 transition-all group-hover:-translate-x-1" />
                                <span className="text-white font-bold group-hover:text-emerald-400 transition-colors">Vol.7 テンプレートエンジン</span>
                            </div>
                        </Link>
                        
                        <Link href="/series/99-archive/php-mvc-legacy/vol-9" className="group p-6 rounded-2xl border border-slate-800 bg-white/5 hover:border-emerald-500/50 transition-all text-right">
                            <span className="text-[10px] text-emerald-500 font-mono block mb-2">NEXT</span>
                            <div className="flex items-center justify-between">
                                <span className="text-white font-bold group-hover:text-emerald-400 transition-colors">Vol.9 セッション管理と認証の深部</span>
                                <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-emerald-500 transition-all group-hover:translate-x-1" />
                            </div>
                        </Link>
                    </div>
                </footer>
            </article>
        </div>
    );
}