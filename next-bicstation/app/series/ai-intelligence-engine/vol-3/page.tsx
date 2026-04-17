/* eslint-disable react/no-unescaped-entities */
/**
 * =====================================================================
 * 🚀 NEXT_GEN_FULLSTACK_ROADMAP_VOL_3_V1.0
 * 🛡️ Maya's Logic: 「ゴミを入れればゴミが出る」を回避するデータ洗浄術
 * 💎 Purpose: 大規模データを「演算・AI」可能な資産へ変えるプロセスを提示
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
    Filter,
    Cpu,
    RefreshCw
} from 'lucide-react';
import { constructMetadata } from '@/shared/lib/utils/metadata';

export async function generateMetadata() {
    return constructMetadata({
        title: "Vol.3 365万件のデータ・クレンジングと正規化 | BICSTATION",
        description: "生データを「演算・描画・AI」といった独自指標へ変換するロジック。大規模インポートのバッチ処理ノウハウ。",
    });
}

export default function NextGenVol3() {
    return (
        <div className="min-h-screen bg-[#0a0a0c] text-slate-300 py-12 lg:py-20 px-6 font-sans">
            <article className="max-w-3xl mx-auto">
                
                {/* 🔖 ナビゲーション */}
                <nav className="flex items-center justify-between text-xs font-mono text-slate-500 mb-12 border-b border-white/5 pb-4">
                    <Link href="/series/ai-intelligence-engine" className="hover:text-emerald-400 flex items-center gap-1 transition-colors">
                        <List className="w-3 h-3" /> INDEX
                    </Link>
                    <span className="text-emerald-500/50 uppercase tracking-tighter">Roadmap // Vol.03</span>
                </nav>

                {/* 🚀 記事ヘッダー */}
                <header className="mb-16">
                    <span className="text-emerald-500 font-mono text-[10px] tracking-[0.3em] uppercase block mb-4">第1章：データ基盤</span>
                    <h1 className="text-3xl md:text-5xl font-bold text-white mb-8 leading-tight tracking-tight">
                        365万件のデータ・クレンジングと<br className="hidden md:block" />正規化の戦略
                    </h1>

                    <div className="flex flex-wrap gap-6 text-[10px] font-mono text-slate-500 uppercase">
                        <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-emerald-500" /> 2026.04.20</div>
                        <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-emerald-500" /> 9 MIN READ</div>
                        <div className="flex items-center gap-2"><User className="w-4 h-4 text-emerald-500" /> AUTHOR: MAYA</div>
                    </div>
                </header>

                {/* 📝 本文 */}
                <div className="prose prose-invert prose-emerald max-w-none 
                    prose-headings:text-white prose-headings:font-bold
                    prose-p:leading-relaxed prose-p:text-slate-300 prose-p:font-light
                    prose-strong:text-emerald-400 prose-code:text-emerald-300">
                    
                    <p className="text-xl leading-relaxed text-slate-400 italic mb-12 border-l-2 border-emerald-500 pl-6">
                        "データは『石油』に例えられますが、未精製の重油ではエンジンは動きません。AIという最新鋭のエンジンを回すには、高純度な『精製』が必要です。"
                    </p>

                    <h2 id="cleansing-logic">1. 生データを資産に変えるクレンジング・ロジック</h2>
                    <p>
                        外部から取り込んだ生データには、表記揺れ、全角半角の混在、欠損値が溢れています。これをそのままDBに放り込めば、検索機能は死に、AIは誤った回答を生成します。
                        BICSTATIONでは、DjangoのカスタムManagement Commandを駆使し、インポート時に「全自動バリデーション＆クレンジング」を実行するパイプラインを構築しました。
                    </p>

                    <div className="my-10 p-6 bg-white/[0.03] border border-slate-800 rounded-2xl flex gap-6 items-center">
                        <Filter className="text-emerald-500 w-12 h-12 shrink-0 opacity-50" />
                        <div>
                            <h4 className="text-white font-bold m-0 text-sm">Normalization Flow</h4>
                            <p className="text-xs mt-2 mb-0 text-slate-400">
                                1. 文字列の正規化（Unicode正規化）<br />
                                2. 数値型へのキャスト（「100kg」→ 100）<br />
                                3. 独自指標の算出（燃費と重量からのスコアリング）
                            </p>
                        </div>
                    </div>

                    <h2 id="batch-processing">2. 365万件をインポートする「技術」</h2>
                    <p>
                        単純な `model.save()` を365万回繰り返せば、処理が終わるまで数日かかります。
                        私たちは Django ORM の `bulk_create` と `bulk_update` を活用し、メモリ使用量を抑えるためにデータを10,000件ずつのチャンクに分割して処理。VPSの8GBメモリを限界まで使い切る並列処理を実装しました。
                    </p>

                    <h2 id="ai-ready">3. AI・描画・演算。多目的データへの正規化</h2>
                    <p>
                        BICSTATIONのDB構造は、単なる「表示用」ではありません。
                        <strong>AI（第2章）</strong>が文脈を理解しやすくするための構造化データ。
                        <strong>Next.js（第3章）</strong>が瞬時にグラフを描画するための集計済みデータ。
                        この2つの「出口」を見据えたスキーマ設計こそが、データ基盤の完成形です。
                    </p>

                    <div className="my-10 p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl flex gap-4">
                        <Cpu className="text-emerald-500 w-6 h-6 shrink-0" />
                        <div>
                            <h4 className="text-emerald-500 font-bold m-0 uppercase text-sm">Engineering Insight</h4>
                            <p className="text-sm mt-2 mb-0 italic">
                                「データの美しさは、システムの寿命に直結する」。365万件が整然と並んだDBは、もはや芸術作品です。
                            </p>
                        </div>
                    </div>

                    <h2 id="next-step">次回予告：AI解析エンジンの統合</h2>
                    <p>
                        精製されたデータが揃いました。いよいよ「BICSTATION」の頭脳、第2章が始まります。
                        第4回では、Llama 3やGPTといったLLMを解析エンジンとして統合し、冷たいスペック表を「熱量のある読み物」に変えるプロンプトエンジニアリングの極意に迫ります。
                    </p>

                </div>

                {/* 🧭 フッターナビゲーション */}
                <footer className="mt-24 pt-12 border-t border-white/5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Link 
                            href="/series/ai-intelligence-engine/vol-2" 
                            className="group p-6 rounded-2xl border border-slate-800 bg-white/5 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all duration-300 shadow-lg shadow-black/40"
                        >
                            <span className="text-[10px] text-emerald-500 font-mono block mb-2 uppercase tracking-widest">Previous Episode</span>
                            <div className="flex items-center justify-start gap-4">
                                <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-emerald-500 transition-all group-hover:-translate-x-1 rotate-180" />
                                <span className="text-white font-bold group-hover:text-emerald-400 transition-colors text-left text-sm">
                                    Vol.2 DRF による「高機動」API の構築
                                </span>
                            </div>
                        </Link>

                        <Link 
                            href="/series/ai-intelligence-engine/vol-4" 
                            className="group p-6 rounded-2xl border border-slate-800 bg-white/5 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all duration-300 shadow-lg shadow-black/40"
                        >
                            <span className="text-[10px] text-emerald-500 font-mono block mb-2 uppercase tracking-widest text-right">Next Episode</span>
                            <div className="flex items-center justify-between gap-4">
                                <span className="text-white font-bold group-hover:text-emerald-400 transition-colors text-sm">
                                    Vol.4 LLM を解析エンジンとして統合する
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