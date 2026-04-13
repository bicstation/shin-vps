/* eslint-disable react/no-unescaped-entities */
/**
 * =====================================================================
 * 🛰️ REBUILD_LOGS_VOL_5_V1.1
 * 🛡️ Project: Bic-Saving / Rebuild Logs
 * 💎 Purpose: 10年間の沈黙と、ドメイン「nabejuku.com」の死守
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
    Mail,
    History,
    Key
} from 'lucide-react';
import { constructMetadata } from '@/shared/lib/utils/metadata';

export async function generateMetadata() {
    return constructMetadata({
        title: "Vol.5 10年間の沈黙と、捨てられなかった「nabejuku.com」 | BIC-SAVING",
        description: "アフィリエイトを離れ、塾経営に捧げた10年。メールサーバーとしてだけ生き残った老舗ドメインの記憶。",
    });
}

export default function RebuildLogsVol5() {
    return (
        <div className="min-h-screen bg-[#0a0a0c] text-slate-300 py-12 lg:py-20 px-6">
            <article className="max-w-3xl mx-auto">
                
                {/* 🔖 ナビゲーション */}
                <nav className="flex items-center justify-between text-xs font-mono text-slate-500 mb-12 border-b border-white/5 pb-4">
                    <Link href="/series/rebuild-logs" className="hover:text-emerald-500 flex items-center gap-1 transition-colors">
                        <List className="w-3 h-3" /> INDEX
                    </Link>
                    <span className="text-emerald-500/50">REBUILD_LOGS // VOL.05</span>
                </nav>

                {/* 🚀 記事ヘッダー */}
                <header className="mb-16">
                    <h1 className="text-3xl md:text-5xl font-bold text-white mb-8 leading-tight">
                        10年間の沈黙と、<br/>捨てられなかったドメイン
                    </h1>

                    <div className="flex flex-wrap gap-6 text-xs font-mono text-slate-500">
                        <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-emerald-500" /> 2026.04.17</div>
                        <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-emerald-500" /> 8 MIN READ</div>
                        <div className="flex items-center gap-2"><User className="w-4 h-4 text-emerald-500" /> AUTHOR: NABE</div>
                    </div>
                </header>

                {/* 📝 本文 */}
                <div className="prose prose-invert prose-emerald max-w-none 
                    prose-headings:text-white prose-headings:font-bold
                    prose-p:leading-relaxed prose-p:text-slate-300
                    prose-strong:text-emerald-400 prose-code:text-emerald-300">
                    
                    <p className="text-xl leading-relaxed text-slate-400 italic mb-12 border-l-2 border-slate-700 pl-6">
                        "サーバー代を払い続けるたびに、かつての自分がそこにいた証を確認しているようだった。"
                    </p>

                    <h2 id="section1">1. 塾講師としての日常、エンジニアとしての仮死状態</h2>
                    <p>
                        2016年の崩壊後、私はインターネットの表舞台から完全に姿を消しました。
                        日々の中心は塾経営。黒板の前に立ち、生徒たちに数学や英語を教える毎日。
                        そこにはSEOも、HTML量産も、報酬画面の更新もありません。
                        かつての「月200万」という数字は、自分でも本当にあったことなのか疑わしくなるほど、遠い記憶の彼方へと追いやられていきました。
                    </p>

                    <h2 id="section2">2. メールサーバーとして生き残った「nabejuku.com」</h2>
                    <p>
                        多くのドメインを手放しました。かつての稼ぎ頭だった <strong>pbic.info</strong> も、更新期限を迎え、ひっそりと消えていきました。
                        しかし、<strong>nabejuku.com</strong> だけは手放せませんでした。
                        塾の業務連絡用メールアドレスとして運用していたこともありますが、それ以上に、このドメインは私という人間のアイデンティティの一部になっていたからです。
                    </p>

                    <div className="my-10 p-6 bg-white/5 border border-white/10 rounded-2xl flex gap-4">
                        <Mail className="text-emerald-500 w-6 h-6 shrink-0" />
                        <div>
                            <h4 className="text-emerald-500 font-bold m-0 uppercase text-sm font-mono text-emerald-500">Survivor: nabejuku.com</h4>
                            <p className="text-sm mt-2 mb-0">
                                サイトの更新は止まり、かつての記事はすべて消去した。それでも、このドメインの裏側で稼働するPostfixやDovecotの設定をメンテナンスし続けることだけが、私がエンジニアであることを繋ぎ止める唯一の細い糸でした。
                            </p>
                        </div>
                    </div>

                    <h2 id="section3">3. 沈黙の10年が教えてくれたこと</h2>
                    <p>
                        アフィリエイトから離れたこの10年は、決して無駄な時間ではありませんでした。
                        塾の生徒たちや保護者と向き合う中で、私は「本当に価値のある情報は、誰かの悩みを解決し、生活を少しでも良くするものである」という、当たり前でいて、最も重要な真理を学びました。
                    </p>
                    <p>
                        「nabejuku.com」を守り続けたのは、いつかまた、技術を誰かのために使える日が来ると信じていたからかもしれません。
                        その「いつか」は、想像もしなかった形で訪れます。
                        それが、<strong>Next.jsとの出会い</strong>でした。
                    </p>

                    <div className="my-10 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl">
                            <History className="w-8 h-8 text-slate-500 mb-3" />
                            <div className="text-lg font-bold text-white">10 Years</div>
                            <div className="text-xs text-slate-500 font-mono">Duration of Silence</div>
                        </div>
                        <div className="p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl">
                            <Key className="w-8 h-8 text-emerald-500 mb-3" />
                            <div className="text-lg font-bold text-white">Alive</div>
                            <div className="text-xs text-slate-500 font-mono">Domain Ownership</div>
                        </div>
                    </div>

                </div>

                {/* 🧭 フッターナビゲーション */}
                <footer className="mt-24 pt-12 border-t border-white/5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Link 
                            href="/series/rebuild-logs/vol-4" 
                            className="group p-6 rounded-2xl border border-slate-800 bg-white/5 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all text-left"
                        >
                            <span className="text-[10px] text-blue-500 font-mono block mb-2 flex items-center gap-1">
                                <ChevronLeft className="w-3 h-3" /> PREVIOUS EPISODE
                            </span>
                            <span className="text-white font-bold group-hover:text-blue-400 transition-colors text-sm">
                                Vol.4 帝国の崩壊：パンダとペンギン
                            </span>
                        </Link>
                        
                        <Link 
                            href="/series/rebuild-logs/vol-6" 
                            className="group p-6 rounded-2xl border border-slate-800 bg-white/5 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all text-right"
                        >
                            <span className="text-[10px] text-emerald-500 font-mono block mb-2 flex items-center justify-end gap-1">
                                NEXT EPISODE <ChevronRight className="w-3 h-3" />
                            </span>
                            <span className="text-white font-bold group-hover:text-emerald-400 transition-colors text-sm">
                                Vol.6 覚醒：Next.jsとモダンスタックへの回帰
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