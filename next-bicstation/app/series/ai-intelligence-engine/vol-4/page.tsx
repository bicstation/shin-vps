/* eslint-disable react/no-unescaped-entities */
/**
 * =====================================================================
 * 🚀 NEXT_GEN_FULLSTACK_ROADMAP_VOL_4_V2.0
 * 🛡️ Maya's Logic: AIを単なるチャットではなく「解析エンジン」として定義
 * 💎 Purpose: スペックデータを資産化し、表示速度と独自性を両立する
 * =====================================================================
 */

import React from 'react';
import Link from 'next/link';
import Image from 'next/image'; // ✅ 追加
import { 
    ChevronRight, 
    List, 
    Calendar, 
    Clock, 
    User, 
    Brain,
    MessageSquare,
    Database,
    Cpu,
    Zap
} from 'lucide-react';
import { constructMetadata } from '@/shared/lib/utils/metadata';

// ✅ メタデータの設定：AI Brainのビジュアルを指定
export async function generateMetadata() {
    return constructMetadata({
        title: "Vol.4 LLM を解析エンジンとして統合する | BICSTATION",
        description: "スペック表を「読み物」に変えるプロンプトエンジニアリング。AI生成コンテンツを資産化するワークフロー。",
        image: "/images/series/ai-brain-eyecatch.webp", 
    });
}

export default function NextGenVol4() {
    return (
        <div className="min-h-screen bg-[#0a0a0c] text-slate-300 py-12 lg:py-20 px-6 font-sans">
            <article className="max-w-3xl mx-auto">
                
                {/* 🔖 ナビゲーション */}
                <nav className="flex items-center justify-between text-xs font-mono text-slate-500 mb-12 border-b border-white/5 pb-4">
                    <Link href="/series/ai-intelligence-engine" className="hover:text-emerald-400 flex items-center gap-1 transition-colors">
                        <List className="w-3 h-3" /> INDEX
                    </Link>
                    <span className="text-emerald-500/50 uppercase tracking-tighter">Roadmap // Vol.04</span>
                </nav>

                {/* 🚀 記事ヘッダー */}
                <header className="mb-16">
                    <span className="text-emerald-500 font-mono text-[10px] tracking-[0.3em] uppercase block mb-4">第2章：AI・インテリジェンス</span>
                    <h1 className="text-3xl md:text-5xl font-bold text-white mb-8 leading-tight tracking-tight">
                        LLM を解析エンジンとして<br className="hidden md:block" />統合するプロトコル
                    </h1>

                    <div className="flex flex-wrap gap-6 text-[10px] font-mono text-slate-500 uppercase mb-12">
                        <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-emerald-500" /> 2026.04.21</div>
                        <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-emerald-500" /> 11 MIN READ</div>
                        <div className="flex items-center gap-2"><User className="w-4 h-4 text-emerald-500" /> AUTHOR: MAYA</div>
                    </div>

                    {/* ✅ アイキャッチ画像（AI Brain / Neural Network） */}
                    <div className="relative aspect-[16/9] w-full overflow-hidden rounded-3xl border border-white/10 shadow-2xl shadow-emerald-500/10 mb-16">
                        <Image
                            src="/images/series/ai-brain-eyecatch.webp" 
                            alt="BICSTATION Roadmap Vol.4: LLM as an intelligence engine"
                            fill
                            className="object-cover object-center transition-transform duration-500 hover:scale-105"
                            priority
                            sizes="(max-w-768px) 100vw, 768px"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-transparent to-transparent" />
                        <div className="absolute bottom-6 left-6 flex items-center gap-3 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10">
                            <Brain className="w-4 h-4 text-emerald-400" />
                            <span className="text-xs font-mono text-white uppercase tracking-widest">AI Analysis Protocol</span>
                        </div>
                    </div>
                </header>

                {/* 📝 本文 */}
                <div className="prose prose-invert prose-emerald max-w-none 
                    prose-headings:text-white prose-headings:font-bold
                    prose-p:leading-relaxed prose-p:text-slate-300 prose-p:font-light
                    prose-strong:text-emerald-400 prose-code:text-emerald-300">
                    
                    <p className="text-xl leading-relaxed text-slate-400 italic mb-12 border-l-2 border-emerald-500 pl-6">
                        "スペック表の数字は嘘をつきませんが、その意味を理解できるのは人間だけでした。今までは。AIはこの『行間』を読み解く架け橋になります。"
                    </p>

                    <h2 id="ai-as-engine">1. AIはインターフェースではなく「エンジン」である</h2>
                    <p>
                        多くのサイトが「AIチャット」を設置する中、BICSTATIONは異なる道を選びました。AIをバックエンドの**解析プロセス（Batch Job）**に組み込み、365万件のデータ一つ一つに対し、文脈に基づいた解説テキストを生成しています。
                        Llama 3やGPT-4oをAPI経由で呼び出し、構造化されたスペックデータを「熱量のあるレビュー文」へと翻訳する。これが、Googleが求める「付加価値の高いコンテンツ」の正体です。
                    </p>

                    <h2 id="prompt-engineering">2. スペックを読み解くプロンプトエンジニアリング</h2>
                    <p>
                        単に「解説して」と頼むだけでは不十分です。私たちは、エンジニアとしての知見をプロンプトに注入しました。
                        「この燃費数値は同クラスの平均と比較してどうなのか？」「この重量バランスが走りにどう影響するのか？」といった**比較論的視点**をAIに与えることで、専門性の高い解析を実現しました。
                    </p>

                    <div className="my-10 p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl flex gap-4">
                        <Zap className="text-emerald-500 w-6 h-6 shrink-0" />
                        <div>
                            <h4 className="text-emerald-500 font-bold m-0 uppercase text-sm">AI Logic Asset</h4>
                            <p className="text-sm mt-2 mb-0">
                                生成されたテキストはDBに永続化されます。リクエストのたびにAIを叩くのではなく、<strong>「AIの知性を資産として蓄積する」</strong>。このフローが、圧倒的な表示速度とコスト削減を両立させます。
                            </p>
                        </div>
                    </div>

                    <h2 id="flow-system">3. AI生成コンテンツを資産化するワークフロー</h2>
                    <p>
                        365万件全ての生成には莫大なコストがかかります。私たちは、アクセス頻度やデータの更新頻度に基づいた「優先順位付けキュー」をDjangoで実装しました。
                        重要なフラッグシップモデルから順に、AIが深い洞察を書き加え、それをNext.jsが静的にレンダリングする。この一連のパイプラインこそが、次世代メディアの心臓部です。
                    </p>

                    <div className="my-10 p-6 bg-white/[0.03] border border-slate-800 rounded-2xl shadow-xl">
                        <div className="flex items-center gap-2 mb-4 text-emerald-400">
                            <MessageSquare className="w-4 h-4" />
                            <span className="text-xs font-mono uppercase">Implementation Details</span>
                        </div>
                        <ul className="text-sm space-y-3 list-none p-0">
                            <li className="flex items-start gap-3 border-b border-white/5 pb-2 text-slate-400">
                                <span className="text-emerald-500 font-bold">01</span>
                                <span>Contextual Input: スペック＋競合車種データをAIに同時提供。</span>
                            </li>
                            <li className="flex items-start gap-3 border-b border-white/5 pb-2 text-slate-400">
                                <span className="text-emerald-500 font-bold">02</span>
                                <span>Output Schema: 後続のパースを容易にするため、Markdown形式を厳守。</span>
                            </li>
                            <li className="flex items-start gap-3 text-slate-400">
                                <span className="text-emerald-500 font-bold">03</span>
                                <span>Validation: AIのハルシネーション（嘘）を検知する論理チェック。</span>
                            </li>
                        </ul>
                    </div>

                    <h2 id="next-step">次回予告：AIコメントの動的UIパース術</h2>
                    <p>
                        AIが書き上げた「熱いレビュー文」も、そのまま表示してはただの長文です。
                        第5回では、正規表現を駆使して長文を分解し、Reactコンポーネントの「POINT1-3」や「要約」へ鮮やかに自動分配するフロントエンドのパース技術を公開します。
                    </p>

                </div>

                {/* 🧭 フッターナビゲーション */}
                <footer className="mt-24 pt-12 border-t border-white/5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Link 
                            href="/series/ai-intelligence-engine/vol-3" 
                            className="group p-6 rounded-2xl border border-slate-800 bg-white/5 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all duration-300 shadow-lg shadow-black/40"
                        >
                            <span className="text-[10px] text-emerald-500 font-mono block mb-2 uppercase tracking-widest text-left">Previous Episode</span>
                            <div className="flex items-center justify-start gap-4">
                                <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-emerald-500 transition-all group-hover:-translate-x-1 rotate-180" />
                                <span className="text-white font-bold group-hover:text-emerald-400 transition-colors text-left text-sm">
                                    Vol.3 365万件のデータ・クレンジング
                                </span>
                            </div>
                        </Link>

                        <Link 
                            href="/series/ai-intelligence-engine/vol-5" 
                            className="group p-6 rounded-2xl border border-slate-800 bg-white/5 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all duration-300 shadow-lg shadow-black/40"
                        >
                            <span className="text-[10px] text-emerald-500 font-mono block mb-2 uppercase tracking-widest text-right">Next Episode</span>
                            <div className="flex items-center justify-between gap-4">
                                <span className="text-white font-bold group-hover:text-emerald-400 transition-colors text-sm">
                                    Vol.5 「AIコメント」の動的UIパース術
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