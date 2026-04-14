/* eslint-disable react/no-unescaped-entities */
/**
 * =====================================================================
 * 🛰️ REBUILD_LOGS_VOL_9_V1.1
 * 🛡️ Project: Bic-Saving / Rebuild Logs
 * 💎 Purpose: AI時代における「人間臭さ」という最強のSEO戦略
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
    Sparkles,
    BrainCircuit,
    Fingerprint
} from 'lucide-react';
import { constructMetadata } from '@/shared/lib/utils/metadata';

export async function generateMetadata() {
    return constructMetadata({
        title: "Vol.9 AI時代に「愚痴」を武器にするE-E-A-T戦略 | BIC-SAVING",
        description: "綺麗なAI文章には書けない「泥水をすすった経験」が、今のGoogleに評価される皮肉と真実。",
    });
}

export default function RebuildLogsVol9() {
    return (
        <div className="min-h-screen bg-[#0a0a0c] text-slate-300 py-12 lg:py-20 px-6">
            <article className="max-w-3xl mx-auto">
                
                {/* 🔖 ナビゲーション */}
                <nav className="flex items-center justify-between text-xs font-mono text-slate-500 mb-12 border-b border-white/5 pb-4">
                    <Link href="/series/rebuild-logs" className="hover:text-emerald-500 flex items-center gap-1 transition-colors">
                        <List className="w-3 h-3" /> INDEX
                    </Link>
                    <span className="text-emerald-500/50">REBUILD_LOGS // VOL.09</span>
                </nav>

                {/* 🚀 記事ヘッダー */}
                <header className="mb-16">
                    <h1 className="text-3xl md:text-5xl font-bold text-white mb-8 leading-tight">
                        「愚痴」と「経験」は、<br/>AIが作れない唯一の武器だ。
                    </h1>

                    <div className="flex flex-wrap gap-6 text-xs font-mono text-slate-500">
                        <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-emerald-500" /> 2026.04.21</div>
                        <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-emerald-500" /> 10 MIN READ</div>
                        <div className="flex items-center gap-2"><User className="w-4 h-4 text-emerald-500" /> AUTHOR: NABE</div>
                    </div>
                </header>

                {/* 📝 本文 */}
                <div className="prose prose-invert prose-emerald max-w-none 
                    prose-headings:text-white prose-headings:font-bold
                    prose-p:leading-relaxed prose-p:text-slate-300
                    prose-strong:text-emerald-400 prose-code:text-emerald-300">
                    
                    <p className="text-xl leading-relaxed text-slate-400 italic mb-12 border-l-2 border-emerald-500 pl-6">
                        "完璧な論理（ロジック）よりも、一滴の人間味（愚痴）の方が、時に検索エンジンの心臓を射抜くことがある。"
                    </p>

                    <h2 id="section1">1. 生成AIの限界と「一次情報」の価値</h2>
                    <p>
                        現在、ウェブ上にはAIによって生成された「完璧で退屈な文章」が溢れています。
                        しかし、Googleが今もっとも求めているのは、教科書的な正解ではなく、**「実際にそれを体験した人間にしか書けない一次情報」**です。
                        私が吐露する社会への不満や、平均給与という罠、そして「せがれに負けたくない」という親心。
                        これらはAIにはシミュレーションできない、固有のデータ……つまり **E-E-A-T（経験・専門性・権威性・信頼性）** そのものなのです。
                    </p>

                    <h2 id="section2">2. 「負の記憶」を価値に変換する</h2>
                    <p>
                        かつてGoogleに帝国を破壊された絶望や、10年間の沈黙。それらは一見「面白くない」過去かもしれません。
                        しかし、その「負の記憶」があるからこそ、Bic-Savingの「1円への拘り」には説得力が宿ります。
                        泥水をすすった経験がない人間に、本当の節約の痛みや喜びは語れません。
                        「愚痴」を単なる文句で終わらせず、ロジカルな「改善策」へと昇華させること。それが私の提唱する AI時代の生存戦略です。
                    </p>

                    <div className="my-10 p-6 bg-blue-500/5 border border-blue-500/20 rounded-2xl flex gap-4">
                        <Fingerprint className="text-blue-500 w-6 h-6 shrink-0" />
                        <div>
                            <h4 className="text-blue-500 font-bold m-0 uppercase text-sm font-mono">Human-Unique Signature</h4>
                            <p className="text-sm mt-2 mb-0">
                                誰にでも書ける正解はAIに任せればいい。私は、私にしか書けない「挫折と再起のプロセス」を、Next.jsのコードと共に刻んでいく。
                            </p>
                        </div>
                    </div>

                    <h2 id="section3">3. 技術と感情の「ハイブリッド構築」</h2>
                    <p>
                        DockerやDjangoといった冷徹な技術スタックの上に、公務員時代の違和感や、子育ての中で感じた焦燥といった熱い感情を乗せる。
                        この「温度差」こそが、読者の指を止めさせます。
                        Bic-Savingは、単なる節約ツールではありません。
                        それは、一人のエンジニアが17年の時を経て、自らの経験（エゴ）を社会の役立つ形へと再構築した、**生きたドキュメント**なのです。
                    </p>

                    <div className="my-10 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl">
                            <BrainCircuit className="w-8 h-8 text-slate-500 mb-3" />
                            <div className="text-lg font-bold text-white font-mono">AI Content</div>
                            <div className="text-xs text-slate-500 font-mono">Logical, Generic, Cold.</div>
                        </div>
                        <div className="p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl">
                            <Sparkles className="w-8 h-8 text-emerald-500 mb-3" />
                            <div className="text-lg font-bold text-white font-mono">Nabe's Experience</div>
                            <div className="text-xs text-slate-500 font-mono">Messy, Authentic, Irreplaceable.</div>
                        </div>
                    </div>

                </div>

                {/* 🧭 フッターナビゲーション */}
                <footer className="mt-24 pt-12 border-t border-white/5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Link 
                            href="/series/rebuild-logs/vol-8" 
                            className="group p-6 rounded-2xl border border-slate-800 bg-white/5 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all text-left"
                        >
                            <span className="text-[10px] text-blue-500 font-mono block mb-2 flex items-center gap-1">
                                <ChevronLeft className="w-3 h-3" /> PREVIOUS EPISODE
                            </span>
                            <span className="text-white font-bold group-hover:text-blue-400 transition-colors text-sm">
                                Vol.8 「リッター7円引き」の最適化
                            </span>
                        </Link>
                        
                        <Link 
                            href="/series/rebuild-logs/vol-10" 
                            className="group p-6 rounded-2xl border border-slate-800 bg-white/5 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all text-right"
                        >
                            <span className="text-[10px] text-emerald-500 font-mono block mb-2 flex items-center justify-end gap-1">
                                FINAL EPISODE <ChevronRight className="w-3 h-3" />
                            </span>
                            <span className="text-white font-bold group-hover:text-emerald-400 transition-colors text-sm">
                                Vol.10 BIC-SAVING 2.0 へ
                            </span>
                        </Link>
                    </div>

                    <div className="mt-12 text-center">
                        <Link href="/series/rebuild-logs" className="text-xs font-mono text-slate-500 hover:text-white transition-colors">
                            BACK TO SERIES INDEX
                        </Link>
                    </div>
                </footer>
            </article>
        </div>
    );
}