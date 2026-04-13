/* eslint-disable react/no-unescaped-entities */
/**
 * =====================================================================
 * 🛰️ PHP_MVC_SERIES_VOL_9_V1.0
 * 🛡️ Maya's Strategy: セッション固定攻撃やハイジャックへの対策を提示
 * 💎 Purpose: 認証という繊細な機能を「自前で組む」ことで得られる深い理解を証明
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
    Fingerprint,
    Lock
} from 'lucide-react';
import { constructMetadata } from '@/shared/lib/utils/metadata';

export async function generateMetadata() {
    return constructMetadata({
        title: "Vol.9 セッション管理と認証の深部 | BICSTATION",
        description: "HTTPのステートレスを克服する。セッション固定攻撃への対策と、安全なパスワードハッシュ化の作法。",
    });
}

export default function SeriesVol9() {
    return (
        <div className="min-h-screen bg-[#0a0a0c] text-slate-300 py-12 lg:py-20 px-6">
            <article className="max-w-3xl mx-auto">
                
                {/* 🔖 ナビゲーション */}
                <nav className="flex items-center justify-between text-xs font-mono text-slate-500 mb-12 border-b border-white/5 pb-4">
                    <Link href="/series/php-mvc-legacy" className="hover:text-emerald-500 flex items-center gap-1 transition-colors">
                        <List className="w-3 h-3" /> INDEX
                    </Link>
                    <span className="text-emerald-500/50">PHP_MVC_SERIES // VOL.09</span>
                </nav>

                {/* 🚀 記事ヘッダー */}
                <header className="mb-16">
                    <h1 className="text-3xl md:text-5xl font-bold text-white mb-8 leading-tight">
                        セッション管理と<br />認証の深部
                    </h1>

                    <div className="flex flex-wrap gap-6 text-xs font-mono text-slate-500">
                        <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-emerald-500" /> 2026.04.21</div>
                        <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-emerald-500" /> 11 MIN READ</div>
                        <div className="flex items-center gap-2"><User className="w-4 h-4 text-emerald-500" /> AUTHOR: MAYA</div>
                    </div>
                </header>

                {/* 📝 本文 */}
                <div className="prose prose-invert prose-emerald max-w-none 
                    prose-headings:text-white prose-headings:font-bold
                    prose-p:leading-relaxed prose-p:text-slate-300
                    prose-strong:text-emerald-400 prose-code:text-emerald-300">
                    
                    <p className="text-xl leading-relaxed text-slate-400 italic mb-12 border-l-2 border-emerald-500 pl-6">
                        "誰がアクセスしているかを正しく知る。それはセキュリティの基本であり、パーソナライズの出発点でもあります。"
                    </p>

                    <h2 id="session-security">1. セッション固定攻撃の回避</h2>
                    <p>
                        ログイン前後でセッションIDを変えないことは、鍵を差しっぱなしにするのと同じです。BICSTATION の PHP 構造では、認証成功時に `session_regenerate_id(true)` を呼び出し、古いセッションを即座に破棄する設計を標準化しました。
                    </p>

                    <div className="my-10 p-6 bg-white/5 border border-slate-800 rounded-2xl">
                        <div className="flex items-center gap-2 mb-4">
                            <Fingerprint className="text-emerald-500 w-5 h-5" />
                            <span className="text-sm font-bold uppercase tracking-wider text-white">Auth Core Logic</span>
                        </div>
                        <ul className="text-sm space-y-3 list-none p-0">
                            <li className="flex gap-2 text-slate-400 border-b border-white/5 pb-2">
                                <span className="text-emerald-500 font-mono">Password Hashing:</span> `password_hash()` によるソルト付き暗号化
                            </li>
                            <li className="flex gap-2 text-slate-400 border-b border-white/5 pb-2">
                                <span className="text-emerald-500 font-mono">Cookie Attributes:</span> HttpOnly, Secure 属性による漏洩防止
                            </li>
                            <li className="flex gap-2 text-slate-400">
                                <span className="text-emerald-500 font-mono">Timeout:</span> 長時間放置されたセッションの自動無効化
                            </li>
                        </ul>
                    </div>

                    <h2 id="password-policy">2. 「見えない」壁を構築する</h2>
                    <p>
                        万が一データベースが流出しても、元のパスワードが特定されないよう、ストレッチング回数を調整した堅牢なハッシュ化を採用しました。自前で認証を組むことで、フレームワークの背後で何が起きているのかを「手触り感」を持って理解することができました。
                    </p>

                    <div className="my-10 p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl flex gap-4">
                        <Lock className="text-emerald-500 w-6 h-6 shrink-0" />
                        <div>
                            <h4 className="text-emerald-500 font-bold m-0 uppercase text-sm">Security Depth</h4>
                            <p className="text-sm mt-2 mb-0">
                                ログイン試行回数の制限（レートリミット）も実装。ブルートフォース攻撃から、BICSTATION のユーザーデータを守るための重層的な防御を敷いています。
                            </p>
                        </div>
                    </div>
                </div>

                {/* 🧭 フッターナビゲーション */}
                <footer className="mt-24 pt-12 border-t border-white/5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Link href="/series/php-mvc-legacy/vol-8" className="group p-6 rounded-2xl border border-slate-800 hover:border-emerald-500/50 transition-all text-left">
                            <span className="text-[10px] text-slate-500 font-mono block mb-2">PREVIOUS</span>
                            <div className="flex items-center gap-2">
                                <ChevronLeft className="w-5 h-5 text-slate-600 group-hover:text-emerald-500 transition-all group-hover:-translate-x-1" />
                                <span className="text-white font-bold group-hover:text-emerald-400 transition-colors">Vol.8 フォーム処理とバリデーション</span>
                            </div>
                        </Link>
                        
                        <Link href="/series/php-mvc-legacy/vol-10" className="group p-6 rounded-2xl border border-slate-800 bg-white/5 hover:border-emerald-500/50 transition-all text-right">
                            <span className="text-[10px] text-emerald-500 font-mono block mb-2">NEXT</span>
                            <div className="flex items-center justify-between">
                                <span className="text-white font-bold group-hover:text-emerald-400 transition-colors">Vol.10 完成：レガシーからモダンへのバトン</span>
                                <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-emerald-500 transition-all group-hover:translate-x-1" />
                            </div>
                        </Link>
                    </div>
                </footer>
            </article>
        </div>
    );
}