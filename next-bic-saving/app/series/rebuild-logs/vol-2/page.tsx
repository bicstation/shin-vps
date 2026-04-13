/* eslint-disable react/no-unescaped-entities */
/**
 * =====================================================================
 * 🛰️ REBUILD_LOGS_VOL_2_V1.2
 * 🛡️ Project: Bic-Saving / Rebuild Logs
 * 💎 Purpose: MTの限界と、CSVTOHTMLによる「3層構造HTML量産」への転換
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
    Layers,
    FastForward,
    Database,
    FileJson,
    Loader2
} from 'lucide-react';
import { constructMetadata } from '@/shared/lib/utils/metadata';

export async function generateMetadata() {
    return constructMetadata({
        title: "Vol.2 再構築の限界と「CSVTOHTML」による量産体制 | BIC-SAVING",
        description: "MovableTypeの限界を悟り、3層構造のHTML量産へ。現代のSSGに通ずる設計思想の記録。",
    });
}

export default function RebuildLogsVol2() {
    return (
        <div className="min-h-screen bg-[#0a0a0c] text-slate-300 py-12 lg:py-20 px-6">
            <article className="max-w-3xl mx-auto">
                
                {/* 🔖 ナビゲーション */}
                <nav className="flex items-center justify-between text-xs font-mono text-slate-500 mb-12 border-b border-white/5 pb-4">
                    <Link href="/series/rebuild-logs" className="hover:text-emerald-500 flex items-center gap-1 transition-colors">
                        <List className="w-3 h-3" /> INDEX
                    </Link>
                    <span className="text-emerald-500/50">REBUILD_LOGS // VOL.02</span>
                </nav>

                {/* 🚀 記事ヘッダー */}
                <header className="mb-16">
                    <h1 className="text-3xl md:text-5xl font-bold text-white mb-8 leading-tight">
                        再構築の限界と「CSVTOHTML」
                    </h1>

                    <div className="flex flex-wrap gap-6 text-xs font-mono text-slate-500">
                        <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-emerald-500" /> 2026.04.14</div>
                        <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-emerald-500" /> 8 MIN READ</div>
                        <div className="flex items-center gap-2"><User className="w-4 h-4 text-emerald-500" /> AUTHOR: NABE</div>
                    </div>
                </header>

                {/* 📝 本文 */}
                <div className="prose prose-invert prose-emerald max-w-none 
                    prose-headings:text-white prose-headings:font-bold
                    prose-p:leading-relaxed prose-p:text-slate-300
                    prose-strong:text-emerald-400 prose-code:text-emerald-300">
                    
                    <p className="text-xl leading-relaxed text-slate-400 italic mb-12 border-l-2 border-emerald-500 pl-6">
                        "WordPressではなくMovable Typeを選んだ私を待っていたのは、サイトが育てば育つほど膨れ上がる『再構築』という名の拘束時間だった。私はCMSという箱を捨て、データの直接変換へと舵を切った。"
                    </p>

                    <h2 id="section1">1. Movable Type：静的生成の矜持と代償</h2>
                    <p>
                        CMSの黎明期、多くの人がWordPressの手軽さに流れる中、私は頑なに <strong>Movable Type (MT)</strong> の道を選びました。
                        アクセスごとにDBを叩くのではなく、物理的なHTMLを書き出す。その「静的ファイルへの信頼」こそがエンジニアとしての矜持でしたが、記事数が数千件を超えたとき、MTは牙を剥きました。
                    </p>

                    <div className="my-10 p-6 bg-red-500/5 border border-red-500/20 rounded-2xl flex gap-4">
                        <Loader2 className="text-red-500 w-6 h-6 shrink-0 animate-spin" />
                        <div>
                            <h4 className="text-red-500 font-bold m-0 uppercase text-sm">The Rebuild Hell</h4>
                            <p className="text-sm mt-2 mb-0">
                                プログレスバーが数十分動かない。HTMLタグを1行ずつ書き出し、サーバーのCPUが悲鳴を上げる。この「待ち時間」が、量産化への最大のネックとなったのです。
                            </p>
                        </div>
                    </div>

                    <h2 id="section2">2. 発想の転換：3層構造の金型（Template）</h2>
                    <p>
                        MTというシステムに限界を感じた私は、より原始的で高速な手法を模索しました。
                        そこで辿り着いたのが、現代のWeb開発の基礎でもある「3層のコンポーネント構成」による自動生成です。
                    </p>
                    <ul>
                        <li><strong>トップページ：</strong> 全体の入り口となるインデックス。</li>
                        <li><strong>カテゴリページ：</strong> 地域や目的別にデータを分類する中間層。</li>
                        <li><strong>個別詳細ページ：</strong> ホテル一点一点のデータを流し込む最下層。</li>
                    </ul>
                    <p>
                        これらをHTMLテンプレート（金型）として定義し、そこに直接CSVデータを流し込めば、重いCMSを介さずとも無限にHTMLを生成できる。そう確信しました。
                    </p>

                    <div className="my-10 p-6 bg-blue-500/5 border border-blue-500/20 rounded-2xl flex gap-4">
                        <Layers className="text-blue-500 w-6 h-6 shrink-0" />
                        <div>
                            <h4 className="text-blue-500 font-bold m-0 uppercase text-sm">System Architecture</h4>
                            <p className="text-sm mt-2 mb-0 italic text-slate-400">
                                [CSV Data] + [HTML Template] = [Thousands of Static Pages]
                            </p>
                        </div>
                    </div>

                    <h2 id="section3">3. 救世主「CSVTOHTML」との出会い</h2>
                    <p>
                        この「量産システム」を具現化するために見つけたのが、<strong>CSVTOHTML</strong> という無料ソフトでした。
                        CSVの各カラムをテンプレートの変数にマッピングし、一気にHTMLを叩き出す。
                        当時は国内旅行予約が盛んで、幸いにも詳細なホテル情報が含まれたCSVファイルは比較的容易に手に入りました。
                    </p>

                    <div className="my-10 p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl flex gap-4">
                        <FastForward className="text-emerald-500 w-6 h-6 shrink-0" />
                        <div>
                            <h4 className="text-emerald-500 font-bold m-0 uppercase text-sm">High-Speed Conversion</h4>
                            <p className="text-sm mt-2 mb-0">
                                再構築の待ち時間をゼロにし、ローカルで数万ファイルを一瞬で生成。それをFTPで流し込む。この機動力こそが、後の爆発的な収益を支える軍隊となりました。
                            </p>
                        </div>
                    </div>

                    <div className="my-10 p-6 bg-slate-500/5 border border-slate-800 rounded-2xl flex gap-4 font-mono text-xs overflow-hidden">
                        <FileJson className="text-slate-500 w-6 h-6 shrink-0" />
                        <div className="w-full overflow-x-auto text-slate-400">
                            <span className="text-slate-500 leading-none">// Build Process Memory</span>
                            <ul className="mt-2 space-y-1 list-none p-0">
                                <li>- SOURCE: hotel_list_2008.csv</li>
                                <li>- TEMPLATE: top / category / detail.html</li>
                                <li>- ENGINE: CSVTOHTML</li>
                                <li>- DEPLOY: Binary Mode FTP Transfer</li>
                            </ul>
                        </div>
                    </div>

                    <p>
                        塾の授業が終わった後の深夜、静まり返った教室でモニターを二つ並べ、CSVをHTMLへ変換し続ける。
                        それは「作業」ではなく、インターネットという大地に自分の領土を広げていく「開拓」に近い感覚でした。
                    </p>

                </div>

                {/* 🧭 フッターナビゲーション */}
                <footer className="mt-24 pt-12 border-t border-white/5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Link 
                            href="/series/rebuild-logs/vol-1" 
                            className="group p-6 rounded-2xl border border-slate-800 bg-white/5 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all text-left"
                        >
                            <span className="text-[10px] text-blue-500 font-mono block mb-2 flex items-center gap-1">
                                <ChevronLeft className="w-3 h-3" /> PREVIOUS EPISODE
                            </span>
                            <span className="text-white font-bold group-hover:text-blue-400 transition-colors text-sm">
                                Vol.1 2008年、なべ塾開校とゆこゆこの500円
                            </span>
                        </Link>
                        
                        <Link 
                            href="/series/rebuild-logs/vol-3" 
                            className="group p-6 rounded-2xl border border-slate-800 bg-white/5 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all"
                        >
                            <span className="text-[10px] text-emerald-500 font-mono block mb-2">NEXT EPISODE</span>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-white font-bold group-hover:text-emerald-400 transition-colors">
                                    Vol.3 月200万の絶頂と「pbic.info」
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