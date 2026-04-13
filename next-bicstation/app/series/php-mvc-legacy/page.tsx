/* eslint-disable react/no-unescaped-entities */
/**
 * =====================================================================
 * 🛰️ PHP_MVC_SERIES_INDEX_V1.0
 * 🛡️ Maya's Logic: 堅牢化 / 構造的導線の確保
 * 💎 Purpose: 44年の知見を体系化し、AdSense審査官に「専門性」を提示する
 * =====================================================================
 */
// /home/maya/shin-dev/shin-vps/next-bicstation/app/series/php-mvc-legacy/page.tsx

import React from 'react';
import Link from 'next/link';
import { 
    History, 
    ChevronRight, 
    Home, 
    BookOpen, 
    ArrowLeft 
} from 'lucide-react';
import { constructMetadata } from '@/shared/lib/utils/metadata';

// メタデータ生成
export async function generateMetadata() {
    return constructMetadata({
        title: "自作 PHP MVC と堅牢な DB 構築 | 技術連載シリーズ",
        description: "独学者が辿る、自作フレームワーク構築の全記録。44年のキャリアに基づいたデータベース設計とMVCの確立について解説。",
    });
}

export default function PhpMvcIndex() {
    const episodes = [
        { 
            vol: 1, 
            title: "独学者が辿る！自作 PHP MVC の確立と堅牢なデータ (1)", 
            summary: "レンタルサーバーの制約と向き合い、既存フレームワークではなく「自作」を選択した技術的背景。" 
        },
        { 
            vol: 2, 
            title: "ディレクトリ構造とオートローダーの設計", 
            summary: "PSR規格に縛られすぎず、かつメンテナンス性を損なわない独自の「物理構造」の定義。" 
        },
        { 
            vol: 3, 
            title: "ルーティングエンジンの実装と制御", 
            summary: "正規表現を用いた柔軟なURLマッピング。コントローラーへの動的なディスパッチ処理の裏側。" 
        },
        { 
            vol: 4, 
            title: "ER図で描く、データベースの真の姿", 
            summary: "「データがすべて」という信念。第3正規化を超えた、将来のスケールアウトを見据えた設計図。" 
        },
        { 
            vol: 5, 
            title: "PDOを用いた堅牢なデータベースクラス", 
            summary: "SQLインジェクション対策は当然。シングルトンパターンによる接続管理と効率的なデータ取得。" 
        },
        { 
            vol: 6, 
            title: "モデル層におけるデータの「純度」とバリデーション", 
            summary: "不純なデータをDBに入れないためのガードレール。ビジネスロジックをどこに配置すべきか。" 
        },
        { 
            vol: 7, 
            title: "ビューエンジンの構築：ロジックとデザインの分離", 
            summary: "テンプレート継承の概念をPHPで実現。デザイナーが触りやすく、かつ高速な描画を求めて。" 
        },
        { 
            vol: 8, 
            title: "セッション管理とセキュリティ・ハードニング", 
            summary: "独自トークンによるCSRF対策。ステートレスなWebの世界で、いかに「状態」を安全に守るか。" 
        },
        { 
            vol: 9, 
            title: "エラーハンドリングとロギングの戦略", 
            summary: "本番環境での「沈黙したバグ」を防ぐ。例外を捕捉し、復旧への手がかりを残すロジック。" 
        },
        { 
            vol: 10, 
            title: "自作フレームワークの完成と、次の10年への教訓", 
            summary: "半年間に及ぶ構築の総括。自作したからこそ見えた、モダンフレームワークの真価と限界。" 
        }
    ];

    return (
        <div className="min-h-screen bg-[#0a0a0c] text-slate-300 py-12 lg:py-20 px-6">
            <div className="max-w-3xl mx-auto">
                
                {/* 🛡️ パンくずリスト：審査対策 */}
                <nav className="flex items-center gap-2 text-xs font-mono text-slate-500 mb-12 border-b border-white/5 pb-4">
                    <Link href="/" className="hover:text-blue-400 flex items-center gap-1 transition-colors">
                        <Home className="w-3 h-3" /> TOP
                    </Link>
                    <ChevronRight className="w-3 h-3" />
                    <span className="text-slate-300">SERIES / PHP_MVC_LEGACY</span>
                </nav>

                {/* 🚀 タイトルセクション */}
                <header className="mb-16">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                            <History className="text-emerald-500 w-8 h-8" />
                        </div>
                        <div>
                            <span className="text-emerald-500 font-mono text-xs tracking-widest uppercase">Legacy Challenge Series</span>
                            <h1 className="text-3xl md:text-4xl font-bold text-white mt-1">
                                自作 PHP MVC と<br className="md:hidden" />堅牢な DB 構築
                            </h1>
                        </div>
                    </div>

                    <div className="p-6 bg-white/5 border-l-4 border-emerald-500 rounded-r-xl">
                        <p className="text-sm leading-relaxed text-slate-300 italic">
                            "モダンなフレームワークが当たり前になる少し前、一人のエンジニアが「真の理解」を求めてPHPでMVCフレームワークを一から構築した記録です。
                            レンタルサーバーという制限の中で、いかに堅牢で高速なシステムを作るか。その試行錯誤の全記録を公開します。"
                        </p>
                    </div>
                </header>

                {/* 📋 エピソードリスト */}
                <div className="space-y-6">
                    {episodes.map((ep) => (
                        <Link 
                            href={`/series/php-mvc-legacy/vol-${ep.vol}`} 
                            key={ep.vol} 
                            className="group block p-6 bg-white/5 border border-slate-800 rounded-2xl hover:bg-emerald-500/5 hover:border-emerald-500/30 transition-all shadow-xl shadow-black/20"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-500 text-[10px] font-mono rounded border border-emerald-500/30">
                                            VOL.{ep.vol < 10 ? `0${ep.vol}` : ep.vol}
                                        </span>
                                        <div className="h-[1px] flex-1 bg-slate-800 group-hover:bg-emerald-500/30 transition-colors" />
                                    </div>
                                    <h2 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">
                                        {ep.title}
                                    </h2>
                                    <p className="text-sm text-slate-400 mt-3 leading-relaxed">
                                        {ep.summary}
                                    </p>
                                </div>
                                <div className="ml-4 mt-8 text-slate-600 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all">
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