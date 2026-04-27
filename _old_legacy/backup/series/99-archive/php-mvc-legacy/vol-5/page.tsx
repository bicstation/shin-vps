/* eslint-disable react/no-unescaped-entities */
/**
 * =====================================================================
 * 🛰️ PHP_MVC_SERIES_VOL_5_V1.0
 * 🛡️ Maya's Strategy: シングルトンパターンによるリソース最適化の提示
 * 💎 Purpose: セキュリティ対策（プリペアドステートメント）の実装能力を証明
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
    Database
} from 'lucide-react';
import { constructMetadata } from '@/shared/lib/utils/metadata';

export async function generateMetadata() {
    return constructMetadata({
        title: "Vol.5 PDO シングルトンと SQL インジェクション対策 | BICSTATION",
        description: "データベース接続を効率化し、脆弱性を根絶する。安全なデータアクセスのためのデザインパターン。",
    });
}

export default function SeriesVol5() {
    return (
        <div className="min-h-screen bg-[#0a0a0c] text-slate-300 py-12 lg:py-20 px-6">
            <article className="max-w-3xl mx-auto">
                
                {/* 🔖 ナビゲーション */}
                <nav className="flex items-center justify-between text-xs font-mono text-slate-500 mb-12 border-b border-white/5 pb-4">
                    <Link href="/series/99-archive/php-mvc-legacy" className="hover:text-emerald-500 flex items-center gap-1 transition-colors">
                        <List className="w-3 h-3" /> INDEX
                    </Link>
                    <span className="text-emerald-500/50">PHP_MVC_SERIES // VOL.05</span>
                </nav>

                {/* 🚀 記事ヘッダー */}
                <header className="mb-16">
                    <h1 className="text-3xl md:text-5xl font-bold text-white mb-8 leading-tight">
                        PDO シングルトンと<br />SQL インジェクション対策
                    </h1>

                    <div className="flex flex-wrap gap-6 text-xs font-mono text-slate-500">
                        <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-emerald-500" /> 2026.04.17</div>
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
                        "信頼できない入力値は、システムにとって毒です。その毒を無効化し、かつ効率的にデータを繋ぐパイプラインを構築します。"
                    </p>

                    <h2 id="singleton">1. Singleton パターンで接続を一本化</h2>
                    <p>
                        リクエストのたびに新しい DB 接続を生成するのは、リソースの無駄遣いです。`Database` クラスにシングルトンパターンを適用し、アプリケーション全体で一つの PDO インスタンスを使い回す設計にしました。これにより、接続オーバーヘッドを最小限に抑えています。
                    </p>

                    <div className="my-10 p-6 bg-white/5 border border-slate-800 rounded-2xl">
                        <div className="flex items-center gap-2 mb-4">
                            <Database className="text-emerald-500 w-5 h-5" />
                            <span className="text-sm font-bold uppercase tracking-wider text-white">Connection Logic</span>
                        </div>
                        <pre className="text-[11px] leading-tight text-emerald-300/80 bg-black/50 p-4 rounded-lg">
{`class Database {
    private static $instance = null;
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new PDO(...);
        }
        return self::$instance;
    }
}`}
                        </pre>
                    </div>

                    <h2 id="security">2. プリペアドステートメントによる防御</h2>
                    <p>
                        SQL インジェクションは、Web サイトにとって致命的な脆弱性です。動的な値を SQL に埋め込む際は、必ずプリペアドステートメントを使用し、プレースホルダによるバインド処理を徹底しました。これは、レンタルサーバー上で個人情報を守るための絶対的な「鉄則」です。
                    </p>

                    <div className="my-10 p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl flex gap-4">
                        <ShieldCheck className="text-emerald-500 w-6 h-6 shrink-0" />
                        <div>
                            <h4 className="text-emerald-500 font-bold m-0 uppercase text-sm">Security Best Practices</h4>
                            <p className="text-sm mt-2 mb-0">
                                PDO::ATTR_EMULATE_PREPARES を false に設定し、データベースエンジン側での静的プレースホルダ処理を強制。不純な文字列の実行を物理的に遮断しています。
                            </p>
                        </div>
                    </div>
                </div>

                {/* 🧭 フッターナビゲーション */}
                <footer className="mt-24 pt-12 border-t border-white/5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Link href="/series/99-archive/php-mvc-legacy/vol-4" className="group p-6 rounded-2xl border border-slate-800 hover:border-emerald-500/50 transition-all text-left">
                            <span className="text-[10px] text-slate-500 font-mono block mb-2">PREVIOUS</span>
                            <div className="flex items-center gap-2">
                                <ChevronLeft className="w-5 h-5 text-slate-600 group-hover:text-emerald-500 transition-all group-hover:-translate-x-1" />
                                <span className="text-white font-bold group-hover:text-emerald-400 transition-colors">Vol.4 ER図と正規化</span>
                            </div>
                        </Link>
                        
                        <Link href="/series/99-archive/php-mvc-legacy/vol-6" className="group p-6 rounded-2xl border border-slate-800 bg-white/5 hover:border-emerald-500/50 transition-all text-right">
                            <span className="text-[10px] text-emerald-500 font-mono block mb-2">NEXT</span>
                            <div className="flex items-center justify-between">
                                <span className="text-white font-bold group-hover:text-emerald-400 transition-colors">Vol.6 モデル層へのロジック集約</span>
                                <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-emerald-500 transition-all group-hover:translate-x-1" />
                            </div>
                        </Link>
                    </div>
                </footer>
            </article>
        </div>
    );
}