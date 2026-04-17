/* eslint-disable react/no-unescaped-entities */
/**
 * =====================================================================
 * 🚀 NEXT_GEN_FULLSTACK_ROADMAP_VOL_8_V1.0
 * 🛡️ Maya's Logic: 「動かない」を未然に防ぐ。環境をコードで定義する。
 * 💎 Purpose: Docker ComposeによるNext.js/Django/DBの調和と安定稼働。
 * =====================================================================
 */

import React from 'react';
import Link from 'next/link';
import { 
    ChevronRight, 
    List, 
    Calendar, 
    Clock, 
    User, 
    Box,
    Server,
    HardHat,
    Terminal
} from 'lucide-react';
import { constructMetadata } from '@/shared/lib/utils/metadata';

export async function generateMetadata() {
    return constructMetadata({
        title: "Vol.8 Docker による開発・本番環境の完全同期 | BICSTATION",
        description: "VPS上でNext.js、Django、PostgreSQLを安定稼働させるDockerコンポーズ構成の全貌を公開。",
    });
}

export default function NextGenVol8() {
    return (
        <div className="min-h-screen bg-[#0a0a0c] text-slate-300 py-12 lg:py-20 px-6 font-sans">
            <article className="max-w-3xl mx-auto">
                
                {/* 🔖 ナビゲーション */}
                <nav className="flex items-center justify-between text-xs font-mono text-slate-500 mb-12 border-b border-white/5 pb-4">
                    <Link href="/series/ai-intelligence-engine" className="hover:text-emerald-400 flex items-center gap-1 transition-colors">
                        <List className="w-3 h-3" /> INDEX
                    </Link>
                    <span className="text-emerald-500/50 uppercase tracking-tighter">Roadmap // Vol.08</span>
                </nav>

                {/* 🚀 記事ヘッダー */}
                <header className="mb-16">
                    <span className="text-emerald-500 font-mono text-[10px] tracking-[0.3em] uppercase block mb-4">第4章：インフラ・デプロイ</span>
                    <h1 className="text-3xl md:text-5xl font-bold text-white mb-8 leading-tight tracking-tight">
                        Docker による開発・本番環境の<br className="hidden md:block" />完全同期ストラテジー
                    </h1>

                    <div className="flex flex-wrap gap-6 text-[10px] font-mono text-slate-500 uppercase">
                        <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-emerald-500" /> 2026.04.25</div>
                        <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-emerald-500" /> 12 MIN READ</div>
                        <div className="flex items-center gap-2"><User className="w-4 h-4 text-emerald-500" /> AUTHOR: MAYA</div>
                    </div>
                </header>

                {/* 📝 本文 */}
                <div className="prose prose-invert prose-emerald max-w-none 
                    prose-headings:text-white prose-headings:font-bold
                    prose-p:leading-relaxed prose-p:text-slate-300 prose-p:font-light
                    prose-strong:text-emerald-400 prose-code:text-emerald-300">
                    
                    <p className="text-xl leading-relaxed text-slate-400 italic mb-12 border-l-2 border-emerald-500 pl-6">
                        "『自分のマシンでは動いたのに』。この言い訳をエンジニアの辞書から消し去るのが、Dockerという魔法の箱です。"
                    </p>

                    <h2 id="container-philosophy">1. なぜ「生」のVPSにインストールしないのか？</h2>
                    <p>
                        OSのライブラリ更新や依存関係の競合は、大規模システムの安定性を奪います。
                        BICSTATIONでは、Next.js（Node.js）、Django（Python）、PostgreSQL、Redis、そしてCeleryといった全てのパーツをコンテナ化しました。
                        これにより、ローカルで書き上げたコードが、VPS上でも**寸分違わず同じ挙動**で動作することを保証しています。
                    </p>

                    <h2 id="compose-logic">2. Docker Compose：複数コンテナの指揮系統</h2>
                    <p>
                        365万件のデータを扱うBICSTATIONは、単一のアプリではありません。
                        データの「API」、表示の「フロント」、非同期処理の「ワーカー」、そして「DB」。
                        これらを `docker-compose.yml` という一枚の設計図で結びつけ、互いのネットワークを隠蔽しつつ、効率的にリソースを分け合うオーケストレーションを構築しました。
                    </p>

                    <div className="my-10 p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl flex gap-4 shadow-xl">
                        <Box className="text-emerald-500 w-6 h-6 shrink-0" />
                        <div>
                            <h4 className="text-emerald-500 font-bold m-0 uppercase text-sm">Container Architecture</h4>
                            <p className="text-sm mt-2 mb-0">
                                DBのマイグレーションからAPIの起動まで、コマンド一つで完了。この**再現性**こそが、個人開発者が複雑なフルスタック構成を一人でメンテナンスし続けられる鍵です。
                            </p>
                        </div>
                    </div>

                    <h2 id="vps-optimization">3. 有限リソース内でのリミット設定</h2>
                    <p>
                        個人開発者のVPSはメモリが限られています（BICSTATIONでは8GB〜16GB）。
                        Dockerのメモリリミット設定を駆使し、DBの暴走がNext.jsを落とさないよう、あるいはDjangoのバッチ処理がフロントエンドを重くしないよう、物理的な境界線を引いています。
                        <strong>「安定とは、制限することである」</strong>という設計思想です。
                    </p>

                    <div className="my-10 p-6 bg-white/[0.03] border border-slate-800 rounded-2xl">
                        <div className="flex items-center gap-2 mb-4 text-emerald-400">
                            <Terminal className="w-4 h-4" />
                            <span className="text-xs font-mono uppercase">Compose Snapshot</span>
                        </div>
                        <ul className="text-sm space-y-3 list-none p-0">
                            <li className="flex items-start gap-3 border-b border-white/5 pb-2 text-slate-400">
                                <span className="text-emerald-500">▶</span>
                                <span>Healthchecks: 異常検知時にコンテナを自動再起動。</span>
                            </li>
                            <li className="flex items-start gap-3 border-b border-white/5 pb-2 text-slate-400">
                                <span className="text-emerald-500">▶</span>
                                <span>Volumes: コンテナが消えても365万件のデータを失わない永続化。</span>
                            </li>
                            <li className="flex items-start gap-3 text-slate-400">
                                <span className="text-emerald-500">▶</span>
                                <span>Environment: 本番用・開発用を`.env`で瞬時に切り替え。</span>
                            </li>
                        </ul>
                    </div>

                    <h2 id="next-step">次回予告：Nginx逆プロキシとセキュリティ</h2>
                    <p>
                        コンテナ群が立ち上がったら、次はそれを「安全に」インターネットへ公開します。
                        第9回では、Nginxを最前線に配置し、SSL化（HTTPS）とAPIの隠蔽を行う、鉄壁のネットワーク設計について解説します。
                    </p>

                </div>

                {/* 🧭 フッターナビゲーション */}
                <footer className="mt-24 pt-12 border-t border-white/5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Link 
                            href="/series/ai-intelligence-engine/vol-7" 
                            className="group p-6 rounded-2xl border border-slate-800 bg-white/5 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all duration-300 shadow-lg shadow-black/40"
                        >
                            <span className="text-[10px] text-emerald-500 font-mono block mb-2 uppercase tracking-widest text-left">Previous Episode</span>
                            <div className="flex items-center justify-start gap-4">
                                <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-emerald-500 transition-all group-hover:-translate-x-1 rotate-180" />
                                <span className="text-white font-bold group-hover:text-emerald-400 transition-colors text-left text-sm">
                                    Vol.7 システム美の実装（Tailwind/Lucide）
                                </span>
                            </div>
                        </Link>

                        <Link 
                            href="/series/ai-intelligence-engine/vol-9" 
                            className="group p-6 rounded-2xl border border-slate-800 bg-white/5 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all duration-300 shadow-lg shadow-black/40"
                        >
                            <span className="text-[10px] text-emerald-500 font-mono block mb-2 uppercase tracking-widest text-right">Next Episode</span>
                            <div className="flex items-center justify-between gap-4">
                                <span className="text-white font-bold group-hover:text-emerald-400 transition-colors text-sm">
                                    Vol.9 Nginx逆プロキシとSSL・セキュリティ
                                </span>
                                <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-emerald-500 transition-all group-hover:translate-x-1" />
                            </div>
                        </Link>
                    </div>

                    <div className="mt-12 text-center">
                        <Link href="/series/ai-intelligence-engine" className="text-[10px] font-mono text-slate-600 hover:text-emerald-500 transition-colors uppercase tracking-[0.2em]">
                            Back to Roadmap Index
                        </Link>
                    </div>
                </footer>
            </article>
        </div>
    );
}