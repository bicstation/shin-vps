/* eslint-disable react/no-unescaped-entities */
/**
 * =====================================================================
 * 🛰️ PHP_MVC_SERIES_VOL_3_V1.0
 * 🛡️ Maya's Strategy: .htaccess と正規表現による「URLの美学」を提示
 * 💎 Purpose: フロントコントローラーパターンの核心部を詳解し、設計能力をアピール
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
    Shuffle,
    Anchor
} from 'lucide-react';
import { constructMetadata } from '@/shared/lib/utils/metadata';

export async function generateMetadata() {
    return constructMetadata({
        title: "Vol.3 ルーティングの実装とフロントコントローラー | BICSTATION",
        description: "すべてのリクエストを index.php へ。URLの正規化と、動的パラメータを Controller へ渡すまでの舞台裏。",
    });
}

export default function SeriesVol3() {
    return (
        <div className="min-h-screen bg-[#0a0a0c] text-slate-300 py-12 lg:py-20 px-6">
            <article className="max-w-3xl mx-auto">
                
                {/* 🔖 ナビゲーション */}
                <nav className="flex items-center justify-between text-xs font-mono text-slate-500 mb-12 border-b border-white/5 pb-4">
                    <Link href="/series/99-archive/php-mvc-legacy" className="hover:text-emerald-500 flex items-center gap-1 transition-colors">
                        <List className="w-3 h-3" /> INDEX
                    </Link>
                    <span className="text-emerald-500/50">PHP_MVC_SERIES // VOL.03</span>
                </nav>

                {/* 🚀 記事ヘッダー */}
                <header className="mb-16">
                    <h1 className="text-3xl md:text-5xl font-bold text-white mb-8 leading-tight">
                        ルーティングの実装と<br />フロントコントローラー
                    </h1>

                    <div className="flex flex-wrap gap-6 text-xs font-mono text-slate-500">
                        <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-emerald-500" /> 2026.04.15</div>
                        <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-emerald-500" /> 9 MIN READ</div>
                        <div className="flex items-center gap-2"><User className="w-4 h-4 text-emerald-500" /> AUTHOR: MAYA</div>
                    </div>
                </header>

                {/* 📝 本文 */}
                <div className="prose prose-invert prose-emerald max-w-none 
                    prose-headings:text-white prose-headings:font-bold
                    prose-p:leading-relaxed prose-p:text-slate-300
                    prose-strong:text-emerald-400 prose-code:text-emerald-300">
                    
                    <p className="text-xl leading-relaxed text-slate-400 italic mb-12 border-l-2 border-emerald-500 pl-6">
                        "汚いURLは、汚い設計の証です。すべてのアクセスを一度受け止め、最適な場所へと導く『関所』。それがルーティングエンジンの役割です。"
                    </p>

                    <h2 id="htaccess">1. .htaccess によるリライトの魔法</h2>
                    <p>
                        レンタルサーバー環境において、URLから `index.php` を隠すためには Apache の `mod_rewrite` が不可欠でした。すべてのパスをフロントコントローラーに集約させることで、アプリケーション側で完全な URL 制御を可能にしました。
                    </p>

                    <div className="my-10 p-6 bg-white/5 border border-slate-800 rounded-2xl">
                        <div className="flex items-center gap-2 mb-4">
                            <Anchor className="text-emerald-500 w-5 h-5" />
                            <span className="text-sm font-bold uppercase tracking-wider text-white">Rewrite Rules</span>
                        </div>
                        <pre className="text-[11px] leading-tight text-emerald-300/80 bg-black/50 p-4 rounded-lg">
{`RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ index.php [L,QSA]`}
                        </pre>
                    </div>

                    <h2 id="router-class">2. 正規表現によるパラメータ抽出</h2>
                    <p>
                        `/post/123` という URL から `Controller: Post`, `Action: show`, `ID: 123` を導き出すために、正規表現を用いた独自のルータークラスを実装しました。これにより、静的な PHP ファイルを置くことなく、無限のページ構造を生成できる基礎が整いました。
                    </p>

                    <div className="my-10 p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl flex gap-4">
                        <Shuffle className="text-emerald-500 w-6 h-6 shrink-0" />
                        <div>
                            <h4 className="text-emerald-500 font-bold m-0 uppercase text-sm">Centralized Control</h4>
                            <p className="text-sm mt-2 mb-0">
                                全リクエストを一箇所で処理することで、ログインチェックやアクセスログの記録といった共通処理を、各ページに書く必要がなくなりました。
                            </p>
                        </div>
                    </div>

                    <h2 id="conclusion">3. 疎結合への第一歩</h2>
                    <p>
                        「URLとファイルパスを切り離す」。この一歩が、単なるスクリプトの集合体を、真のウェブアプリケーションへと昇華させました。次は、この動的なルーティングを支える「データの器」であるデータベース設計へと進みます。
                    </p>
                </div>

                {/* 🧭 フッターナビゲーション */}
                <footer className="mt-24 pt-12 border-t border-white/5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Link 
                            href="/series/99-archive/php-mvc-legacy/vol-2" 
                            className="group p-6 rounded-2xl border border-slate-800 hover:border-emerald-500/50 transition-all text-left"
                        >
                            <span className="text-[10px] text-slate-500 font-mono block mb-2">PREVIOUS</span>
                            <div className="flex items-center gap-2">
                                <ChevronLeft className="w-5 h-5 text-slate-600 group-hover:text-emerald-500 transition-all group-hover:-translate-x-1" />
                                <span className="text-white font-bold group-hover:text-emerald-400 transition-colors">Vol.2 ディレクトリとオートローダー</span>
                            </div>
                        </Link>
                        
                        <Link 
                            href="/series/99-archive/php-mvc-legacy/vol-4" 
                            className="group p-6 rounded-2xl border border-slate-800 bg-white/5 hover:border-emerald-500/50 transition-all text-right"
                        >
                            <span className="text-[10px] text-emerald-500 font-mono block mb-2">NEXT</span>
                            <div className="flex items-center justify-between">
                                <span className="text-white font-bold group-hover:text-emerald-400 transition-colors">Vol.4 ER図で描くデータの真の姿</span>
                                <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-emerald-500 transition-all group-hover:translate-x-1" />
                            </div>
                        </Link>
                    </div>
                </footer>
            </article>
        </div>
    );
}