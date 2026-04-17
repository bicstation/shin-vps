/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
// /home/maya/shin-dev/shin-vps/next-bicstation/app/page.tsx

import React from 'react';
import Link from 'next/link';
import { headers } from 'next/headers';
import { 
    Activity, ShieldCheck, Zap, TrendingUp, BarChart3, 
    Database, FileText, ChevronRight, Cpu, Layout, Info, Mail, Lock,
    History, Rocket, HardDrive, Cpu as CpuIcon, Monitor, Smartphone, Terminal
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

const IS_ADSENSE_REVIEW = true; 

/**
 * 🛡️ フェッチ・ガード
 */
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
        title: `${siteConfig.site_name} | 44年のエンジニア知見が紡ぐPC解析アーカイブ`,
        description: `ベテランエンジニアによるハードウェア解析と最新技術ログ。自作PHP MVCからNext.js/Djangoへの進化を綴る技術連載を公開中。`,
        host: host 
    });
}

export default async function HomePageMain() {
    const headerList = await headers();
    const host = headerList.get('x-forwarded-host') || headerList.get('host') || "bicstation.com";
    const siteConfig = getSiteMetadata(host); 
    const siteTag = siteConfig.site_tag || 'bicstation';

    // --- 🎯 データソース一括取得 ---
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
            <header className={styles.systemStatus} aria-label="System Node Status">
                <div className={styles.statusInner}>
                    <div className={styles.pulseIndicator}>
                        <span className={styles.dot}></span>
                        <span className={styles.statusLabel}>解析システム稼働中</span>
                    </div>
                    <div className={styles.versionTag}>
                        {siteConfig.site_name} <span className={styles.verNum}>NODE_V11.1.0</span>
                    </div>
                    <div className={styles.nodeStats}>
                        <span className={styles.countNum}>44Years_Experience_Archive</span>
                    </div>
                </div>
            </header>

            {/* 🚀 ヒーローセクション：独自性の宣言 */}
            <section className={styles.heroSection}>
                <div className={styles.heroBackgroundImage}></div>
                <div className={styles.heroContent}>
                    <h1 className={styles.glitchTitle}>{siteConfig.site_name}</h1>
                    <p className={styles.subText}>44年のエンジニアリングが導き出す、スペックの裏側にある「真実」。</p>
                    <div className="mt-6 flex flex-wrap justify-center gap-4">
                        <span className="px-3 py-1 bg-blue-500/20 border border-blue-500/40 text-blue-300 text-[10px] rounded-full font-mono">独自アルゴリズム解析</span>
                        <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] rounded-full font-mono">ハードウェア鑑定</span>
                        <span className="px-3 py-1 bg-purple-500/20 border border-purple-500/40 text-purple-300 text-[10px] rounded-full font-mono">実稼働ログ</span>
                    </div>
                </div>
            </section>

            <div className={styles.contentContainer}>

                {/* 🏆 Section 1: AI解析ランキング（メインコンテンツを最上段へ） */}
                <section className="mb-20">
                    <div className={styles.sectionTitleArea}>
                        <h2 className={styles.sectionTitle}>
                            <BarChart3 className="text-blue-400 w-5 h-5" /> AI解析：高性能PCピックアップ
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {aiTop3.length > 0 ? aiTop3.map((product: any, i) => (
                            <div key={`ai-${product.unique_id || product.id || i}`} className="relative group">
                                <ProductCard product={product} rank={i + 1} isReviewMode={IS_ADSENSE_REVIEW} />
                                <Zap className="absolute top-4 right-4 w-5 h-5 text-yellow-500 z-10 animate-pulse" />
                            </div>
                        )) : (
                            <div className="col-span-3 text-center py-20 bg-black/20 border border-dashed border-slate-800 rounded-xl">
                                <p className="text-slate-500 font-mono text-xs">解析ストリーム待機中...</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* 🏷️ 属性ナビゲーション：情報の整理（Copilot対策：回遊性向上） */}
                <section className="mb-24 py-10 border-y border-slate-800/50">
                    <h3 className="text-[10px] text-slate-500 font-mono mb-6 text-center tracking-widest uppercase">Select by Attributes / 属性別絞り込み</h3>
                    <div className="flex flex-wrap justify-center gap-3">
                        <Link href="/category/core-ultra" className="px-4 py-2 bg-slate-800/50 hover:bg-blue-600/30 border border-slate-700 rounded text-xs transition-all flex items-center"><CpuIcon className="w-3 h-3 mr-2 text-blue-400"/> Core Ultra</Link>
                        <Link href="/category/geforce-rtx" className="px-4 py-2 bg-slate-800/50 hover:bg-red-600/30 border border-slate-700 rounded text-xs transition-all flex items-center"><Activity className="w-3 h-3 mr-2 text-red-400"/> RTX 50 Series</Link>
                        <Link href="/category/thin-light" className="px-4 py-2 bg-slate-800/50 hover:bg-emerald-600/30 border border-slate-700 rounded text-xs transition-all flex items-center"><Smartphone className="w-3 h-3 mr-2 text-emerald-400"/> 1kg未満</Link>
                        <Link href="/category/workstation" className="px-4 py-2 bg-slate-800/50 hover:bg-purple-600/30 border border-slate-700 rounded text-xs transition-all flex items-center"><Monitor className="w-3 h-3 mr-2 text-purple-400"/> Workstation</Link>
                        <Link href="/category/memory-high" className="px-4 py-2 bg-slate-800/50 hover:bg-yellow-600/30 border border-slate-700 rounded text-xs transition-all flex items-center"><HardDrive className="w-3 h-3 mr-2 text-yellow-400"/> 64GB RAM+</Link>
                    </div>
                </section>

                {/* 🛡️ MODERNIZATION_LOGS & SERIES（独自コンテンツ・シリーズもの） */}
                <section className="mb-24">
                    <div className={styles.sectionTitleArea}>
                        <h2 className={styles.sectionTitle}>
                            <Terminal className="text-emerald-400 w-5 h-5" /> TECHNICAL_SERIALS
                            <span className="text-[10px] ml-2 text-slate-500 font-mono italic">エンジニアの血が通った連載ログ</span>
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                        {/* シリーズ 01: PHP MVC 編 */}
                        <Link href="/series/php-mvc-legacy" className="group p-6 bg-slate-900/60 border border-slate-800 rounded-xl hover:border-emerald-500/50 transition-all shadow-lg">
                            <div className="flex items-center mb-3">
                                <History className="text-emerald-500 w-4 h-4 mr-2" />
                                <span className="text-[10px] text-emerald-500 font-mono">PHASE_01: ARCHIVE</span>
                            </div>
                            <h3 className="text-base font-bold text-white group-hover:text-emerald-400 mb-2">自作 PHP MVC と堅牢な DB 構築</h3>
                            <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                                レンタルサーバーの制約を自作フレームワークで突破。ER図と格闘し、正規化を突き詰めたDB設計の原点。
                            </p>
                            <div className="mt-4 pt-4 border-t border-slate-800 flex items-center text-[10px]">
                                <span className="text-emerald-500">全10回・完結</span>
                                <span className="ml-auto text-slate-500 group-hover:text-emerald-400">READ LOG 〉</span>
                            </div>
                        </Link>

                        {/* シリーズ 02: Modern Stack 編 */}
                        <Link href="/series/modern-fullstack-roadmap" className="group p-6 bg-slate-900/60 border border-slate-800 rounded-xl hover:border-blue-500/50 transition-all shadow-lg">
                            <div className="flex items-center mb-3">
                                <Rocket className="text-blue-500 w-4 h-4 mr-2" />
                                <span className="text-[10px] text-blue-500 font-mono">PHASE_02: EVOLUTION</span>
                            </div>
                            <h3 className="text-base font-bold text-white group-hover:text-blue-400 mb-2">Next.js × Django 移行実録</h3>
                            <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                                365万件の巨大データを捌くモダン構成への移行記。メモリ8GBの選定からドメイン分離まで。
                            </p>
                            <div className="mt-4 pt-4 border-t border-slate-800 flex items-center text-[10px]">
                                <span className="text-blue-500">進行中・アーカイブ公開</span>
                                <span className="ml-auto text-slate-500 group-hover:text-blue-400">READ LOG 〉</span>
                            </div>
                        </Link>

                        {/* シリーズ 03: 【ダミー/新規】 AIインフラ編 */}
                        <Link href="/series/ai-infrastructure" className="group p-6 bg-slate-900/60 border border-slate-800 rounded-xl hover:border-purple-500/50 transition-all shadow-lg">
                            <div className="flex items-center mb-3">
                                <Activity className="text-purple-500 w-4 h-4 mr-2" />
                                <span className="text-[10px] text-purple-500 font-mono">PHASE_03: INTELLIGENCE</span>
                            </div>
                            <h3 className="text-base font-bold text-white group-hover:text-purple-400 mb-2">ローカルLLMと解析エンジンの統合</h3>
                            <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                                Llama 3を用いた自動スペック鑑定の裏側。プロンプトエンジニアリングによる精度向上の全記録。
                            </p>
                            <div className="mt-4 pt-4 border-t border-slate-800 flex items-center text-[10px]">
                                <span className="text-purple-500">新規連載・第4回まで</span>
                                <span className="ml-auto text-slate-500 group-hover:text-purple-400">READ LOG 〉</span>
                            </div>
                        </Link>
                    </div>
                </section>

                {/* 🛰️ Section: 技術ログ (サブコンテンツとして配置) */}
                <section className="mb-24 opacity-90">
                    <div className={styles.sectionTitleArea}>
                        <h2 className={styles.sectionTitle}>
                            <FileText className="text-slate-400 w-5 h-5" /> FEEDS & INSIGHTS
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <h3 className="text-xs font-bold text-emerald-500 border-l-2 border-emerald-500 pl-2 uppercase">現場の構築ログ（WP Satellite）</h3>
                            {satelliteLogs.length > 0 ? satelliteLogs.slice(0, 3).map((post: any) => (
                                <Link href={`/news/${post.slug || post.id}`} key={post.id} className="flex items-center p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all group border border-transparent hover:border-slate-800">
                                    <div className="flex-1">
                                        <span className="text-[10px] text-emerald-500 font-mono block">{new Date(post.date).toLocaleDateString()}</span>
                                        <p className="text-sm font-bold text-slate-200 group-hover:text-emerald-400 line-clamp-1">{post.title}</p>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-slate-600" />
                                </Link>
                            )) : <p className="text-xs text-slate-600 font-mono">受信待機中...</p>}
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-xs font-bold text-blue-400 border-l-2 border-blue-400 pl-2 uppercase">コアシステム開発（Django Core）</h3>
                            {corePosts.length > 0 ? corePosts.slice(0, 3).map((post: any) => (
                                <Link href={`/post/${post.slug || post.id}`} key={post.id} className="flex items-center p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all group border border-transparent hover:border-slate-800">
                                    <div className="flex-1">
                                        <span className="text-[10px] text-blue-400 font-mono block">{new Date(post.created_at || Date.now()).toLocaleDateString()}</span>
                                        <p className="text-sm font-bold text-slate-200 group-hover:text-blue-400 line-clamp-1">{post.title}</p>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-slate-600" />
                                </Link>
                            )) : <p className="text-xs text-slate-600 font-mono">同期中...</p>}
                        </div>
                    </div>
                </section>

                {/* 🛡️ MISSION_STATEMENT（信頼性の担保） */}
                <section className={styles.missionSection}>
                    <div className={styles.missionCard}>
                        <h3 className={styles.sectionTitle}>MISSION_STATEMENT</h3>
                        <p className={styles.missionText}>
                            当サイトは、44年のエンジニアキャリアに基づく技術アーカイブです。AIがスペックを数値化し、プロの視点がその意味を解釈します。
                            情報の氾濫する現代において、「どのデータが真実か」を定義することが我々の使命です。
                        </p>
                        <div className="mt-6 text-center">
                            <Link href="/about" className="text-[10px] text-blue-400 border border-blue-400/30 px-4 py-2 rounded hover:bg-blue-400/10 transition-all">VIEW OPERATOR PROFILE 〉</Link>
                        </div>
                    </div>
                </section>
            </div>

            {/* 🛡️ フッター */}
            <footer className={styles.systemFooter}>
                <div className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
                    <div>
                        <h5 className="text-white text-sm font-bold mb-6 flex items-center justify-center md:justify-start">
                            <Info className="w-4 h-4 mr-2 text-blue-400" /> 運営者情報
                        </h5>
                        <ul className="text-xs text-slate-400 space-y-3">
                            <li><Link href="/about" className="hover:text-blue-400 transition-colors underline decoration-slate-700">{siteConfig.site_name}について</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h5 className="text-white text-sm font-bold mb-6 flex items-center justify-center md:justify-start">
                            <Lock className="w-4 h-4 mr-2 text-blue-400" /> 法的告知
                        </h5>
                        <ul className="text-xs text-slate-400 space-y-3">
                            <li><Link href="/privacy-policy" className="hover:text-blue-400 transition-colors underline decoration-slate-700">プライバシーポリシー（広告配信）</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h5 className="text-white text-sm font-bold mb-6 flex items-center justify-center md:justify-start">
                            <Mail className="w-4 h-4 mr-2 text-blue-400" /> CONTACT
                        </h5>
                        <ul className="text-xs text-slate-400 space-y-3">
                            <li><Link href="/contact" className="hover:text-blue-400 transition-colors underline decoration-slate-700">解析依頼・取材</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="border-t border-slate-800 pt-8 pb-6">
                    <p className={styles.copyright}>&copy; 2026 {siteConfig.site_name} - SHIN CORE LINX</p>
                </div>
            </footer>
        </div>
    );
}