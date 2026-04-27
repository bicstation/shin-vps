/* eslint-disable react/no-unescaped-entities */
/**
 * =====================================================================
 * 🛰️ PHP_MVC_SERIES_VOL_1_V1.0
 * 🛡️ Maya's Strategy: 固定ページ方式による「コンテンツの独自性」強化
 * 💎 Purpose: 審査通過を最優先した、高密度な技術ドキュメントの実装
 * =====================================================================
 */
// /home/maya/shin-dev/shin-vps/next-bicstation/app/series/php-mvc-legacy/vol-1/page.tsx

import React from 'react';
import Link from 'next/link';
import { 
    ChevronLeft, 
    ChevronRight, 
    List, 
    Calendar, 
    Clock, 
    User, 
    AlertCircle,
    CheckCircle2
} from 'lucide-react';
import { constructMetadata } from '@/shared/lib/utils/metadata';

export async function generateMetadata() {
    return constructMetadata({
        title: "Vol.1 独学者が辿る！自作 PHP MVC の確立 | BICSTATION",
        description: "なぜフレームワークを自作したのか？レンタルサーバーの制約と向き合った技術的選択の記録。",
    });
}

export default function SeriesVol1() {
    return (
        <div className="min-h-screen bg-[#0a0a0c] text-slate-300 py-12 lg:py-20 px-6">
            <article className="max-w-3xl mx-auto">
                
                {/* 🔖 ナビゲーション */}
                <nav className="flex items-center justify-between text-xs font-mono text-slate-500 mb-12 border-b border-white/5 pb-4">
                    <Link href="/series/99-archive/php-mvc-legacy" className="hover:text-emerald-500 flex items-center gap-1 transition-colors">
                        <List className="w-3 h-3" /> INDEX
                    </Link>
                    <span className="text-emerald-500/50">PHP_MVC_SERIES // VOL.01</span>
                </nav>

                {/* 🚀 記事ヘッダー */}
                <header className="mb-16">
                    <h1 className="text-3xl md:text-5xl font-bold text-white mb-8 leading-tight">
                        独学者が辿る！自作 PHP MVC の確立と堅牢なデータ (1)
                    </h1>

                    <div className="flex flex-wrap gap-6 text-xs font-mono text-slate-500">
                        <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-emerald-500" /> 2026.04.13</div>
                        <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-emerald-500" /> 8 MIN READ</div>
                        <div className="flex items-center gap-2"><User className="w-4 h-4 text-emerald-500" /> AUTHOR: MAYA</div>
                    </div>
                </header>

                {/* 📝 本文：プロセとしてのスタイル適用 */}
                <div className="prose prose-invert prose-emerald max-w-none 
                    prose-headings:text-white prose-headings:font-bold
                    prose-p:leading-relaxed prose-p:text-slate-300
                    prose-strong:text-emerald-400 prose-code:text-emerald-300">
                    
                    <p className="text-xl leading-relaxed text-slate-400 italic mb-12 border-l-2 border-emerald-500 pl-6">
                        "なぜ、LaravelやSymfonyといった優れたフレームワークが溢れる現代において、あえて「自作」という茨の道を選んだのか。それは、制約の中にこそ真のエンジニアリングが宿ると信じていたからです。"
                    </p>

                    <h2 id="section1">1. レンタルサーバーという名の「制約」</h2>
                    <p>
                        当時、私がメインで利用していた環境は、SSHすら制限される一般的なレンタルサーバーでした。モダンなフレームワークは、その前提として強力なコマンドラインツールや多大なメモリを要求しますが、その「土俵」にすら立てない環境での開発を強いられていました。
                    </p>

                    <div className="my-10 p-6 bg-red-500/5 border border-red-500/20 rounded-2xl flex gap-4">
                        <AlertCircle className="text-red-500 w-6 h-6 shrink-0" />
                        <div>
                            <h4 className="text-red-500 font-bold m-0 uppercase text-sm">The Constraints</h4>
                            <ul className="text-sm mt-2 mb-0 list-none p-0 space-y-1">
                                <li>・PHPバージョンの固定（アップデートの遅れ）</li>
                                <li>・Composer利用の制限</li>
                                <li>・実行メモリ上限の低さ</li>
                            </ul>
                        </div>
                    </div>

                    <h2 id="section2">2. 「魔法」を排除し、ロジックを可視化する</h2>
                    <p>
                        多くのフレームワークは「魔法」を提供します。しかし、魔法は時にブラックボックスとなり、トラブルシューティングを困難にします。私は、<strong>リクエストの受領からレスポンスの返却まで</strong>、すべてのライフサイクルを自分の管理下に置くことを決意しました。
                    </p>

                    <div className="my-10 p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl flex gap-4">
                        <CheckCircle2 className="text-emerald-500 w-6 h-6 shrink-0" />
                        <div>
                            <h4 className="text-emerald-500 font-bold m-0 uppercase text-sm">Expected Benefits</h4>
                            <p className="text-sm mt-2 mb-0">
                                自作により、フレームワーク自体のオーバーヘッドを極限まで削ぎ落とし、そのサーバー環境における「最速」を叩き出すことが可能になりました。
                            </p>
                        </div>
                    </div>

                    <h2 id="section3">3. 堅牢なデータベース設計の第一歩</h2>
                    <p>
                        この連載で最も強調したいのは、「データ構造こそがシステムの命」であるという点です。MVCの「M（Model）」を作る前に、まずはER図を徹底的に煮詰めました。不純なデータが入り込む余地を、データベース設計の段階で排除する。この思想が、後の BICSTATION における365万件のデータ処理へと繋がっていきます。
                    </p>

                </div>

                {/* 🧭 フッターナビゲーション */}
                <footer className="mt-24 pt-12 border-t border-white/5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-6 rounded-2xl border border-dashed border-slate-800 flex items-center justify-center text-slate-600 text-sm">
                            PREVIOUS: NONE
                        </div>
                        
                        <Link 
                            href="/series/99-archive/php-mvc-legacy/vol-2" 
                            className="group p-6 rounded-2xl border border-slate-800 bg-white/5 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all"
                        >
                            <span className="text-[10px] text-emerald-500 font-mono block mb-2">NEXT EPISODE</span>
                            <div className="flex items-center justify-between">
                                <span className="text-white font-bold group-hover:text-emerald-400 transition-colors">
                                    Vol.2 ディレクトリ構造とオートローダー
                                </span>
                                <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-emerald-500 transition-all group-hover:translate-x-1" />
                            </div>
                        </Link>
                    </div>

                    <div className="mt-12 text-center">
                        <Link href="/series/99-archive/php-mvc-legacy" className="text-xs font-mono text-slate-500 hover:text-white transition-colors">
                            BACK TO SERIES INDEX
                        </Link>
                    </div>
                </footer>
            </article>
        </div>
    );
}