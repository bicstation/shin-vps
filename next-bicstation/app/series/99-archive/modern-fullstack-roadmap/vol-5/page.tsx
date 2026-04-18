/* eslint-disable react/no-unescaped-entities */
/**
 * =====================================================================
 * 🚀 MODERN_FULLSTACK_SERIES_VOL_5_V1.0
 * 🛡️ Maya's Strategy: Docker による環境の抽象化と再現性の提示
 * 💎 Purpose: ポート管理（8083/8000）の具体例を出し、実務レベルのスキルをアピール
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
    Box,
    Network
} from 'lucide-react';
import { constructMetadata } from '@/shared/lib/utils/metadata';

export async function generateMetadata() {
    return constructMetadata({
        title: "Vol.5 Docker による環境構築とポート運用戦略 | BICSTATION",
        description: "ローカルは 8083、VPS は 8000。コンテナ化による環境差異の吸収と、マルチコンテナ運用の勘所。",
    });
}

export default function SeriesVol5() {
    return (
        <div className="min-h-screen bg-[#0a0a0c] text-slate-300 py-12 lg:py-20 px-6">
            <article className="max-w-3xl mx-auto">
                
                {/* 🔖 ナビゲーション */}
                <nav className="flex items-center justify-between text-xs font-mono text-slate-500 mb-12 border-b border-white/5 pb-4">
                    <Link href="/series/99-archive/modern-fullstack-roadmap" className="hover:text-blue-400 flex items-center gap-1 transition-colors">
                        <List className="w-3 h-3" /> INDEX
                    </Link>
                    <span className="text-blue-500/50">MODERN_FULLSTACK // VOL.05</span>
                </nav>

                {/* 🚀 記事ヘッダー */}
                <header className="mb-16 border-l-4 border-blue-500 pl-6">
                    <h1 className="text-3xl md:text-5xl font-bold text-white mb-8 leading-tight">
                        Docker による環境構築と<br />ポート運用戦略
                    </h1>

                    <div className="flex flex-wrap gap-6 text-xs font-mono text-slate-500">
                        <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-blue-500" /> 2026.04.17</div>
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
                        "私の PC で動くものは、サーバーでも動く。Docker は『環境』という不確定要素を排除し、コードの純粋な動作を保証してくれます。"
                    </p>

                    <h2 id="why-docker">1. コンテナ化の必然性</h2>
                    <p>
                        Django、PostgreSQL、Redis、そして Next.js。これほど複雑なスタックを、OS を汚さずに共存させるには Docker が不可欠でした。PHP 時代の「サーバー設定を書き留めるメモ帳」は、今や `docker-compose.yml` という実行可能なコードへと進化しました。
                    </p>

                    <div className="my-10 p-6 bg-blue-500/5 border border-blue-500/20 rounded-2xl flex gap-4">
                        <Box className="text-blue-500 w-6 h-6 shrink-0" />
                        <div>
                            <h4 className="text-blue-500 font-bold m-0 uppercase text-sm">Container Isolation</h4>
                            <p className="text-sm mt-2 mb-0">
                                データベースとアプリケーションを分離し、独立してスケーリングさせる。このアーキテクチャが、VPS（メモリ 8GB）上での高効率な運用を支えています。
                            </p>
                        </div>
                    </div>

                    <h2 id="port-management">2. 8083 と 8000：ポート運用の知恵</h2>
                    <p>
                        開発時の混線を防ぐため、ローカル開発環境では `8083` ポートを、本番 VPS では `8000` ポートを Django API のエンドポイントとして割り当てました。環境変数（.env）を切り替えるだけで、接続先を柔軟に変更できる設計は、複数環境をまたぐ開発において必須のスキルです。
                    </p>

                    <div className="my-10 p-6 bg-white/5 border border-slate-800 rounded-2xl">
                        <div className="flex items-center gap-2 mb-4">
                            <Network className="text-blue-400 w-4 h-4" />
                            <span className="text-sm font-bold uppercase">Infrastructure Mapping</span>
                        </div>
                        <ul className="text-sm space-y-2 list-none p-0 font-mono">
                            <li className="flex justify-between border-b border-white/5 pb-1">
                                <span className="text-slate-400">Local Environment</span>
                                <span className="text-blue-400">localhost:8083</span>
                            </li>
                            <li className="flex justify-between border-b border-white/5 pb-1">
                                <span className="text-slate-400">Production (VPS)</span>
                                <span className="text-blue-400">api.bicstation.com:8000</span>
                            </li>
                        </ul>
                    </div>

                    <h2 id="conclusion">3. インフラをコード化する快感</h2>
                    <p>
                        Docker を通じてインフラを制御することは、開発の自由度を劇的に向上させます。次は、この盤石な環境の上で動く「ビジネスロジック」の核心、WordPress との共存戦略へと進みます。
                    </p>
                </div>

                {/* 🧭 フッターナビゲーション */}
                <footer className="mt-24 pt-12 border-t border-white/5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Link href="/series/99-archive/modern-fullstack-roadmap/vol-4" className="group p-6 rounded-2xl border border-slate-800 hover:border-blue-500/50 transition-all text-left">
                            <span className="text-[10px] text-slate-500 font-mono block mb-2">PREVIOUS</span>
                            <div className="flex items-center gap-2">
                                <ChevronLeft className="w-5 h-5 text-slate-600 group-hover:text-blue-500 transition-all group-hover:-translate-x-1" />
                                <span className="text-white font-bold group-hover:text-blue-400 transition-colors">Vol.4 Next.js App Router 移行</span>
                            </div>
                        </Link>
                        
                        <Link href="/series/99-archive/modern-fullstack-roadmap/vol-6" className="group p-6 rounded-2xl border border-slate-800 bg-white/5 hover:border-blue-500/50 transition-all text-right">
                            <span className="text-[10px] text-blue-500 font-mono block mb-2">NEXT</span>
                            <div className="flex items-center justify-between">
                                <span className="text-white font-bold group-hover:text-blue-400 transition-colors">Vol.6 WordPress サテライト化戦略</span>
                                <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-blue-500 transition-all group-hover:translate-x-1" />
                            </div>
                        </Link>
                    </div>
                </footer>
            </article>
        </div>
    );
}