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
    Search, CpuChip, Bot
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

// 🎨 スタイルシート (V12.5 TACTICAL-OVERHAUL)
import styles from './page.module.css';

export const dynamic = 'force-dynamic';
export const revalidate = 600; 

const IS_ADSENSE_REVIEW = true; 

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
                            <p className="text-[11px] text-zinc-500 mb-6">マルチコアの並列処理耐性と、TDP（熱設計電力）による制限を緻密に計算。</p>
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
                            <p className="text-[11px] text-zinc-500 mb-6">VRAMのデータ転送帯域とCUDAコアの実効スループットを解析します。</p>
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

                {/* 🏛️ 6つの技術レイヤー */}
                <section className="mb-24">
                    <div className={styles.sectionTitleArea}>
                        <h2 className={styles.sectionTitle}>
                            <Layers className="text-emerald-400 w-5 h-5" /> ナレッジ・レイヤー：技術の多層構造
                        </h2>
                        <p className="text-xs text-zinc-500 mt-2">ハードからソフト、人間成長まで。私の思考を構成する6つの領域。</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                        {[
                            { id: "01-hardware", title: "物理基盤", color: "blue", tag: "Hardware", desc: "自作PCからサーバー、10GbE高速ネットワーク構築まで。" },
                            { id: "02-software", title: "環境構築", color: "indigo", tag: "Software", desc: "OS、Docker、WEBデプロイメントの最適解を追求。" },
                            { id: "03-ai-logic", title: "人工知能", color: "purple", tag: "AI Logic", desc: "ローカルLLM活用、Pythonによるデータ解析、知的自動化。" },
                            { id: "04-Life-Integration", title: "生活統合", color: "orange", tag: "Life", desc: "スマートホーム、EV連携、デジタルと空間の同期。" },
                            { id: "05-home-page", title: "媒体構築", color: "yellow", tag: "Media", desc: "Next.jsとDjangoによる、この情報発信拠点の形成。" },
                            { id: "06-human-growth", title: "人間成長", color: "emerald", tag: "Growth", desc: "継続的学習、エンジニアとしてのマインドセット、人材育成。" },
                        ].map((item) => (
                            <Link key={item.id} href={`/series/${item.id}`} className="p-8 bg-zinc-900/30 border border-zinc-800 rounded-2xl hover:border-zinc-500/50 transition-all flex flex-col group relative overflow-hidden">
                                <span className={`text-${item.color}-500 font-mono text-[10px] mb-2 uppercase tracking-widest`}>LAYER_{item.id.split('-')[0]}</span>
                                <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                                <p className="text-xs text-zinc-500 flex-grow">{item.desc}</p>
                                <div className="mt-6 flex items-center text-[10px] text-zinc-400 font-bold uppercase tracking-widest group-hover:text-white transition-colors">
                                    アクセスする <ArrowUpRight className="ml-2 w-3 h-3" />
                                </div>
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

                {/* 🛡️ Trust Chronicle (プロフィールセクション) */}
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
                            情報の洪水の中で、誰の言葉を信じるか。その答えは「経験の厚み」にあると私は考えます。
                            マシン語によるハード制御、UNIX研究室でのAI哲学、20年の現場経営。
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

                    {/* アーカイブへのリンク */}
                    <Link href="/series/99-archive" className="mt-12 block p-8 bg-gradient-to-r from-emerald-500/10 to-transparent border border-emerald-500/20 rounded-2xl hover:border-emerald-500/50 transition-all group">
                         <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-white mb-1">Layer_99: 全技術アーカイブを閲覧する</h3>
                                <p className="text-xs text-zinc-500">1982年から続く全開発ログ・試行錯誤の全記録へ。</p>
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
                            <li><Link href="/contact" className="text-xs text-zinc-500 hover:text-emerald-400 transition-colors uppercase font-mono">/ 通信ノードを開く（お問い合わせ）</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="border-t border-zinc-900 py-10 text-center bg-black/80">
                    <p className="text-[10px] text-zinc-600 font-mono tracking-[0.5em] uppercase">&copy; 2026 {siteConfig.site_name} - 全システム正常稼働中</p>
                </div>
            </footer>
        </div>
    );
}