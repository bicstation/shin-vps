/* eslint-disable react/no-unescaped-entities */
/**
 * =====================================================================
 * 🛰️ SAVING_STACK_VOL_2_V1.1 (Physical Layer Optimization)
 * 🛡️ Project: Bic-Saving / Saving Stack
 * 💎 Purpose: EneKeyとアプリの紐付けによる「リッター7円引き」の実装
 * =====================================================================
 */

import React from 'react';
import Link from 'next/link';
import { 
    List, 
    Calendar, 
    Clock, 
    User, 
    Smartphone,
    ArrowRight,
    MapPin,
    Zap,
    Key,
    Fuel,
    CheckCircle2,
    Activity,
    Layers3
} from 'lucide-react';

export default function SavingStackVol2() {
    return (
        <div className="min-h-screen bg-[#0a0a0c] text-slate-300 py-12 lg:py-20 px-6 font-sans selection:bg-blue-500/30">
            <article className="max-w-3xl mx-auto">
                
                {/* 🔖 ナビゲーション */}
                <nav className="flex items-center justify-between text-xs font-mono text-slate-500 mb-12 border-b border-white/5 pb-4">
                    <Link href="/series/saving-stack" className="hover:text-blue-400 flex items-center gap-1 transition-colors font-bold text-blue-500/80 group">
                        <List className="w-3 h-3 group-hover:rotate-90 transition-transform" /> SERIES_INDEX
                    </Link>
                    <span className="text-blue-500/50 uppercase tracking-[0.2em] font-bold">Saving_Stack // Vol.02</span>
                </nav>

                {/* 🚀 記事ヘッダー */}
                <header className="mb-16">
                    <div className="inline-block px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-[10px] font-mono mb-6 tracking-widest uppercase animate-pulse">
                        Physical Layer & Edge Computing
                    </div>
                    <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-10 leading-[1.1] tracking-tight">
                        ガソリン代リッター7円引きの<br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-500">
                            「物理レイヤー」攻略
                        </span>
                    </h1>

                    <div className="flex flex-wrap gap-8 text-[11px] font-mono text-slate-500 border-l border-white/10 pl-6">
                        <div className="flex flex-col gap-1">
                            <span className="text-blue-500/50 block">DATE</span>
                            <div className="flex items-center gap-2 text-slate-300"><Calendar className="w-3.5 h-3.5" /> 2026.04.16</div>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-blue-500/50 block">READ_TIME</span>
                            <div className="flex items-center gap-2 text-slate-300"><Clock className="w-3.5 h-3.5" /> 15 MIN READ</div>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-blue-500/50 block">AUTHOR</span>
                            <div className="flex items-center gap-2 text-slate-300"><User className="w-3.5 h-3.5" /> NABE</div>
                        </div>
                    </div>
                </header>

                {/* 📝 本文 */}
                <div className="prose prose-invert prose-blue max-w-none 
                    prose-headings:text-white prose-headings:font-bold
                    prose-p:leading-relaxed prose-p:text-slate-400 prose-p:text-lg
                    prose-strong:text-blue-400 prose-code:text-blue-300 prose-code:bg-blue-500/10 prose-code:px-1 prose-code:rounded">
                    
                    <div className="relative mb-16 py-10 px-8 bg-white/[0.02] border-y border-white/5 overflow-hidden">
                        <Activity className="absolute -left-4 -top-4 w-32 h-32 text-blue-500/5 rotate-12" />
                        <p className="relative z-10 text-xl md:text-2xl leading-relaxed text-slate-300 italic font-medium m-0 text-center">
                            "UI（給油機パネル）を何度も叩くのは非効率だ。<br className="hidden md:block"/>
                            ワンアクションで全クーポンを適用し、<br className="hidden md:block"/>
                            最安値を引き出す『マクロ』を組め。"
                        </p>
                    </div>

                    <h2 id="section1" className="flex items-center gap-3 !text-2xl tracking-tight border-l-4 border-blue-500 pl-4">
                        <Fuel className="w-6 h-6 text-blue-500" /> 1. 目指すは「リッター7円引き」の定常化
                    </h2>
                    <p>
                        ガソリン代の節約において、最も避けるべきは「その日の最安値を求めて走り回る」という行為です。これはエンジニアで言うところの**「手動運用（Toil）」**であり、時間と燃料というリソースを二重に浪費しています。
                    </p>
                    <p>
                        我々が実装すべきは、**「どこのエネオスに行っても、特定のアクションをするだけで自動的に地域最安値（マイナス7円前後）が適用される」**という堅牢なデプロイ・パイプラインです。
                    </p>

                    <h2 id="section2" className="flex items-center gap-3 !text-2xl tracking-tight border-l-4 border-indigo-500 pl-4">
                        <Key className="w-6 h-6 text-indigo-500" /> 2. 物理トークン：EneKeyとSSアプリの「密結合」
                    </h2>
                    <p>
                        この攻略のコアとなるスタックは、**EneKey（物理ICタグ）**と**エネオスSSアプリ（ソフトウェア）**の紐付けです。これを我々は「デバイス・バインディング」と呼びます。
                    </p>
                    
                    <div className="my-10 space-y-4">
                        <div className="p-6 bg-gradient-to-r from-blue-500/5 to-transparent border border-white/5 rounded-2xl flex items-start gap-5 group hover:border-blue-500/30 transition-all">
                            <div className="p-3 bg-blue-500/10 rounded-xl group-hover:scale-110 transition-transform">
                                <Layers3 className="w-6 h-6 text-blue-500" />
                            </div>
                            <div>
                                <strong className="text-white text-lg block mb-1">物理レイヤー：EneKey</strong>
                                <p className="text-sm m-0 text-slate-400 leading-relaxed font-sans">
                                    クレジットカード情報をカプセル化した非接触ICトークン。財布を出すオーバーヘッドをゼロにし、決済プロセスを最小ステップで開始する。
                                </p>
                            </div>
                        </div>
                        <div className="p-6 bg-gradient-to-r from-emerald-500/5 to-transparent border border-white/5 rounded-2xl flex items-start gap-5 group hover:border-emerald-500/30 transition-all">
                            <div className="p-3 bg-emerald-500/10 rounded-xl group-hover:scale-110 transition-transform">
                                <Smartphone className="w-6 h-6 text-emerald-500" />
                            </div>
                            <div>
                                <strong className="text-white text-lg block mb-1">アプリケーション層：エネオスSSアプリ</strong>
                                <p className="text-sm m-0 text-slate-400 leading-relaxed font-sans">
                                    店舗ごとの割引ロジックを管理。EneKeyと連携させることで、給油リクエスト時に最適なクーポンを「Dependency Injection」する。
                                </p>
                            </div>
                        </div>
                    </div>

                    <p>
                        この二つをバインドすることで、リーダーにかざした瞬間、**「会員価格 + アプリクーポン + クレジットカード特典」**が同時発火します。これが「7円引き」の正体です。
                    </p>

                    <h2 id="section3" className="flex items-center gap-3 !text-2xl tracking-tight border-l-4 border-blue-500 pl-4">
                        <MapPin className="w-6 h-6 text-blue-500" /> 3. 最適な「店舗（エッジサーバー）」の選択
                    </h2>
                    <p>
                        すべての店舗（ノード）が同じレスポンスを返すわけではありません。攻略すべきは、**「クーポン発行頻度が高い店舗」**を自宅近辺や通勤路で見つけ出し、アプリ上で「マイ店舗」としてプロビジョニングしておくことです。
                    </p>
                    <p>
                        店舗によっては「初回登録でリッター10円引き」といった強力な初期パッチを配布していることもあります。これらを逃さずキャッチし、物理レイヤー（EneKey）に反映させるのが運用コストを下げるコツです。
                    </p>

                    {/* 🛠️ Implementation Checklist */}
                    <div className="my-12 p-8 bg-slate-900/50 border border-blue-500/20 rounded-3xl relative overflow-hidden box-border">
                        <div className="absolute top-0 right-0 p-4 opacity-[0.05] pointer-events-none">
                            <Zap className="w-32 h-32 text-blue-500" />
                        </div>
                        
                        <h4 className="text-blue-400 font-bold mt-0 mb-6 uppercase text-xs tracking-[0.2em] flex items-center gap-2">
                            <Zap className="w-4 h-4" /> Implementation Routine
                        </h4>
                        
                        <ul className="space-y-4 m-0 p-0 list-none">
                            {[
                                { step: "01", task: "決済手段を三井住友カード等の高還元カードに集約する" },
                                { step: "02", task: "店頭でEneKeyを発行し、物理トークンを手に入れる" },
                                { step: "03", task: "SSアプリをインストールし、EneKey IDをバインドする" },
                                { step: "04", task: "「いつもの給油設定」をプリセットし、UI操作を自動化する" }
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-4 group">
                                    <span className="font-mono text-[10px] text-blue-500/50 group-hover:text-blue-400 transition-colors">{item.step}</span>
                                    <span className="text-sm text-slate-300 font-medium group-hover:text-white transition-colors tracking-tight">{item.task}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <h2 id="section4" className="!text-2xl">まとめ：UI操作を最小化せよ</h2>
                    <p>
                        一度この物理設定を終えれば、給油機の前ですべきことは「EneKeyをかざす」ただ一点に集約されます。
                        給油種別を選び、量を選び、ポイントカードを挿し、クーポンコードを打つ……。そんな**スパゲッティ・コードのような操作**からは卒業しましょう。
                    </p>
                    <p className="font-bold text-white italic">
                        "物理レイヤーが整いました。次は、その裏側でパケットを運ぶ「バックエンド」を最適化します。"
                    </p>
                    <p>
                        次回、三井住友カードをベースとした**「決済バックエンドの構成」**について、ポイント還元という名の二次収益を最大化する手法を詳説します。
                    </p>
                </div>

                {/* 🧭 フッターナビゲーション */}
                <footer className="mt-24 pt-12 border-t border-white/5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono">
                        <Link 
                            href="/series/saving-stack/vol-1" 
                            className="group p-8 rounded-3xl border border-slate-800 bg-white/[0.02] hover:border-blue-500/50 hover:bg-blue-500/5 transition-all text-left relative overflow-hidden shadow-xl"
                        >
                            <span className="text-[10px] text-blue-500 font-bold block mb-4 tracking-[0.2em]">PREV_STP / VOL_01</span>
                            <span className="text-white font-bold group-hover:text-blue-400 transition-colors text-sm leading-tight block font-sans">
                                第1回：家計は「システム」だ。<br/>2026年版・技術スタック
                            </span>
                        </Link>
                        
                        <Link 
                            href="/series/saving-stack/vol-3" 
                            className="group p-8 rounded-3xl border border-slate-800 bg-white/[0.02] hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all text-right relative overflow-hidden shadow-xl"
                        >
                            <span className="text-[10px] text-emerald-500 font-bold block mb-4 tracking-[0.2em]">NEXT_STP / VOL_03</span>
                            <div className="flex items-center justify-end gap-4">
                                <span className="text-white font-bold group-hover:text-emerald-400 transition-colors text-sm leading-tight block font-sans">
                                    第3回：給油決済の<br/>「バックエンド」最適化
                                </span>
                                <ArrowRight className="w-5 h-5 text-slate-600 group-hover:text-emerald-500 transition-all group-hover:translate-x-2" />
                            </div>
                        </Link>
                    </div>

                    <div className="mt-16 flex items-center justify-center gap-4">
                        <div className="h-px w-12 bg-white/5"></div>
                        <Link href="/series/saving-stack" className="text-[10px] font-mono text-slate-500 hover:text-blue-500 transition-colors tracking-widest uppercase font-bold">
                            Return to Index
                        </Link>
                        <div className="h-px w-12 bg-white/5"></div>
                    </div>
                </footer>
            </article>
        </div>
    );
}