/* eslint-disable react/no-unescaped-entities */
/**
 * =====================================================================
 * 🛰️ SERIES_INDEX: SAVING_STACK (Vol.1)
 * 🛡️ Path: /app/series/saving-stack/page.tsx
 * 💎 Purpose: 家計を「システム」と捉え、技術的に支出を最小化する実践ログ
 * =====================================================================
 */

import React from 'react';
import Link from 'next/link';
import { 
    ChevronRight, 
    Terminal, 
    Database, 
    Zap, 
    Activity, 
    ArrowLeft,
    Layers
} from 'lucide-react';

const posts = [
    { 
        id: 1, 
        slug: 'vol-1', 
        title: '第1回：家計は「システム」だ。2026年版・節約技術スタックの全貌', 
        description: '節約を「リソース最適化」と定義し、全体の構成図（アーキテクチャ）を提示する導入編。',
        status: 'Ready'
    },
    { 
        id: 2, 
        slug: 'vol-2', 
        title: '第2回：ガソリン代リッター7円引きの「物理レイヤー」攻略', 
        description: 'EneKeyと公式アプリの紐付け、店舗での最速・最安決済フローの構築。',
        status: 'Ready'
    },
    { 
        id: 3, 
        slug: 'vol-3', 
        title: '第3回：給油決済の「バックエンド」に三井住友カードを選ぶ理由', 
        description: 'クレジットカード側の還元を含めた、実質割引率10%超えのロジカル解説。',
        status: 'Ready'
    },
    { 
        id: 4, 
        slug: 'vol-4', 
        title: '第4回：Amazon×ドコモ提携をフル活用する「d払い」設定術', 
        description: 'Amazonプライム特典とdポイントを二重取りするための連携設定。',
        status: 'Draft'
    },
    { 
        id: 5, 
        slug: 'vol-5', 
        title: '第5回：Amazonの「バッチ処理」で還元率を最大化せよ', 
        description: '1回5,000円以上の条件をクリアするための、効率的な「まとめ買い」管理。',
        status: 'Draft'
    },
    { 
        id: 6, 
        slug: 'vol-6', 
        title: '第6回：Netflix代を「爆上げセレクション」で最大20%還元する', 
        description: 'ドコモ経由へのアカウント移行（マイグレーション）手順と還元の仕組み。',
        status: 'Draft'
    },
    { 
        id: 7, 
        slug: 'vol-7', 
        title: '第7回：エンタメ代の最適化：YouTube PremiumやDAZNのパッチ当て', 
        description: '複数のサブスクをドコモ経済圏へ統合・最適化する横断的戦略。',
        status: 'Draft'
    },
    { 
        id: 8, 
        slug: 'vol-8', 
        title: '第8回：三井住友カード「7%還元」対象店舗を網羅する', 
        description: 'コンビニ・飲食店でのスマホタッチ決済を「常習化」させる習慣のデザイン。',
        status: 'Draft'
    },
    { 
        id: 9, 
        slug: 'vol-9', 
        title: '第9回：Vポイントとdポイントの「出口戦略」：資産へのデプロイ', 
        description: '貯まったポイントをSBI証券等で投資回し、資産を再生産するフロー。',
        status: 'Draft'
    },
    { 
        id: 10, 
        slug: 'vol-10', 
        title: '第10回：家計の「ダッシュボード化」と月次メンテナンス', 
        description: '年間の削減効果まとめと、法改正やキャンペーン終了に伴う保守の考え方。',
        status: 'Draft'
    },
];

export default function SavingStackIndexPage() {
    return (
        <div className="min-h-screen bg-[#0a0a0c] text-slate-300 py-12 lg:py-24 px-6 font-sans">
            <div className="max-w-4xl mx-auto">
                
                {/* 🔙 Navigation */}
                <Link href="/" className="inline-flex items-center gap-2 text-xs font-mono text-slate-500 hover:text-emerald-500 transition-colors mb-12 group">
                    <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" /> BACK TO ROOT_SYSTEM
                </Link>

                {/* 🚀 Header */}
                <header className="mb-20">
                    <div className="flex items-center gap-3 text-emerald-500 font-mono text-xs mb-4 tracking-[0.2em]">
                        <Layers className="w-4 h-4" /> SERIES_01: SAVING_STACK
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6 leading-tight tracking-tight">
                        エンジニア式・家計最適化スタック
                    </h1>
                    <div className="h-1 w-20 bg-emerald-500 mb-8" />
                    <p className="text-slate-400 max-w-2xl text-lg leading-relaxed">
                        家計管理を「感情」から切り離し、純粋な「リソース最適化」へとコンパイルする。
                        2026年現在の最強決済基盤を駆使した、エンジニアのための家計デバッグ・ログ。
                    </p>
                </header>

                {/* 🗂️ Post Grid */}
                <div className="grid gap-4">
                    {posts.map((post) => (
                        <Link 
                            key={post.id} 
                            href={`/series/saving-stack/${post.slug}`} 
                            className="group relative p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-emerald-500/30 transition-all"
                        >
                            <div className="flex items-start justify-between">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] font-mono font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                                            {String(post.id).padStart(2, '0')}
                                        </span>
                                        {post.status === 'Draft' && (
                                            <span className="text-[10px] font-mono text-slate-600 animate-pulse">
                                                [DEV_MODE: DRAFT]
                                            </span>
                                        )}
                                    </div>
                                    <h2 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">
                                        {post.title}
                                    </h2>
                                    <p className="text-sm text-slate-500 leading-relaxed max-w-2xl">
                                        {post.description}
                                    </p>
                                </div>
                                <div className="mt-1">
                                    <ChevronRight className="w-5 h-5 text-slate-700 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                                </div>
                            </div>
                            
                            {/* Background Decal */}
                            <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                <Activity className="w-24 h-24 text-emerald-500/5 -rotate-12 translate-x-8 -translate-y-8" />
                            </div>
                        </Link>
                    ))}
                </div>

                {/* 🛡️ Footer */}
                <footer className="mt-32 pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-mono text-slate-600 tracking-widest uppercase">
                    <p>© 2026 BIC-SAVING // CORE_SYSTEM_REBUILT</p>
                    <div className="flex gap-8">
                        <span className="flex items-center gap-2"><Database className="w-3 h-3" /> STACK: NEXT.JS 15</span>
                        <span className="flex items-center gap-2"><Zap className="w-3 h-3" /> STATUS: DEPLOYED</span>
                    </div>
                </footer>
            </div>
        </div>
    );
}