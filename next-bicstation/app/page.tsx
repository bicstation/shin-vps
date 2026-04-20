/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
import React from 'react';
import Link from 'next/link';
import { headers } from 'next/headers';
import { 
    Activity, ShieldCheck, Zap, BarChart3, 
    ChevronRight, Cpu, Terminal,
    Layers, ArrowUpRight, Globe, Gauge,
    History, Database, HardDrive, Binary,
    Monitor, BookOpen, Briefcase, GraduationCap,
    Search, Bot, Layout, CircuitBoard, Crown, ShieldAlert
} from 'lucide-react';

// ✅ 共通コンポーネント
import ProductCard from '@/shared/components/organisms/cards/ProductCard';

// ✅ API サービス
import { fetchWPTechInsights } from '@/shared/lib/api/django/wordpress'; 
import { fetchPostList } from '@/shared/lib/api/django/posts';             
import { fetchPCProductRanking } from '@/shared/lib/api/django/pc/stats'; 

// 共通ユーティリティ
import { constructMetadata } from '@/shared/lib/utils/metadata';
import { getSiteMetadata } from '@/shared/lib/utils/siteConfig';

// 🎨 スタイルシート
import styles from './page.module.css';

export const dynamic = 'force-dynamic';
export const revalidate = 600; 

async function safeFetch<T>(fetcher: any, args: any[], fallback: T): Promise<T> {
    try {
        if (typeof fetcher !== 'function') return fallback;
        const data = await fetcher(...args);
        return data ?? fallback;
    } catch (e) {
        console.error(`🚨 [FETCH_ERROR]:`, e);
        return fallback;
    }
}

export async function generateMetadata() {
    const headerList = await headers();
    const host = headerList.get('x-forwarded-host') || headerList.get('host') || "bicstation.com";
    const siteConfig = getSiteMetadata(host);

    return constructMetadata({
        title: `${siteConfig.site_name} | 44年の知見が導くPC・AI解析の極致`,
        description: `14歳のマシン語から始まった44年のエンジニア履歴。物理基盤からAIロジックまで、一貫した論理でPCの真価を解き明かす。`,
        host: host 
    });
}

export default async function HomePageMain() {
    const IS_ADSENSE_REVIEW = true; 
    const headerList = await headers();
    const host = headerList.get('x-forwarded-host') || headerList.get('host') || "bicstation.com";
    const siteConfig = getSiteMetadata(host); 
    const siteTag = siteConfig.site_tag || 'bicstation';

    const [wpLogs, djangoPosts, scoreRank] = await Promise.all([
        safeFetch(fetchWPTechInsights, [6], []),
        safeFetch(fetchPostList, [6, 0, siteTag], { results: [], count: 0 }),
        safeFetch(fetchPCProductRanking, ['score', host], [])
    ]);

    const satelliteLogs = Array.isArray(wpLogs) ? wpLogs : [];
    const corePosts = Array.isArray(djangoPosts?.results) ? djangoPosts.results : [];
    const aiTop3 = Array.isArray(scoreRank) ? scoreRank.slice(0, 3) : [];

    return (
        <div className={styles.mainWrapper}>
            {/* 🛠️ システムステータスバー */}
            <header className={styles.systemStatus}>
                <div className={styles.statusInner}>
                    <div className={styles.pulseIndicator}>
                        <span className={styles.dot}></span>
                        <span className={styles.statusLabel}>システム稼働中：ハイパーコア・アクティブ</span>
                    </div>
                    <div className={styles.versionTag}>
                        {siteConfig.site_name} <span className={styles.verNum}>V3.0 再起動版</span>
                    </div>
                    <div className={styles.nodeStats}>
                        <span className={styles.countNum}> since 1982 技術蓄積中</span>
                    </div>
                </div>
            </header>

            {/* 🚀 ヒーローセクション */}
            <section className={styles.heroSection}>
                <div className={styles.heroBackgroundImage}></div>
                <div className={styles.heroContent}>
                    <div className="mb-4 inline-flex items-center px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-full">
                        <span className="text-emerald-500 text-[10px] font-mono tracking-[0.2em] uppercase">伝統と革新の融合</span>
                    </div>
                    <h1 className={styles.glitchTitle}>{siteConfig.site_name}</h1>
                    <p className={styles.subText}>
                        マシン語からAIまで。44年のエンジニアリングが紡ぐ「論理の要塞」へようこそ。<br />
                        スペックの数値が持つ真の意味を、プロの視点で解き明かします。
                    </p>
                </div>
            </section>

            <div className={styles.contentContainer}>

                {/* 🏰 演算構築ゲートウェイ：Series 10 & 20 デュアル・インデックス */}
                <section className="mb-24">
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                        
                        {/* Series 10: BTO MASTERS (個人・クリエイティブ) */}
                        <Link href="/series/10-bto-masters" className="group block relative p-1 bg-gradient-to-br from-zinc-800 via-zinc-700 to-zinc-800 rounded-2xl overflow-hidden transition-all hover:scale-[1.01] active:scale-[0.99]">
                            <div className="relative bg-[#0a0a0c] rounded-xl p-8 md:p-12 h-full overflow-hidden">
                                <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_30%,rgba(16,185,129,0.05),transparent)] pointer-events-none" />
                                <div className="absolute -bottom-8 -left-8 text-zinc-900 opacity-20 pointer-events-none group-hover:scale-110 transition-transform duration-700">
                                    <Crown size={200} />
                                </div>

                                <div className="flex flex-col h-full relative z-10">
                                    <div className="flex items-center gap-3 mb-6 font-mono text-xs text-emerald-500 tracking-[0.3em]">
                                        <div className="w-8 h-px bg-emerald-500" />
                                        ARCHIVE_10: BTO_MASTERS
                                    </div>
                                    <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter mb-4">
                                        演算構築の<span className="text-emerald-500">真理。</span>
                                    </h2>
                                    <p className="text-zinc-400 text-sm leading-relaxed mb-8 flex-grow">
                                        44年の演算履歴が生んだ「マシン・ファースト」構築論。<br />
                                        ゲーミング、トレーディング、AI開発。用途別の極致を定義する全7系統。
                                    </p>
                                    <div className="flex items-center justify-between pt-6 border-t border-zinc-800/50">
                                        <div className="flex gap-4 text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                                            <span className="flex items-center gap-1"><Zap size={12} className="text-amber-500" /> LOW_LATENCY</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-emerald-500 font-bold text-sm">
                                            MASTER_LOG <ChevronRight size={18} className="group-hover:translate-x-2 transition-transform" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>

                        {/* Series 20: BTO FORTRESS (法人・インフラ・社会防衛) */}
                        <Link href="/series/20-bto-fortress" className="group block relative p-1 bg-gradient-to-br from-blue-900/50 via-zinc-700 to-blue-900/50 rounded-2xl overflow-hidden transition-all hover:scale-[1.01] active:scale-[0.99]">
                            <div className="relative bg-[#0a0a0c] rounded-xl p-8 md:p-12 h-full overflow-hidden">
                                <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_30%,rgba(59,130,246,0.08),transparent)] pointer-events-none" />
                                <div className="absolute -bottom-8 -left-8 text-blue-900/20 opacity-20 pointer-events-none group-hover:scale-110 transition-transform duration-700">
                                    <ShieldCheck size={200} />
                                </div>

                                <div className="flex flex-col h-full relative z-10">
                                    <div className="flex items-center gap-3 mb-6 font-mono text-xs text-blue-400 tracking-[0.3em]">
                                        <div className="w-8 h-px bg-blue-500" />
                                        ARCHIVE_20: BTO_FORTRESS
                                    </div>
                                    <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter mb-4">
                                        不沈の<span className="text-blue-500">演算要塞。</span>
                                    </h2>
                                    <p className="text-zinc-400 text-sm leading-relaxed mb-8 flex-grow">
                                        日本を「ターゲット」にさせない防衛基盤。<br />
                                        金融・医療・公共インフラ。一秒の停滞も許されない社会の心臓部を構築する全9要塞。
                                    </p>
                                    <div className="flex items-center justify-between pt-6 border-t border-zinc-800/50">
                                        <div className="flex gap-4 text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                                            <span className="flex items-center gap-1"><ShieldAlert size={12} className="text-blue-500" /> HIGH_AVAILABILITY</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
                                            FORTRESS_LOG <ChevronRight size={18} className="group-hover:translate-x-2 transition-transform" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>

                    </div>
                </section>

                {/* 🛡️ 性能解析ハブ */}
                <section className="mb-24">
                    <div className={styles.sectionTitleArea}>
                        <h2 className={styles.sectionTitle}>
                            <Gauge className="text-yellow-400 w-5 h-5" /> パフォーマンス解析ハブ
                        </h2>
                        <p className="text-xs text-zinc-500 mt-2">ハードウェアの限界値を論理的に算出し、実効性能を可視化します。</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                        <div className={styles.analysisUnit}>
                            <div className="flex items-center justify-between mb-4">
                                <Cpu className="text-blue-400 w-6 h-6" />
                                <span className="text-[10px] font-mono text-blue-500">演算処理能力</span>
                            </div>
                            <h4 className="text-sm font-bold text-white mb-2">CPU 演算効率の解析</h4>
                            <p className="text-[11px] text-zinc-500 mb-6">マルチコアの並列処理耐性と、TDPによる制限を緻密に計算。</p>
                            <div className="space-y-2">
                                <div className="flex justify-between text-[9px] font-mono text-zinc-400"><span>マルチコア効率評価</span><span>94%</span></div>
                                <div className="h-1 w-full bg-zinc-800 rounded-full"><div className="h-full bg-blue-500 w-[94%]" /></div>
                            </div>
                        </div>
                        <div className={styles.analysisUnit}>
                            <div className="flex items-center justify-between mb-4">
                                <Activity className="text-red-400 w-6 h-6" />
                                <span className="text-[10px] font-mono text-red-400">描画帯域幅</span>
                            </div>
                            <h4 className="text-sm font-bold text-white mb-2">GPU 描画性能の評価</h4>
                            <p className="text-[11px] text-zinc-500 mb-6">VRAMのデータ転送帯域とCUDAコアの実効スループットを解析。</p>
                            <div className="space-y-2">
                                <div className="flex justify-between text-[9px] font-mono text-zinc-400"><span>VRAM スループット</span><span>82%</span></div>
                                <div className="h-1 w-full bg-zinc-800 rounded-full"><div className="h-full bg-red-500 w-[82%]" /></div>
                            </div>
                        </div>
                        <div className={styles.analysisUnit}>
                            <div className="flex items-center justify-between mb-4">
                                <Bot className="text-purple-400 w-6 h-6" />
                                <span className="text-[10px] font-mono text-purple-400">AI推論能力</span>
                            </div>
                            <h4 className="text-sm font-bold text-white mb-2">AI 推論エンジン性能</h4>
                            <p className="text-[11px] text-zinc-500 mb-6">NPUのTOPS値と、ローカルLLM環境でのレスポンス最適化を検証。</p>
                            <div className="space-y-2">
                                <div className="flex justify-between text-[9px] font-mono text-zinc-400"><span>AI推論推計 (TOPS)</span><span>88%</span></div>
                                <div className="h-1 w-full bg-zinc-800 rounded-full"><div className="h-full bg-purple-500 w-[88%]" /></div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 🏆 AI解析：おすすめPCランキング */}
                <section className="mb-24">
                    <div className={styles.sectionTitleArea}>
                        <h2 className={styles.sectionTitle}>
                            <BarChart3 className="text-blue-400 w-5 h-5" /> 独自スコア：厳選PCランキング
                        </h2>
                        <p className="text-xs text-zinc-500 mt-2">AIが数多のスペックデータを解析し、真に価値のある3台を抽出。</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
                        {aiTop3.length > 0 ? aiTop3.map((product: any, i) => (
                            <div key={`ai-${product.unique_id || product.id || i}`} className="relative group">
                                <ProductCard product={product} rank={i + 1} isReviewMode={IS_ADSENSE_REVIEW} />
                                <Zap className="absolute top-4 right-4 w-5 h-5 text-yellow-500 z-10 animate-pulse" />
                            </div>
                        )) : (
                            <div className="col-span-3 text-center py-12 bg-zinc-900/30 border border-dashed border-zinc-800 rounded-2xl">
                                <p className="text-zinc-600 font-mono text-xs uppercase tracking-[0.2em]">最新の解析データをロード中...</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* 🏛️ 6つの技術レイヤー (リンク先：/series/00-master-log/ 統合版) */}
                <section className="mb-24">
                    <div className={styles.sectionTitleArea}>
                        <h2 className={styles.sectionTitle}>
                            <Layers className="text-emerald-400 w-5 h-5" /> アーキテクチャ・インデックス
                        </h2>
                        <p className="text-xs text-zinc-500 mt-2">ハードウェアから人間成長まで。全180講におよぶ知覚の多層構造。</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                        {[
                            { id: "bto", title: "物理演算基盤", color: "orange", icon: <HardDrive size={24} />, desc: "自作PCからサーバー、10GbEネットワークまで." },
                            { id: "software", title: "論理環境構築", color: "blue", icon: <Terminal size={24} />, desc: "OS、Docker、WEBデプロイ。演算を価値に変えるための土壌。" },
                            { id: "ai", title: "知能自動化", color: "emerald", icon: <Binary size={24} />, desc: "ローカルLLM、Python解析。AIを「部下」として使いこなす技術。" },
                            { id: "lifestyle", title: "生活空間統合", color: "rose", icon: <Globe size={24} />, desc: "スマートホーム、EV連携。テクノロジーを肉体の一部にする。" },
                            { id: "dev", title: "自己媒体構築", color: "indigo", icon: <Layout size={24} />, desc: "Next.jsとDjangoの統合。思考を世界へ同期させる拠点形成。" },
                            { id: "career", title: "高次人間成長", color: "amber", icon: <GraduationCap size={24} />, desc: "44年のマインドセット。エンジニアとしての進化。" },
                        ].map((item, idx) => (
                            <Link 
                                key={item.id} 
                                href={`/series/00-master-log/${item.id}`} // ✅ 統合ディレクトリへリンク
                                className="p-8 bg-zinc-900/30 border border-zinc-800 rounded-2xl hover:border-zinc-500/50 transition-all flex flex-col group relative overflow-hidden"
                            >
                                <div className={`mb-6 text-zinc-400 group-hover:text-white transition-colors`}>
                                    {item.icon}
                                </div>
                                <span className={`text-zinc-500 font-mono text-[10px] mb-2 uppercase tracking-widest`}>LAYER_0{idx + 1}</span>
                                <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                                <p className="text-xs text-zinc-500 flex-grow leading-relaxed">{item.desc}</p>
                                <div className="mt-6 flex items-center text-[10px] text-zinc-400 font-bold uppercase tracking-widest group-hover:text-white transition-colors">
                                    アクセスする <ArrowUpRight className="ml-2 w-3 h-3" />
                                </div>
                                
                                {/* カラーアクセント装飾 */}
                                <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none
                                    ${item.id === 'bto' ? 'from-orange-500' : ''}
                                    ${item.id === 'software' ? 'from-blue-500' : ''}
                                    ${item.id === 'ai' ? 'from-emerald-500' : ''}
                                    ${item.id === 'lifestyle' ? 'from-rose-500' : ''}
                                    ${item.id === 'dev' ? 'from-indigo-500' : ''}
                                    ${item.id === 'career' ? 'from-amber-500' : ''}
                                `} />
                            </Link>
                        ))}
                    </div>
                </section>

                {/* 🌐 最新記事フィード */}
                <section className="mb-24">
                    <div className={styles.sectionTitleArea}>
                        <h2 className={styles.sectionTitle}><Globe className="text-zinc-400 w-5 h-5" /> 最新インテリジェンス</h2>
                        <p className="text-xs text-zinc-500 mt-2">技術解説ログ（WP）と、コア解析記事（Django）を同時配信。</p>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                        <div className="space-y-4">
                            <h3 className="text-[10px] font-bold text-emerald-500 uppercase tracking-[0.3em] border-l-2 border-emerald-500 pl-4 mb-6">技術解説サテライトログ</h3>
                            {satelliteLogs.slice(0, 3).map((post: any) => (
                                <Link href={`/news/${post.slug || post.id}`} key={post.id} className="flex items-center justify-between p-5 bg-zinc-900/30 rounded-xl border border-zinc-800/50 hover:bg-zinc-800/80 transition-all group">
                                    <p className="text-sm font-bold text-zinc-300 group-hover:text-emerald-400 transition-colors">{post.title}</p>
                                    <ChevronRight className="w-4 h-4 text-zinc-700 group-hover:text-emerald-500 transition-colors" />
                                </Link>
                            ))}
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.3em] border-l-2 border-blue-400 pl-4 mb-6">コア解析・深掘りレポート</h3>
                            {corePosts.slice(0, 3).map((post: any) => (
                                <Link href={`/post/${post.slug || post.id}`} key={post.id} className="flex items-center justify-between p-5 bg-zinc-900/30 rounded-xl border border-zinc-800/50 hover:bg-zinc-800/80 transition-all group">
                                    <p className="text-sm font-bold text-zinc-300 group-hover:text-blue-400 transition-colors">{post.title}</p>
                                    <ChevronRight className="w-4 h-4 text-zinc-700 group-hover:text-blue-400 transition-colors" />
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 🛡️ Trust Chronicle */}
                <section className="mb-24 py-16 px-8 bg-zinc-900/40 border border-zinc-800 rounded-3xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
                        <History size={250} />
                    </div>
                    <div className="flex items-center gap-4 mb-12">
                        <History className="text-emerald-500 w-5 h-5" />
                        <h2 className="text-xl font-black text-white uppercase tracking-tighter italic">信頼の軌跡 - Trust Chronicle</h2>
                        <div className="h-[1px] flex-grow bg-zinc-800/50"></div>
                    </div>
                    
                    <div className="mb-12 max-w-3xl">
                        <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                            情報の洪水の中で、誰の言葉を信じるか。その答えは「経験の厚み」にあると私は考えます。<br />
                            14歳のマシン語から始まり、UNIX研究室でのAI哲学、20年の現場経営。
                            点として存在していた44年の履歴を、いま、最新のフルスタック技術で一つに統合しました。
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { date: "1982-1984", cat: "ORIGIN", title: "PC-8001 マシン語", desc: "14歳。ベーマガ掲載。ハードの鼓動を直感した原体験。", color: "emerald", icon: <Monitor size={14} /> },
                            { date: "1987-1991", cat: "LOGIC", title: "自然言語処理 & Prolog", desc: "UNIX研究室。AIの哲学的・論理的基盤を学ぶ。", color: "blue", icon: <BookOpen size={14} /> },
                            { date: "1998-2018", cat: "BUSINESS", title: "経営とWeb開発の融合", desc: "現場主義のフルスタック開発。ユーザーのリアルを熟知。", color: "purple", icon: <Briefcase size={14} /> },
                            { date: "2026-PRES", cat: "INTEGRATION", title: "フルスタック再構築", desc: "Next.js/Djangoによる最終統合。知見の全アーカイブ化。", color: "yellow", icon: <Cpu size={14} /> }
                        ].map((exp, idx) => (
                            <div key={idx} className="relative p-6 bg-zinc-900/50 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-all group">
                                <div className={`flex items-center gap-2 mb-3 text-${exp.color}-500 font-mono text-[9px] uppercase tracking-widest`}>
                                    {exp.icon} {exp.date}
                                </div>
                                <h4 className="text-sm font-bold text-zinc-100 mb-2">{exp.title}</h4>
                                <p className="text-[11px] text-zinc-500 leading-relaxed italic">{exp.desc}</p>
                            </div>
                        ))}
                    </div>

                    <Link href="/series/00-master-log" className="mt-12 block p-8 bg-gradient-to-r from-emerald-500/10 to-transparent border border-emerald-500/20 rounded-2xl hover:border-emerald-500/50 transition-all group">
                         <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-white mb-1">Layer_00: 全180講のマスターログを閲覧する</h3>
                                <p className="text-xs text-zinc-500">44年の演算履歴。物理基盤からAI活用までを体系化したメイン・アーカイブへ。</p>
                            </div>
                            <ChevronRight className="w-6 h-6 text-emerald-500 group-hover:translate-x-2 transition-transform" />
                         </div>
                    </Link>
                </section>

                {/* MISSION */}
                <section className={styles.missionSection}>
                    <div className={styles.missionCard}>
                        <h3 className={styles.sectionTitle}>ミッション・ステートメント</h3>
                        <p className={styles.missionText}>
                            当サイトは、44年のエンジニアキャリアに基づく技術の要塞です。<br />
                            AIがスペックを客観的に数値化し、プロの視点がその背後にある意味を解釈します。<br />
                            「正しい道具を、正しい論理で選ぶ」ための知見をここに集約します。
                        </p>
                    </div>
                </section>
            </div>

            <footer className={styles.systemFooter}>
                <div className="max-w-6xl mx-auto px-4 py-20 grid grid-cols-1 md:grid-cols-3 gap-16 text-left">
                    <div>
                        <h5 className="text-white text-[10px] font-mono mb-8 uppercase tracking-[0.4em] border-b border-zinc-800 pb-2">サイト案内</h5>
                        <ul className="space-y-4">
                            <li><Link href="/about" className="text-xs text-zinc-500 hover:text-emerald-400 transition-colors uppercase font-mono">/ 運営者のアイデンティティ</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h5 className="text-white text-[10px] font-mono mb-8 uppercase tracking-[0.4em] border-b border-zinc-800 pb-2">法的情報</h5>
                        <ul className="space-y-4">
                            <li><Link href="/privacy-policy" className="text-xs text-zinc-500 hover:text-emerald-400 transition-colors uppercase font-mono">/ プライバシー・プロトコル</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h5 className="text-white text-[10px] font-mono mb-8 uppercase tracking-[0.4em] border-b border-zinc-800 pb-2">コンタクト</h5>
                        <ul className="space-y-4">
                            <li><Link href="/contact" className="text-xs text-zinc-500 hover:text-emerald-400 transition-colors uppercase font-mono">/ 通信ノードを開く</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="border-t border-zinc-900 py-10 text-center bg-black/80">
                    <p className="text-[10px] text-zinc-600 font-mono tracking-[0.5em] uppercase">&copy; {new Date().getFullYear()} {siteConfig.site_name} - 全システム正常稼働中</p>
                </div>
            </footer>
        </div>
    );
}