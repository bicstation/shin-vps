/* eslint-disable react/no-unescaped-entities */
/**
 * =====================================================================
 * 🚀 MODERN_FULLSTACK_SERIES_INDEX_V1.0
 * 🛡️ Maya's Logic: 堅牢化 / Next.js × Django 現代アーキテクチャ提示
 * 💎 Purpose: 365万件のデータを捌く実力を示し、AdSense審査を突破する
 * =====================================================================
 */
// /home/maya/shin-dev/shin-vps/next-bicstation/app/series/modern-fullstack-roadmap/page.tsx


import React from 'react';
import Link from 'next/link';
import { 
    Rocket, 
    ChevronRight, 
    Home, 
    Cpu, 
    ArrowLeft,
    Layers
} from 'lucide-react';
import { constructMetadata } from '@/shared/lib/utils/metadata';

// メタデータ生成
export async function generateMetadata() {
    return constructMetadata({
        title: "Next.js × Django 爆速 Web サイト構築 | 技術連載シリーズ",
        description: "365万件のデータを高速に捌くモダンフルスタック構成。VPS選定からDocker、Next.js 14 App Routerの実装までを網羅。",
    });
}

export default function ModernFullstackIndex() {
    const modernEpisodes = [
        { 
            vol: 1, 
            title: "インフラ選定：なぜ VPS と 8GB メモリが必要だったのか", 
            summary: "365万件のデータを高速に捌くための物理的制約。レンタルサーバーを卒業し、自由を手に入れた日。" 
        },
        { 
            vol: 2, 
            title: "Django REST Framework による API 基盤の設計", 
            summary: "疎結合なフロントとバック。型安全な通信を実現するための、堅牢なエンドポイント定義。" 
        },
        { 
            vol: 3, 
            title: "365万件の巨大データベース：高速化の限界に挑む", 
            summary: "インデックスの最適化とクエリチューニング。コンマ数秒のレスポンスを死守するための戦い。" 
        },
        { 
            vol: 4, 
            title: "Next.js 14 App Router：サーバーコンポーネントの真価", 
            summary: "SSR/ISRを駆使した爆速表示。静的生成と動的更新を両立させる、現代のフロントエンド戦略。" 
        },
        { 
            vol: 5, 
            title: "Docker によるコンテナ化と環境分離の鉄則", 
            summary: "「自分のマシンでは動く」をなくす。ローカル(8083)とVPS(8000)を繋ぐネットワーク設計。" 
        },
        { 
            vol: 6, 
            title: "WordPress を「サテライト」として活用するハイブリッド戦略", 
            summary: "運用はWP、表示はNext.js。既存資産を活かしつつ、ヘッドレスCMSとして再定義する手法。" 
        },
        { 
            vol: 7, 
            title: "ドメイン浄化：複雑なサブドメイン構成の整理術", 
            summary: "サイト環境動的判定ライブラリ(v21.6)の実装。迷子にならないルーティングの極意。" 
        },
        { 
            vol: 8, 
            title: "TypeScript によるフルスタック型安全の開発体験", 
            summary: "バックエンドの変更をフロントが検知する。バグを未然に防ぐための型定義の共有。" 
        },
        { 
            vol: 9, 
            title: "SEOとAdSense審査を勝ち抜くためのメタデータ設計", 
            summary: "クローラーに「価値あるサイト」と認めさせるための、動的なOGPとメタ情報の注入。" 
        },
        { 
            vol: 10, 
            title: "プロジェクト総括：44年の知見が結実した「BICSTATION」", 
            summary: "技術の歴史を積み上げ、未来へ。全10回を経て辿り着いた、究極の爆速サイトの全貌。" 
        }
    ];

    return (
        <div className="min-h-screen bg-[#0a0a0c] text-slate-300 py-12 lg:py-20 px-6">
            <div className="max-w-3xl mx-auto">
                
                {/* 🛡️ パンくずリスト */}
                <nav className="flex items-center gap-2 text-xs font-mono text-slate-500 mb-12 border-b border-white/5 pb-4">
                    <Link href="/" className="hover:text-blue-400 flex items-center gap-1 transition-colors">
                        <Home className="w-3 h-3" /> TOP
                    </Link>
                    <ChevronRight className="w-3 h-3" />
                    <span className="text-slate-300">SERIES / MODERN_FULLSTACK</span>
                </nav>

                {/* 🚀 タイトルセクション */}
                <header className="mb-16">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                            <Rocket className="text-blue-500 w-8 h-8" />
                        </div>
                        <div>
                            <span className="text-blue-500 font-mono text-xs tracking-widest uppercase">Modern Evolution Series</span>
                            <h1 className="text-3xl md:text-4xl font-bold text-white mt-1">
                                Next.js × Django<br className="md:hidden" />爆速 Web サイト構築
                            </h1>
                        </div>
                    </div>

                    <div className="p-6 bg-white/5 border-l-4 border-blue-500 rounded-r-xl">
                        <p className="text-sm leading-relaxed text-slate-300 italic">
                            "365万件の巨大データをどう扱うか。PHP MVCでの苦行を経て辿り着いたのは、Next.jsの描画力とDjangoの解析力を融合させた「爆速」のアーキテクチャでした。BICSTATIONの心臓部をすべて解き明かします。"
                        </p>
                    </div>
                </header>

                {/* 📋 エピソードリスト */}
                <div className="space-y-6">
                    {modernEpisodes.map((ep) => (
                        <Link 
                            href={`/series/99-archive/modern-fullstack-roadmap/vol-${ep.vol}`} 
                            key={ep.vol} 
                            className="group block p-6 bg-white/5 border border-slate-800 rounded-2xl hover:bg-blue-500/5 hover:border-blue-500/30 transition-all shadow-xl shadow-black/20"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="px-2 py-0.5 bg-blue-500/20 text-blue-500 text-[10px] font-mono rounded border border-blue-500/30">
                                            VOL.{ep.vol < 10 ? `0${ep.vol}` : ep.vol}
                                        </span>
                                        <div className="h-[1px] flex-1 bg-slate-800 group-hover:bg-blue-500/30 transition-colors" />
                                    </div>
                                    <h2 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
                                        {ep.title}
                                    </h2>
                                    <p className="text-sm text-slate-400 mt-3 leading-relaxed">
                                        {ep.summary}
                                    </p>
                                </div>
                                <div className="ml-4 mt-8 text-slate-600 group-hover:text-blue-500 group-hover:translate-x-1 transition-all">
                                    <ChevronRight className="w-5 h-5" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* 🔙 フッター導線 */}
                <div className="mt-20 pt-8 border-t border-white/5 text-center">
                    <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-white transition-colors">
                        <ArrowLeft className="w-4 h-4" /> トップページに戻る
                    </Link>
                </div>
            </div>
        </div>
    );
}