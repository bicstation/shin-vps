/* eslint-disable react/no-unescaped-entities */
/**
 * =====================================================================
 * 🚀 NEXT_GEN_FULLSTACK_ROADMAP_INDEX_V1.2
 * 🛡️ Maya's Mission: WordPressを超え、独自のプラットフォームを創る
 * 💎 Purpose: 365万件の運用実績を元に、次世代HPの「標準」を定義する
 * =====================================================================
 */

import React from 'react';
import Link from 'next/link';
import { 
    Rocket, 
    ChevronRight, 
    Home, 
    Terminal, 
    ArrowLeft,
    Layers,
    Database,
    Cpu,
    Monitor,
    ShieldCheck,
    PenTool
} from 'lucide-react';
import { constructMetadata } from '@/shared/lib/utils/metadata';

export async function generateMetadata() {
    return constructMetadata({
        title: "次世代フルスタックHP構築ロードマップ | 技術連載シリーズ",
        description: "WordPressを超えて、独自のデータプラットフォームを創る。365万件のデータをNext.js×Djangoで高速運用する全工程を公開。",
    });
}

export default function NextGenRoadmapIndex() {
    const roadmapEpisodes = [
        // 序章
        { 
            vol: 1, 
            phase: "序章：アーキテクチャ設計",
            title: "なぜ今、Next.js × Django なのか？", 
            summary: "WordPressの限界（DB負荷・自由度）と、365万件を扱うためのVPSリソース設計。" 
        },
        // 第1章
        { 
            vol: 2, 
            phase: "第1章：データ基盤",
            title: "DRF による「高機動」API の構築", 
            summary: "数百万件を高速に捌くDBインデックス戦略と、Djangoを選ぶべき決定的な理由。" 
        },
        { 
            vol: 3, 
            phase: "第1章：データ基盤",
            title: "365万件のデータ・クレンジングと正規化", 
            summary: "生データを「演算・描画・AI」指標へ変換するロジックとバッチ処理のノウハウ。" 
        },
        // 第2章
        { 
            vol: 4, 
            phase: "第2章：AI・インテリジェンス",
            title: "LLM を解析エンジンとして統合する", 
            summary: "Llama 3等のAIでスペック表を「読み物」に変えるプロンプトエンジニアリング術。" 
        },
        { 
            vol: 5, 
            phase: "第2章：AI・インテリジェンス",
            title: "「AIコメント」の動的UIパース術", 
            summary: "AIの長文をReactコンポーネントへ自動分配する、正規表現による高度な実装技術。" 
        },
        // 第3章
        { 
            vol: 6, 
            phase: "第3章：フロントエンド・高速化",
            title: "Next.js App Router による爆速SSG", 
            summary: "大規模サイトにおける generateStaticParams の運用とビルド時間の最適化戦略。" 
        },
        { 
            vol: 7, 
            phase: "第3章：フロントエンド・高速化",
            title: "Lucide と Tailwind によるシステム美の実装", 
            summary: "エンジニアリングの誇りを視覚化する、ダークモードとグリッチUIのデザイン哲学。" 
        },
        // 第4章
        { 
            vol: 8, 
            phase: "第4章：インフラ・デプロイ",
            title: "Docker による開発・本番環境の完全同期", 
            summary: "VPS上でNext.js/Django/PostgreSQLを安定稼働させるコンポーズ構成の全貌。" 
        },
        { 
            vol: 9, 
            phase: "第4章：インフラ・デプロイ",
            title: "Nginx 逆プロキシとセキュリティ対策", 
            summary: "独自ドメイン運用とAPIサーバー隠蔽。実運用に耐えうるネットワーク設計の極意。" 
        },
        // 最終章
        { 
            vol: 10, 
            phase: "最終章：運用・マネタイズ",
            title: "価値を最大化するメディア運営のスタンダード", 
            summary: "アドセンス審査突破から収益化まで。個人がプラットフォームを持つ意味の総括。" 
        }
    ];

    return (
        <div className="min-h-screen bg-[#0a0a0c] text-slate-300 py-12 lg:py-20 px-6">
            <div className="max-w-3xl mx-auto">
                
                <nav className="flex items-center gap-2 text-xs font-mono text-slate-500 mb-12 border-b border-white/5 pb-4">
                    <Link href="/" className="hover:text-emerald-400 flex items-center gap-1 transition-colors">
                        <Home className="w-3 h-3" /> TOP
                    </Link>
                    <ChevronRight className="w-3 h-3" />
                    <span className="text-slate-300 uppercase tracking-widest">Roadmap / Next-Gen Platform</span>
                </nav>

                <header className="mb-16">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                            <Layers className="text-emerald-500 w-8 h-8" />
                        </div>
                        <div>
                            <span className="text-emerald-500 font-mono text-[10px] tracking-[0.3em] uppercase italic">Next Evolution Roadmap</span>
                            <h1 className="text-3xl md:text-4xl font-bold text-white mt-1">
                                次世代フルスタックHP構築術
                            </h1>
                        </div>
                    </div>

                    <div className="p-6 bg-slate-900/40 border-l-4 border-emerald-500 rounded-r-xl">
                        <p className="text-sm leading-relaxed text-slate-300 italic">
                            "WordPressを超えて、独自のデータプラットフォームを創る。365万件の製品データを自在に操り、AIが解析する『BICSTATION』の全構築工程をロードマップ化しました。これがこれからの個人開発のスタンダードです。"
                        </p>
                    </div>
                </header>

                <div className="space-y-6">
                    {roadmapEpisodes.map((ep) => (
                        <Link 
                            href={`/series/ai-intelligence-engine/vol-${ep.vol}`} 
                            key={ep.vol} 
                            className="group block p-6 bg-white/[0.02] border border-slate-800 rounded-2xl hover:bg-emerald-500/[0.03] hover:border-emerald-500/30 transition-all duration-300"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="text-[9px] font-mono text-emerald-600 uppercase tracking-widest">{ep.phase}</span>
                                        <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-[10px] font-mono rounded border border-emerald-500/20">
                                            VOL.{ep.vol < 10 ? `0${ep.vol}` : ep.vol}
                                        </span>
                                    </div>
                                    <h2 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">
                                        {ep.title}
                                    </h2>
                                    <p className="text-sm text-slate-400 mt-3 leading-relaxed">
                                        {ep.summary}
                                    </p>
                                </div>
                                <div className="ml-4 mt-10 text-slate-700 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all">
                                    <ChevronRight className="w-5 h-5" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                <div className="mt-20 pt-8 border-t border-white/5 text-center">
                    <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-white transition-colors">
                        <ArrowLeft className="w-4 h-4" /> トップページへ戻る
                    </Link>
                </div>
            </div>
        </div>
    );
}