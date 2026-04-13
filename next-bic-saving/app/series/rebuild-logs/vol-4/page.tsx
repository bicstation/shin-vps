/* eslint-disable react/no-unescaped-entities */
/**
 * =====================================================================
 * 🛰️ REBUILD_LOGS_VOL_4_V1.0
 * 🛡️ Project: Bic-Saving / Rebuild Logs
 * 💎 Purpose: アルゴリズム・ショックと「pbic.info」の沈没
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
    AlertTriangle,
    CloudRain,
    Anchor,
    Search,
    RefreshCcw
} from 'lucide-react';
import { constructMetadata } from '@/shared/lib/utils/metadata';

export async function generateMetadata() {
    return constructMetadata({
        title: "Vol.4 帝国の崩壊：パンダとペンギン、そして手作業への回帰 | BIC-SAVING",
        description: "一夜にして消えた月200万。アルゴリズムアップデートがもたらした破壊と、新たな「拘り」の誕生。",
    });
}

export default function RebuildLogsVol4() {
    return (
        <div className="min-h-screen bg-[#0a0a0c] text-slate-300 py-12 lg:py-20 px-6">
            <article className="max-w-3xl mx-auto">
                
                {/* 🔖 ナビゲーション */}
                <nav className="flex items-center justify-between text-xs font-mono text-slate-500 mb-12 border-b border-white/5 pb-4">
                    <Link href="/series/rebuild-logs" className="hover:text-emerald-500 flex items-center gap-1 transition-colors">
                        <List className="w-3 h-3" /> INDEX
                    </Link>
                    <span className="text-emerald-500/50">REBUILD_LOGS // VOL.04</span>
                </nav>

                {/* 🚀 記事ヘッダー */}
                <header className="mb-16">
                    <h1 className="text-3xl md:text-5xl font-bold text-white mb-8 leading-tight">
                        帝国の崩壊：<br/>パンダとペンギンの来襲
                    </h1>

                    <div className="flex flex-wrap gap-6 text-xs font-mono text-slate-500">
                        <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-emerald-500" /> 2026.04.16</div>
                        <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-emerald-500" /> 12 MIN READ</div>
                        <div className="flex items-center gap-2"><User className="w-4 h-4 text-emerald-500" /> AUTHOR: NABE</div>
                    </div>
                </header>

                {/* 📝 本文 */}
                <div className="prose prose-invert prose-emerald max-w-none 
                    prose-headings:text-white prose-headings:font-bold
                    prose-p:leading-relaxed prose-p:text-slate-300
                    prose-strong:text-emerald-400 prose-code:text-emerald-300">
                    
                    <p className="text-xl leading-relaxed text-slate-400 italic mb-12 border-l-2 border-red-500 pl-6">
                        "昨日まで鳴り止まなかった報酬の通知が、嘘のように静まり返った。Googleという神が、私が築き上げた『数』の論理を否定した瞬間だった。"
                    </p>

                    <h2 id="section1">1. 嵐の予兆と「圏外」への招待状</h2>
                    <p>
                        その日は、あまりに静かな朝でした。いつものようにアクセス解析を開いた瞬間、血の気が引くのを感じました。
                        右肩上がりだったグラフが、断崖絶壁のように垂直に落下している。
                        検索窓に「ホテル 予約」と打ち込んでも、そこにあったはずの <strong>pbic.info</strong> はどこにも見当たりません。
                        Googleが放った「パンダアップデート」と「ペンギンアップデート」。
                        それは、機械的に量産されたコンテンツと、不自然なバックリンク軍団に対する死刑宣告でした。
                    </p>

                    <div className="my-10 p-6 bg-red-500/5 border border-red-500/20 rounded-2xl flex gap-4">
                        <AlertTriangle className="text-red-500 w-6 h-6 shrink-0" />
                        <div>
                            <h4 className="text-red-500 font-bold m-0 uppercase text-sm">Critical System Alert</h4>
                            <p className="text-sm mt-2 mb-0">
                                インデックスの削除、検索順位の暴落。数万ページのHTMLは、一瞬にして広大なネットの海のゴミ（スパム）へと変貌しました。月200万の収益は、砂の城のように崩れ去ったのです。
                            </p>
                        </div>
                    </div>

                    <h2 id="section2">2. 量産から「執念」へのシフト</h2>
                    <p>
                        絶望の中で気づいたのは、システムによる「効率化」が、いつしかユーザー不在の「独りよがり」になっていたことでした。
                        CSVを流し込むだけの作業を捨て、私は再びキーボードを叩き始めました。
                        今度はプログラムではなく、**「事実」**を綴るために。
                        一つの案件に対し、どこよりも正確な還元率を計算し、どこよりも深い比較を行う。
                        「数」で勝てないなら、「圧倒的な質」で再構築するしかない。
                    </p>

                    <div className="my-10 p-6 bg-blue-500/5 border border-blue-500/20 rounded-2xl flex gap-4">
                        <RefreshCcw className="text-blue-500 w-6 h-6 shrink-0" />
                        <div>
                            <h4 className="text-blue-500 font-bold m-0 uppercase text-sm">Strategy Rebuild</h4>
                            <p className="text-sm mt-2 mb-0 italic text-slate-400">
                                [Automation] → [Manual Verification & Deep Analysis]
                            </p>
                            <p className="text-sm mt-2 mb-0">
                                1円単位の還元率に拘る現在のBic-Savingのスタイルは、この「機械に頼り切ったことへの反省」から生まれています。
                            </p>
                        </div>
                    </div>

                    <h2 id="section3">3. 沈没から得た、真の「資産」</h2>
                    <p>
                        <strong>pbic.info</strong> というドメインは沈没しました。しかし、その残骸から拾い上げた「教訓」こそが、今の私を支えています。
                        「アルゴリズムに依存しない価値とは何か？」
                        それは、ユーザーが本当に求めている「正しいデータ」を、誠実に提供し続けること。
                        深夜の教室で、一人静かにExcelと格闘し、還元率のシミュレーションを繰り返す日々。
                        月200万という幻影を追いかけるのをやめた時、私はようやく「本当の意味でのエンジニアリング」を理解したのかもしれません。
                    </p>

                    <div className="my-10 p-6 bg-slate-500/5 border border-slate-800 rounded-2xl flex gap-4 font-mono text-xs overflow-hidden">
                        <Search className="text-slate-500 w-6 h-6 shrink-0" />
                        <div className="w-full overflow-x-auto text-slate-400">
                            <span className="text-slate-500 leading-none">// Core Philosophy Migration</span>
                            <ul className="mt-2 space-y-1 list-none p-0">
                                <li>- Old: Quantity over Quality (Spammy)</li>
                                <li>- New: Data Accuracy over Ranking (Ethical)</li>
                                <li>- Result: Resilience against Algorithm Changes</li>
                                <li>- Status: <span className="text-blue-400 font-bold underline italic">Bic-Saving Core Logic Initialized</span></li>
                            </ul>
                        </div>
                    </div>

                    <p>
                        帝国の崩壊は、終わりではありませんでした。
                        それは、より強固で、より誠実な「新しい城（Bic-Saving）」を築くための、更地化だったのです。
                    </p>

                </div>

                {/* 🧭 フッターナビゲーション */}
                <footer className="mt-24 pt-12 border-t border-white/5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Link 
                            href="/series/rebuild-logs/vol-3" 
                            className="group p-6 rounded-2xl border border-slate-800 bg-white/5 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all text-left"
                        >
                            <span className="text-[10px] text-blue-500 font-mono block mb-2 flex items-center gap-1">
                                <ChevronLeft className="w-3 h-3" /> PREVIOUS EPISODE
                            </span>
                            <span className="text-white font-bold group-hover:text-blue-400 transition-colors">
                                Vol.3 月200万の絶頂とバックリンク
                            </span>
                        </Link>
                        
                        <div className="p-6 rounded-2xl border border-dashed border-slate-800 flex items-center justify-center text-slate-600 text-sm italic font-mono text-center">
                            FINAL EPISODE:<br/>REBORN AS BIC-SAVING
                        </div>
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