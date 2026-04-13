/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
/**
 * =====================================================================
 * 🛰️ BICSTATION TOP_NODE_V11.1.0 (Dual-Roadmap Integration)
 * 🛡️ Maya's Logic: 堅牢化 v11.1.0 / 審査対策・二大連載ロジック注入
 * 💎 Update: 
 * 1. サイト構築の歩みを可視化する「Modernization Logs」セクション新設
 * 2. PHP MVC編 (Legacy) と Next.js×Django編 (Modern) の二連載を統合
 * 3. 44年の知見を裏付ける「一次情報」への導線を強化
 * =====================================================================
 */

import React from 'react';
import Link from 'next/link';
import { headers } from 'next/headers';
import { 
    Activity, ShieldCheck, Zap, TrendingUp, BarChart3, 
    Database, FileText, ChevronRight, Cpu, Layout, Info, Mail, Lock,
    History, Rocket
} from 'lucide-react';

// ✅ 共有コンポーネント
import ProductCard from '@/shared/components/organisms/cards/ProductCard';

// ✅ API サービス
import { fetchWPTechInsights } from '@/shared/lib/api/django/wordpress'; 
import { fetchPostList } from '@/shared/lib/api/django/posts';           
import { fetchPCProductRanking } from '@/shared/lib/api/django/pc';      

// 共通ユーティリティ
import { constructMetadata } from '@/shared/lib/utils/metadata';
import { getSiteMetadata } from '@/shared/lib/utils/siteConfig';

// 🎨 スタイルシート
import styles from './page.module.css';

export const dynamic = 'force-dynamic';
export const revalidate = 600; 

const IS_ADSENSE_REVIEW = true; 

/**
 * 🛡️ 高度なフェッチ・ガード
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
    const host = headerList.get('host') || "bicstation.com";
    const siteConfig = getSiteMetadata(host);

    return constructMetadata({
        title: `${siteConfig.site_name.toUpperCase()} | 44年のエンジニア知見によるPC解析アーカイブ`,
        description: `ベテランエンジニアによるハードウェア解析と最新技術ログ。PHP MVCからNext.js/Djangoへの進化を綴る技術連載を公開中。`,
        host: host 
    });
}

export default async function HomePageMain() {
    const headerList = await headers();
    const host = headerList.get('host') || "bicstation.com";
    const siteConfig = getSiteMetadata(host); 
    const siteTag = siteConfig.site_tag || 'bicstation';

    // --- 🎯 データソース一括取得 ---
    const [wpLogs, djangoPosts, pcRankingData, scoreRank, popularityRank] = await Promise.all([
        safeFetch(fetchWPTechInsights, [6], []),
        safeFetch(fetchPostList, [6, 0, siteTag], { results: [], count: 0 }),
        safeFetch(fetchPCProductRanking, ['score', host], []),
        safeFetch(fetchPCProductRanking, ['score', host], []),
        safeFetch(fetchPCProductRanking, ['popularity', host], [])
    ]);

    const satelliteLogs = Array.isArray(wpLogs) ? wpLogs : [];
    const corePosts = Array.isArray(djangoPosts?.results) ? djangoPosts.results : [];
    const aiTop3 = Array.isArray(scoreRank) ? scoreRank.slice(0, 3) : [];
    const trendTop3 = Array.isArray(popularityRank) ? popularityRank.slice(0, 3) : [];
    const pcArchiveSample = Array.isArray(pcRankingData) ? pcRankingData.slice(0, 4) : [];

    return (
        <div className={styles.mainWrapper}>
            {/* 🛠️ システムステータスバー */}
            <header className={styles.systemStatus} aria-label="System Node Status">
                <div className={styles.statusInner}>
                    <div className={styles.pulseIndicator}>
                        <span className={styles.dot}></span>
                        <span className={styles.statusLabel}>HYBRID_CORE_ONLINE</span>
                    </div>
                    <div className={styles.versionTag}>
                        {siteConfig.site_name.toUpperCase()} <span className={styles.verNum}>NODE_V11.1.0_SERIES_OPT</span>
                    </div>
                    <div className={styles.nodeStats}>
                        <span className={styles.countNum}>44Years_Experience_Archive</span>
                    </div>
                </div>
            </header>

            {/* 🚀 ヒーローセクション */}
            <section className={styles.heroSection}>
                <div className={styles.heroBackgroundImage}></div>
                <div className={styles.heroContent}>
                    <h1 className={styles.glitchTitle}>{siteConfig.site_name.toUpperCase()}</h1>
                    <p className={styles.subText}>プロの視点が、スペックの裏側を解き明かす。</p>
                    <p className="text-[10px] opacity-60 mt-2 tracking-[0.2em] font-mono">44 YEARS OF ENGINEERING PRIDE</p>
                </div>
            </section>

            <div className={styles.contentContainer}>

                {/* 🛡️ 新設：MODERNIZATION_LOGS（二大連載セクション） */}
                <section className="mb-24 py-12 px-6 bg-slate-900/40 border border-blue-500/20 rounded-2xl">
                    <div className={styles.sectionTitleArea}>
                        <h2 className={styles.sectionTitle}>
                            <Activity className="text-blue-400 w-5 h-5" /> MODERNIZATION_LOGS
                            <span className="text-[10px] ml-2 text-slate-500 font-mono italic">Tech_Evolution_Roadmap</span>
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                        {/* シリーズ 01: PHP MVC 編 */}
                        <Link href="/series/php-mvc-legacy" className="group p-6 bg-black/40 border border-slate-800 rounded-xl hover:border-emerald-500/50 transition-all">
                            <div className="flex items-center mb-3">
                                <History className="text-emerald-500 w-4 h-4 mr-2" />
                                <span className="text-[10px] text-emerald-500 font-mono">PHASE_01: LEGACY_CHALLENGE</span>
                            </div>
                            <h3 className="text-lg font-bold text-white group-hover:text-emerald-400">自作 PHP MVC と堅牢な DB 構築</h3>
                            <p className="text-xs text-slate-400 mt-2 leading-relaxed line-clamp-2">
                                レンタルサーバーの制約を自作フレームワークで突破。ER図と格闘し、正規化を突き詰めたデータベース設計の原点。
                            </p>
                            <div className="mt-4 flex items-center text-[10px]">
                                <span className="bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded">全10回・完結</span>
                                <span className="ml-auto text-slate-500 flex items-center group-hover:text-emerald-400">READ_LOGS <ChevronRight className="w-3 h-3 ml-1" /></span>
                            </div>
                        </Link>

                        {/* シリーズ 02: Modern Stack 編 */}
                        <Link href="/series/modern-fullstack-roadmap" className="group p-6 bg-black/40 border border-slate-800 rounded-xl hover:border-blue-500/50 transition-all">
                            <div className="flex items-center mb-3">
                                <Rocket className="text-blue-500 w-4 h-4 mr-2" />
                                <span className="text-[10px] text-blue-500 font-mono">PHASE_02: MODERN_EVOLUTION</span>
                            </div>
                            <h3 className="text-lg font-bold text-white group-hover:text-blue-400">Next.js × Django 爆速サイト構築</h3>
                            <p className="text-xs text-slate-400 mt-2 leading-relaxed line-clamp-2">
                                365万件の巨大データを捌くモダン構成への移行実録。メモリ8GBの選定からドメイン分離まで、当サイトの全基盤。
                            </p>
                            <div className="mt-4 flex items-center text-[10px]">
                                <span className="bg-blue-500/10 text-blue-500 px-2 py-1 rounded">全10回・完結</span>
                                <span className="ml-auto text-slate-500 flex items-center group-hover:text-blue-400">READ_LOGS <ChevronRight className="w-3 h-3 ml-1" /></span>
                            </div>
                        </Link>
                    </div>
                </section>

                {/* 🏆 Section 1: AI解析ランキング */}
                <section className="mb-24">
                    <div className={styles.sectionTitleArea}>
                        <h2 className={styles.sectionTitle}>
                            <BarChart3 className="text-blue-400 w-5 h-5" /> AI解析：高性能PCランキング <span className="text-[10px] ml-2 text-slate-500 font-mono">AI_TOP_3</span>
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {aiTop3.length > 0 ? aiTop3.map((product: any, i) => (
                            <div key={`ai-${product.unique_id || product.id || i}`} className="relative group">
                                <ProductCard product={product} rank={i + 1} isReviewMode={IS_ADSENSE_REVIEW} />
                                <Zap className="absolute top-4 right-4 w-5 h-5 text-yellow-500 z-10 animate-pulse" />
                            </div>
                        )) : <p className="text-slate-500 font-mono text-xs text-center py-12">AWAITING_ANALYSIS_STREAM...</p>}
                    </div>
                </section>

                {/* 🛰️ Section 2 & 3: 技術ログ */}
                <section className="mb-24">
                    <div className={styles.sectionTitleArea}>
                        <h2 className={styles.sectionTitle}>
                            <FileText className="text-emerald-400 w-5 h-5" /> 最新技術レポート <span className="text-[10px] ml-2 text-slate-500 font-mono">TECH_ARCHIVES</span>
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <h3 className="text-xs font-bold text-emerald-500 border-l-2 border-emerald-500 pl-2 uppercase">現場の苦行ログ（WordPress）</h3>
                            {satelliteLogs.length > 0 ? satelliteLogs.slice(0, 3).map((post: any) => (
                                <Link href={`/news/${post.slug || post.id}`} key={post.id} className="flex items-center p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all group">
                                    <div className="flex-1">
                                        <span className="text-[10px] text-emerald-500 font-mono block">{new Date(post.date).toLocaleDateString()}</span>
                                        <p className="text-sm font-bold text-slate-200 group-hover:text-emerald-400 line-clamp-1">{post.title}</p>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-slate-600" />
                                </Link>
                            )) : <p className="text-xs text-slate-600 font-mono">NO_STREAM</p>}
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-xs font-bold text-blue-400 border-l-2 border-blue-400 pl-2 uppercase">コアシステム更新（Django）</h3>
                            {corePosts.length > 0 ? corePosts.slice(0, 3).map((post: any) => (
                                <Link href={`/post/${post.slug || post.id}`} key={post.id} className="flex items-center p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all group">
                                    <div className="flex-1">
                                        <span className="text-[10px] text-blue-400 font-mono block">{new Date(post.created_at || Date.now()).toLocaleDateString()}</span>
                                        <p className="text-sm font-bold text-slate-200 group-hover:text-blue-400 line-clamp-1">{post.title}</p>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-slate-600" />
                                </Link>
                            )) : <p className="text-xs text-slate-600 font-mono">NO_STREAM</p>}
                        </div>
                    </div>
                </section>

                {/* 🛡️ MISSION_STATEMENT */}
                <section className={styles.missionSection}>
                    <div className={styles.missionCard}>
                        <h3 className={styles.sectionTitle}>MISSION_STATEMENT</h3>
                        <p className={styles.missionText}>
                            44年のキャリアに基づく技術アーカイブ。自作PHP MVCから始まり、Next.js/Djangoへと進化した当サイトの歩みは、そのまま「情報を整理し、価値を再定義する」エンジニアの歩みです。
                            膨大なデータの中に埋もれた真実を、プロの視点で抽出し続けます。
                        </p>
                    </div>
                </section>
            </div>

            {/* 🛡️ AdSense審査必須：フッターナビゲーション */}
            <footer className={styles.systemFooter}>
                <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
                    <div>
                        <h5 className="text-white text-sm font-bold mb-4 flex items-center justify-center md:justify-start">
                            <Info className="w-4 h-4 mr-2" /> 運営者情報
                        </h5>
                        <ul className="text-xs text-slate-400 space-y-2">
                            <li><Link href="/about" className="hover:text-blue-400 transition-colors underline decoration-slate-700">BICSTATIONについて（執筆者経歴）</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h5 className="text-white text-sm font-bold mb-4 flex items-center justify-center md:justify-start">
                            <Lock className="w-4 h-4 mr-2" /> 法的告知
                        </h5>
                        <ul className="text-xs text-slate-400 space-y-2">
                            <li><Link href="/privacy-policy" className="hover:text-blue-400 transition-colors underline decoration-slate-700">プライバシーポリシー（広告配信について）</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h5 className="text-white text-sm font-bold mb-4 flex items-center justify-center md:justify-start">
                            <Mail className="w-4 h-4 mr-2" /> お問い合わせ
                        </h5>
                        <ul className="text-xs text-slate-400 space-y-2">
                            <li><Link href="/contact" className="hover:text-blue-400 transition-colors underline decoration-slate-700">コンタクト・解析依頼はこちら</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="border-t border-slate-800 pt-8 pb-4">
                    <p className={styles.copyright}>&copy; 2026 {siteConfig.site_name.toUpperCase()} / Produced by SHIN CORE LINX</p>
                </div>
            </footer>
        </div>
    );
}