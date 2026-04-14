/* eslint-disable react/no-unescaped-entities */
/**
 * =====================================================================
 * 🛰️ REBUILD_LOGS_VOL_3_V1.3
 * 🛡️ Project: Bic-Saving / Rebuild Logs
 * 💎 Purpose: 月200万の絶頂、pbic.info、そしてバックリンク軍団の編成
 * =====================================================================
 */

import React from 'react';
import Link from 'next/link';
import { 
    ChevronLeft,
    ChevronRight, // 🚀 Fixed: Added missing import
    List, 
    Calendar, 
    Clock, 
    User, 
    TrendingUp,
    Globe,
    Network,
    Coins,
    ShieldAlert
} from 'lucide-react';
import { constructMetadata } from '@/shared/lib/utils/metadata';

export async function generateMetadata() {
    return constructMetadata({
        title: "Vol.3 月200万の絶頂とバックリンク軍団 | BIC-SAVING",
        description: "1件500円を積み上げ月200万へ。無料ブログを駆使したバックリンク戦略とpbic.infoの記録。",
    });
}

export default function RebuildLogsVol3() {
    return (
        <div className="min-h-screen bg-[#0a0a0c] text-slate-300 py-12 lg:py-20 px-6">
            <article className="max-w-3xl mx-auto">
                
                {/* 🔖 ナビゲーション */}
                <nav className="flex items-center justify-between text-xs font-mono text-slate-500 mb-12 border-b border-white/5 pb-4">
                    <Link href="/series/rebuild-logs" className="hover:text-emerald-500 flex items-center gap-1 transition-colors">
                        <List className="w-3 h-3" /> INDEX
                    </Link>
                    <span className="text-emerald-500/50">REBUILD_LOGS // VOL.03</span>
                </nav>

                {/* 🚀 記事ヘッダー */}
                <header className="mb-16">
                    <h1 className="text-3xl md:text-5xl font-bold text-white mb-8 leading-tight">
                        月200万の絶頂と<br/>バックリンク軍団の咆哮
                    </h1>

                    <div className="flex flex-wrap gap-6 text-xs font-mono text-slate-500">
                        <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-emerald-500" /> 2026.04.15</div>
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
                        "報酬画面を更新するたび、数字が跳ね上がる。1件500円という小さな『粒』が、システムというフィルターを通ることで、月200万という濁流に変わった。"
                    </p>

                    <h2 id="section1">1. 数学的な勝利：4,000件の成約</h2>
                    <p>
                        月商200万円。当時の私にとって、それは塾講師としての給与を遥かに凌駕する、現実味を欠いた数字でした。
                        しかし、その裏付けは極めて論理的でした。
                        CSVTOHTMLで量産された数万のHTMLページが、Googleのインデックスを埋め尽くす。
                        ひとつひとつのページに訪れるユーザーはわずかでも、その「分母」を圧倒的に増やすことで、確率論的に4,000件の成約を叩き出していたのです。
                    </p>

                    <div className="my-10 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl text-center">
                            <Coins className="w-8 h-8 text-emerald-500 mx-auto mb-3" />
                            <div className="text-2xl font-bold text-white font-mono">500 JPY</div>
                            <div className="text-[10px] text-slate-500 uppercase tracking-widest mt-1 font-mono">Unit Reward</div>
                        </div>
                        <div className="p-6 bg-white/5 border border-white/10 rounded-2xl text-center">
                            <TrendingUp className="w-8 h-8 text-white mx-auto mb-3" />
                            <div className="text-2xl font-bold text-white font-mono">4,000+</div>
                            <div className="text-[10px] text-slate-500 uppercase tracking-widest mt-1 font-mono">Monthly Sales</div>
                        </div>
                        <div className="p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl text-center">
                            <Network className="w-8 h-8 text-emerald-500 mx-auto mb-3" />
                            <div className="text-2xl font-bold text-white font-mono">2.0M JPY</div>
                            <div className="text-[10px] text-slate-500 uppercase tracking-widest mt-1 font-mono">Monthly Revenue</div>
                        </div>
                    </div>

                    <h2 id="section2">2. バックリンク戦略：無料ブログの軍勢</h2>
                    <p>
                        今では「禁じ手」とされる手法も、当時は最先端のSEO戦略でした。
                        黎明期だった無料ブログサービスを片っ端から開設し、そこからメインサイトへ向けて<strong>大量のバックリンク（被リンク）</strong>を仕掛ける。
                        メインの要塞を後押しするために、数え切れないほどのサテライトサイトがリンクというパワーを送り続ける。
                        それはまさに、デジタルな「兵站（ロジスティクス）」の構築でした。
                    </p>

                    <div className="my-10 p-6 bg-blue-500/5 border border-blue-500/20 rounded-2xl flex gap-4">
                        <ShieldAlert className="text-blue-500 w-6 h-6 shrink-0" />
                        <div>
                            <h4 className="text-blue-500 font-bold m-0 uppercase text-sm font-mono">Satellite Link Strategy</h4>
                            <p className="text-sm mt-2 mb-0">
                                検索エンジンの評価を自らの手でコントロールする。複数のドメインからリンクを集約させ、検索順位の最上段を奪いに行く。エンジニアリングとSEOが融合した、狂乱の時代の戦法です。
                            </p>
                        </div>
                    </div>

                    <h2 id="section3">3. 「pbic.info」という名の要塞</h2>
                    <p>
                        その絶頂期を支えたドメインのひとつが <strong>pbic.info</strong> でした。
                        今でもその文字列を見るだけで、深夜の静まり返った教室内で響くハードディスクのシーク音と、FTPソフト「FFFTP」の転送終了チャイムが蘇ります。
                        当時はまだ、検索アルゴリズムが今ほど複雑ではなかった時代。
                        「正しい構造のHTML」を「大量に」提供し、それをバックリンクで補強することが、最強のSEO戦略でした。
                    </p>

                    <div className="my-10 p-6 bg-slate-500/5 border border-slate-800 rounded-2xl flex gap-4 font-mono text-xs overflow-hidden">
                        <Globe className="text-slate-500 w-6 h-6 shrink-0" />
                        <div className="w-full overflow-x-auto text-slate-400">
                            <span className="text-slate-500 leading-none">// Infrastructure Log: 2008-2010</span>
                            <ul className="mt-2 space-y-1 list-none p-0">
                                <li>- Main Domain: pbic.info</li>
                                <li>- Traffic Source: Organic Search (Aggressive SEO)</li>
                                <li>- Link Network: 100+ Free Blog Accounts</li>
                                <li>- Status: <span className="text-emerald-400 font-bold italic underline">Dominating Search Results</span></li>
                            </ul>
                        </div>
                    </div>

                    <p>
                        自分が寝ている間も、塾で生徒に教えている間も、サーバー上のHTML群が勝手に働き、報酬を積み上げていく。
                        この時に味わった「自分の分身（システム）が稼ぐ」という感覚こそが、その後の私のエンジニア人生のバックボーンとなりました。
                        現在の <strong>Bic-Saving</strong> における自動化への異様な拘りも、原点はすべてこの「月200万の衝撃」にあります。
                    </p>

                    <p>
                        しかし、光が強ければ影もまた濃い。
                        この「リンクこそが正義」だった時代の終焉は、Googleの進化という形で、唐突に訪れることになります。
                    </p>

                </div>

                {/* 🧭 フッターナビゲーション */}
                <footer className="mt-24 pt-12 border-t border-white/5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Link 
                            href="/series/rebuild-logs/vol-2" 
                            className="group p-6 rounded-2xl border border-slate-800 bg-white/5 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all text-left"
                        >
                            <span className="text-[10px] text-blue-500 font-mono block mb-2 flex items-center gap-1">
                                <ChevronLeft className="w-3 h-3" /> PREVIOUS EPISODE
                            </span>
                            <span className="text-white font-bold group-hover:text-blue-400 transition-colors text-sm">
                                Vol.2 PHPとの出会いと「CSVTOHTML」の衝撃
                            </span>
                        </Link>
                        
                        <Link 
                            href="/series/rebuild-logs/vol-4" 
                            className="group p-6 rounded-2xl border border-slate-800 bg-white/5 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all"
                        >
                            <span className="text-[10px] text-emerald-500 font-mono block mb-2 text-right">NEXT EPISODE</span>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-white font-bold group-hover:text-emerald-400 transition-colors">
                                    Vol.4 崩壊の序曲：Googleペンギン・パンダアップデート
                                </span>
                                <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-emerald-500 transition-all group-hover:translate-x-1" />
                            </div>
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