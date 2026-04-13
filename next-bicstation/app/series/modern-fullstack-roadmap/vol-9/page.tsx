/* eslint-disable react/no-unescaped-entities */
/**
 * =====================================================================
 * 🚀 MODERN_FULLSTACK_SERIES_VOL_9_V1.0
 * 🛡️ Maya's Strategy: JWT によるステートレスな認証のメリットを強調
 * 💎 Purpose: Next-auth (Auth.js) と Django 側の連携スキルをアピール
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
    ShieldCheck,
    Key
} from 'lucide-react';
import { constructMetadata } from '@/shared/lib/utils/metadata';

export async function generateMetadata() {
    return constructMetadata({
        title: "Vol.9 Django 認証と JWT セキュリティ戦略 | BICSTATION",
        description: "APIとフロントエンドを繋ぐ信頼の証。JSON Web Token を用いたステートレス認証のメリットと、その運用の妙。",
    });
}

export default function SeriesVol9() {
    return (
        <div className="min-h-screen bg-[#0a0a0c] text-slate-300 py-12 lg:py-20 px-6">
            <article className="max-w-3xl mx-auto">
                
                {/* 🔖 ナビゲーション */}
                <nav className="flex items-center justify-between text-xs font-mono text-slate-500 mb-12 border-b border-white/5 pb-4">
                    <Link href="/series/modern-fullstack-roadmap" className="hover:text-blue-400 flex items-center gap-1 transition-colors">
                        <List className="w-3 h-3" /> INDEX
                    </Link>
                    <span className="text-blue-500/50">MODERN_FULLSTACK // VOL.09</span>
                </nav>

                {/* 🚀 記事ヘッダー */}
                <header className="mb-16 border-l-4 border-blue-500 pl-6">
                    <h1 className="text-3xl md:text-5xl font-bold text-white mb-8 leading-tight">
                        Django 認証と<br />JWT セキュリティ戦略
                    </h1>

                    <div className="flex flex-wrap gap-6 text-xs font-mono text-slate-500">
                        <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-blue-500" /> 2026.04.21</div>
                        <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-blue-500" /> 9 MIN READ</div>
                        <div className="flex items-center gap-2"><User className="w-4 h-4 text-blue-500" /> AUTHOR: MAYA</div>
                    </div>
                </header>

                {/* 📝 本文 */}
                <div className="prose prose-invert prose-blue max-w-none 
                    prose-headings:text-white prose-headings:font-bold
                    prose-p:leading-relaxed prose-p:text-slate-300
                    prose-strong:text-blue-400 prose-code:text-blue-300">
                    
                    <p className="text-xl leading-relaxed text-slate-400 italic mb-12 border-l-2 border-blue-500 pl-6">
                        "認証を API 化することは、システムを重力から解放することです。JWT が、境界を越えた信頼を構築します。"
                    </p>

                    <h2 id="jwt-architecture">1. ステートレス認証の合理性</h2>
                    <p>
                        Next.js と Django API が分離された BICSTATION では、サーバー側にセッションを持たない JWT (JSON Web Token) を採用しています。認証情報をトークン化し、署名を付与してやり取りすることで、サーバー側のメモリ消費を抑えつつ、柔軟な水平スケーリングを可能にしました。
                    </p>

                    <div className="my-10 p-6 bg-blue-500/5 border border-blue-500/20 rounded-2xl flex gap-4">
                        <Key className="text-blue-500 w-6 h-6 shrink-0" />
                        <div>
                            <h4 className="text-blue-500 font-bold m-0 uppercase text-sm">Token Management</h4>
                            <p className="text-sm mt-2 mb-0">
                                Access Token (短寿命) と Refresh Token (長寿命) の使い分け。このサイクルをフロントエンドで自動化することで、高い安全性と利便性を両立させています。
                            </p>
                        </div>
                    </div>

                    <h2 id="auth-js">2. NextAuth.js による統合</h2>
                    <p>
                        フロントエンドの認証管理には Auth.js (NextAuth.js) を活用。Django API から発行された JWT を Next.js 側のセッションと同期させるカスタムプロバイダーを構築しました。これにより、サーバーサイドコンポーネントでもクライアントコンポーネントでも、ログイン状態をシームレスに取得できます。
                    </p>

                    <div className="my-10 p-6 bg-white/5 border border-slate-800 rounded-2xl">
                        <div className="flex items-center gap-2 mb-4">
                            <ShieldCheck className="text-blue-400 w-4 h-4" />
                            <span className="text-sm font-bold uppercase">Security Standards</span>
                        </div>
                        <ul className="text-sm space-y-2 list-none p-0">
                            <li className="flex justify-between border-b border-white/5 pb-1 text-slate-400">
                                <span>Token Storage</span>
                                <span className="text-blue-400 font-mono">HttpOnly Cookie</span>
                            </li>
                            <li className="flex justify-between border-b border-white/5 pb-1 text-slate-400">
                                <span>Algorithm</span>
                                <span className="text-blue-400 font-mono">HS256 / RSA</span>
                            </li>
                        </ul>
                    </div>

                    <h2 id="conclusion">3. 信頼こそがプラットフォームの魂</h2>
                    <p>
                        データの速さも美しさも、安全性の土台があってこそ輝きます。さあ、いよいよ最後のステップ。これらの全技術が統合された BICSTATION の未来、そして開発者としての「これから」について語りましょう。
                    </p>
                </div>

                {/* 🧭 フッターナビゲーション */}
                <footer className="mt-24 pt-12 border-t border-white/5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Link href="/series/modern-fullstack-roadmap/vol-8" className="group p-6 rounded-2xl border border-slate-800 hover:border-blue-500/50 transition-all text-left">
                            <span className="text-[10px] text-slate-500 font-mono block mb-2">PREVIOUS</span>
                            <div className="flex items-center gap-2">
                                <ChevronLeft className="w-5 h-5 text-slate-600 group-hover:text-blue-500 transition-all group-hover:-translate-x-1" />
                                <span className="text-white font-bold group-hover:text-blue-400 transition-colors">Vol.8 動的メタデータと SEO</span>
                            </div>
                        </Link>
                        
                        <Link href="/series/modern-fullstack-roadmap/vol-10" className="group p-6 rounded-2xl border border-slate-800 bg-white/5 hover:border-blue-500/50 transition-all text-right">
                            <span className="text-[10px] text-blue-500 font-mono block mb-2">NEXT</span>
                            <div className="flex items-center justify-between">
                                <span className="text-white font-bold group-hover:text-blue-400 transition-colors">Vol.10 総括：365万件の未来</span>
                                <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-blue-500 transition-all group-hover:translate-x-1" />
                            </div>
                        </Link>
                    </div>
                </footer>
            </article>
        </div>
    );
}