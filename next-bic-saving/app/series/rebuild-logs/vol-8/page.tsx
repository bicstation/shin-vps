/* eslint-disable react/no-unescaped-entities */
/**
 * =====================================================================
 * 🛰️ REBUILD_LOGS_VOL_8_V1.2 [FINAL_REVISION]
 * 🛡️ Project: Bic-Saving / Rebuild Logs
 * 💎 Purpose: 「リッター7円引き」を実現する多層還元アルゴリズムの構築
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
    Fuel,
    CreditCard,
    Zap,
    Calculator,
    ArrowDownToLine,
    Layers
} from 'lucide-react';
import { constructMetadata } from '@/shared/lib/utils/metadata';

export async function generateMetadata() {
    return constructMetadata({
        title: "Vol.8 エンジニアの眼で「リッター7円引き」を最適化する | BIC-SAVING",
        description: "出光、三井住友、dポイント。多層レイヤーを重ね合わせ、ガソリン代を極限までデバッグする技術。",
    });
}

export default function RebuildLogsVol8() {
    return (
        <div className="min-h-screen bg-[#0a0a0c] text-slate-300 py-12 lg:py-20 px-6">
            <article className="max-w-3xl mx-auto">
                
                {/* 🔖 ナビゲーション */}
                <nav className="flex items-center justify-between text-xs font-mono text-slate-500 mb-12 border-b border-white/5 pb-4">
                    <Link href="/series/rebuild-logs" className="hover:text-emerald-500 flex items-center gap-1 transition-colors">
                        <List className="w-3 h-3" /> INDEX
                    </Link>
                    <span className="text-emerald-500/50">REBUILD_LOGS // VOL.08</span>
                </nav>

                {/* 🚀 記事ヘッダー */}
                <header className="mb-16">
                    <h1 className="text-3xl md:text-5xl font-bold text-white mb-8 leading-tight">
                        エンジニアの眼で、<br/>「リッター7円引き」をデバッグする
                    </h1>

                    <div className="flex flex-wrap gap-6 text-xs font-mono text-slate-500">
                        <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-emerald-500" /> 2026.04.20</div>
                        <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-emerald-500" /> 11 MIN READ</div>
                        <div className="flex items-center gap-2"><User className="w-4 h-4 text-emerald-500" /> AUTHOR: NABE</div>
                    </div>
                </header>

                {/* 📝 本文 */}
                <div className="prose prose-invert prose-emerald max-w-none 
                    prose-headings:text-white prose-headings:font-bold
                    prose-p:leading-relaxed prose-p:text-slate-300
                    prose-strong:text-emerald-400 prose-code:text-emerald-300">
                    
                    <p className="text-xl leading-relaxed text-slate-400 italic mb-12 border-l-2 border-emerald-500 pl-6">
                        "昨日までCSVをこねくり回していた指で、今は出光と三井住友の還元ルートをスタックさせている。"
                    </p>

                    <h2 id="section1">1. ガソリン代を「変数」として捉える</h2>
                    <p>
                        車社会に生きる私にとって、ガソリン代は避けられない固定費でした。しかし、消費税10%を機に加速したキャッシュレスの波は、これを「最適化可能な変数」へと変えました。
                        店頭価格からいかにして「リッター7円」を削ぎ落とすか。
                        私は、出光の「apollostation card」を核に、DrivePay、dポイント、そして三井住友のVポイントを多層的に重ね合わせることで、この課題を解決しました。
                    </p>

                    <div className="my-10 p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl">
                        <div className="flex items-center gap-4 mb-4">
                            <Fuel className="text-emerald-500 w-6 h-6" />
                            <h4 className="text-emerald-500 font-bold m-0 uppercase text-sm">Gasoline Discount Stack</h4>
                        </div>
                        <ul className="text-sm space-y-3 m-0 p-0 list-none font-mono">
                            <li className="flex justify-between border-b border-white/5 pb-1">
                                <span>1. apollostation (Basic)</span> 
                                <span className="text-emerald-400">-2 JPY</span>
                            </li>
                            <li className="flex justify-between border-b border-white/5 pb-1">
                                <span>2. DrivePay (App Link)</span> 
                                <span className="text-emerald-400">-3 JPY</span>
                            </li>
                            <li className="flex justify-between border-b border-white/5 pb-1">
                                <span>3. SMBC V-Point / d-Point</span> 
                                <span className="text-emerald-400">-2 JPY (eq)</span>
                            </li>
                            <li className="font-bold flex justify-between pt-2 text-white">
                                <span>TOTAL OPTIMIZED</span> 
                                <span className="text-emerald-400 underline decoration-double">-7 JPY / Liter</span>
                            </li>
                        </ul>
                    </div>

                    <h2 id="section2">2. 三井住友カード3枚の役割（Load Balancing）</h2>
                    <p>
                        なぜカードが3枚も必要なのか。それは「負荷分散」のためです。
                        仕入れ用のAmazonカード、小売業を支える法人カード、そして報酬受け取り用のOlive。
                        これらすべての出口を<strong>「Vポイント」</strong>という一つのデータベースに集約し、SBI証券での投資へ自動ルーティングする。
                        かつて複数のサイトからバックリンクを集約した手法を、家計の資金流動に応用したのです。
                    </p>

                    <h2 id="section3">3. セルフバックという名の「開発資金」</h2>
                    <p>
                        これらのカードを揃える際も、アフィリエイターの知恵を忘れません。
                        A8.netなどのASPを通じ、カード発行そのものを「セルフバック（自己アフィリエイト）」として報酬に変える。
                        クレジットカードを発行するだけで現金を獲得し、そのカードを使って日々の支出から数％をもぎ取り、証券取引で複利運用する。
                        これは「節約」を超えた、**「個人レベルの財務ハック」**に他なりません。
                    </p>

                    <div className="my-10 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl">
                            <ArrowDownToLine className="w-8 h-8 text-blue-500 mb-3" />
                            <div className="text-lg font-bold text-white">Self-Back</div>
                            <div className="text-xs text-slate-500">Reward from ASP (Instant ROI)</div>
                        </div>
                        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl">
                            <Layers className="w-8 h-8 text-yellow-500 mb-3" />
                            <div className="text-lg font-bold text-white">Stacking Logic</div>
                            <div className="text-xs text-slate-500">Maximum return by layering protocols.</div>
                        </div>
                    </div>

                </div>

                {/* 🧭 フッターナビゲーション */}
                <footer className="mt-24 pt-12 border-t border-white/5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Link 
                            href="/series/rebuild-logs/vol-7" 
                            className="group p-6 rounded-2xl border border-slate-800 bg-white/5 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all text-left"
                        >
                            <span className="text-[10px] text-blue-500 font-mono block mb-2 flex items-center gap-1">
                                <ChevronLeft className="w-3 h-3" /> PREVIOUS EPISODE
                            </span>
                            <span className="text-white font-bold group-hover:text-blue-400 transition-colors">
                                Vol.7 節約は負けないアフィリエイト
                            </span>
                        </Link>
                        
                        <Link 
                            href="/series/rebuild-logs/vol-9" 
                            className="group p-6 rounded-2xl border border-slate-800 bg-white/5 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all text-right"
                        >
                            <span className="text-[10px] text-emerald-500 font-mono block mb-2 flex items-center justify-end gap-1">
                                NEXT EPISODE <ChevronRight className="w-3 h-3" />
                            </span>
                            <span className="text-white font-bold group-hover:text-emerald-400 transition-colors">
                                Vol.9 E-E-A-T STRATEGY IN AI ERA
                            </span>
                        </Link>
                    </div>
                </footer>
            </article>
        </div>
    );
}