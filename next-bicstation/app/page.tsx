/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
/**
 * =====================================================================
 * 🛰️ BICSTATION TOP_NODE_V10.9 (AdSense Strategic Fusion)
 * 🛡️ Maya's Logic: 属性整合性 v7.5 / Blog Satellite 実装版
 * 💎 Update: 
 * 1. 苦行ログ（WordPress/Django）からの最新6記事を並列フェッチ
 * 2. データベースとブログを共存させ、E-E-A-Tを最大化
 * 3. IS_ADSENSE_REVIEW フラグによる審査用レイアウト最適化
 * =====================================================================
 */

import React from 'react';
import Link from 'next/link';
import { headers } from 'next/headers';
import { Activity, ShieldCheck, Zap, TrendingUp, BarChart3, Database, FileText, ChevronRight } from 'lucide-react';

// ✅ 指定のコンポーネント
import ProductCard from '@/shared/components/organisms/cards/ProductCard';
import UnifiedProductCard from '@/shared/components/organisms/cards/UnifiedProductCard';

// ✅ API (Zenith v10.0 仕様)
import { fetchDjangoBridgeContent } from '@/shared/lib/api/django-bridge';
import { fetchPCProductRanking } from '@/shared/lib/api/django/pc';
import { constructMetadata } from '@/shared/lib/utils/metadata';
import { getSiteMetadata } from '@/shared/lib/utils/siteConfig';

// 🎨 スタイルシート
import styles from './page.module.css';

export const dynamic = 'force-dynamic';
export const revalidate = 600; 

/**
 * 🚩 AdSense 審査コントロール
 */
const IS_ADSENSE_REVIEW = true; 

async function safeFetch<T>(promise: Promise<T>, fallback: T): Promise<T> {
    try {
        const data = await promise;
        return data ?? fallback;
    } catch (e) {
        console.error(`🚨 [SYSTEM_FETCH_ERROR]:`, e);
        return fallback;
    }
}

export async function generateMetadata() {
    const headerList = await headers();
    const host = headerList.get('host') || "bicstation.com";
    const siteConfig = getSiteMetadata(host);

    return constructMetadata({
        title: `${siteConfig.site_name.toUpperCase()} | AI解析アーカイブ & 技術ログ`,
        description: `44年のエンジニアリングキャリアが査定するハードウェア・データベース。最新の「苦行ログ」も公開中。`,
        host: host 
    });
}

export default async function HomePageMain() {
    const headerList = await headers();
    const host = headerList.get('host') || "bicstation.com";
    const siteConfig = getSiteMetadata(host); 

    // --- 🎯 マルチ並列データフェッチ ---
    // 最近のブログ記事（reports/posts）を6件取得するように拡張
    const [newsRes, scoreRank, popularityRank] = await Promise.all([
        safeFetch(fetchDjangoBridgeContent('posts', 6), { results: [], count: 0 }),
        safeFetch(fetchPCProductRanking('score', host), []),
        safeFetch(fetchPCProductRanking('popularity', host), [])
    ]);

    const recentPosts = newsRes?.results || [];
    const aiTop3 = scoreRank.slice(0, 3);
    const trendTop3 = popularityRank.slice(0, 3);
    const totalCount = newsRes?.count || "1,800+";

    const syncProduct = (item: any) => ({
        ...item,
        image_url: item.image_url || item.image || item.main_image || 'https://placehold.jp/300x200.png'
    });

    return (
        <div className={styles.mainWrapper}>
            {/* 🛠️ システムステータスバー */}
            <header className={styles.systemStatus} aria-label="System Node Status">
                <div className={styles.statusInner}>
                    <div className={styles.pulseIndicator}>
                        <span className={styles.dot}></span>
                        <span className={styles.statusLabel}>CORE_CONNECTED</span>
                    </div>
                    <div className={styles.versionTag}>
                        {siteConfig.site_name.toUpperCase()} <span className={styles.verNum}>DB_NODE_V10.9</span>
                    </div>
                    <div className={styles.nodeStats}>
                        <Database className="inline w-3 h-3 mr-1" aria-hidden="true" />
                        <span className={styles.countNum}>{totalCount.toLocaleString()} DATA_POINTS</span>
                    </div>
                </div>
            </header>

            {/* 🚀 ヒーローセクション */}
            <section className={styles.heroSection}>
                <div className={styles.heroBackgroundImage} role="presentation"></div>
                <div className={styles.heroGlow}></div>
                <div className={styles.heroContent}>
                    <h1 className={styles.glitchTitle}>{siteConfig.site_name.toUpperCase()}</h1>
                    <p className={styles.subText}>44年のエンジニアリング知見とAIが融合する、ハードウェア・インテリジェンス・アーカイブ。</p>
                </div>
            </section>

            <div className={styles.contentContainer}>
                
                {/* 🏆 AI ANALYSIS RANKING */}
                <section className="mb-24" aria-label="AIランキング">
                    <div className={styles.sectionTitleArea}>
                        <h2 className={styles.sectionTitle}>
                            <BarChart3 className="text-blue-400 w-5 h-5" aria-hidden="true" />
                            AI_ANALYSIS_TOP_3
                        </h2>
                        <span className={styles.viewAll}>SYSTEM_RANKING_SCORE</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {aiTop3.map((product, i) => (
                            <div key={product.unique_id || product.id || i} className="relative group">
                                <ProductCard 
                                    product={syncProduct(product)} 
                                    rank={i + 1}
                                    isReviewMode={IS_ADSENSE_REVIEW}
                                />
                                <Zap className="absolute top-4 right-4 w-5 h-5 text-yellow-500 z-10 animate-pulse" aria-hidden="true" />
                            </div>
                        ))}
                    </div>
                </section>

                {/* 🛰️ 苦行ログセクション (AdSense審査・信頼性強化) */}
                <section className="mb-24" aria-label="最新の開発ログ">
                    <div className={styles.sectionTitleArea}>
                        <h2 className={styles.sectionTitle}>
                            <FileText className="text-emerald-400 w-5 h-5" aria-hidden="true" />
                            LATEST_DEVELOPMENT_LOGS
                        </h2>
                        <Link href="/post" className={styles.viewAll}>READ_ALL_LOGS →</Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {recentPosts.map((post) => (
                            <Link 
                                href={`/post/${post.slug || post.id}`} 
                                key={post.id}
                                className="group p-5 bg-white/5 border border-slate-800 rounded-xl hover:bg-white/10 transition-all"
                            >
                                <span className="text-[10px] font-mono text-emerald-500 uppercase tracking-widest block mb-2">
                                    {new Date(post.date || post.created_at).toLocaleDateString()}
                                </span>
                                <h3 className="text-md font-bold text-slate-100 line-clamp-2 group-hover:text-emerald-400 transition-colors">
                                    {post.title?.rendered || post.title}
                                </h3>
                                <div className="mt-4 flex items-center text-xs text-slate-500 font-mono">
                                    <span>VIEW_REPORT</span>
                                    <ChevronRight className="w-3 h-3 ml-1" />
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* 🔥 MARKET TREND RANKING */}
                <section className="mb-24" aria-label="トレンドランキング">
                    <div className={styles.sectionTitleArea}>
                        <h2 className={`${styles.sectionTitle} !border-orange-500/30`}>
                            <TrendingUp className="text-orange-400 w-5 h-5" aria-hidden="true" />
                            MARKET_TREND_TOP_3
                        </h2>
                        <span className={styles.viewAll}>REALTIME_LIQUIDITY</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {trendTop3.map((product, i) => (
                            <div key={product.unique_id || product.id || i} className="relative group">
                                <ProductCard 
                                    product={syncProduct(product)} 
                                    rank={i + 1}
                                    isReviewMode={IS_ADSENSE_REVIEW}
                                />
                                <Activity className="absolute top-4 right-4 w-5 h-5 text-orange-500 animate-pulse z-10" aria-hidden="true" />
                            </div>
                        ))}
                    </div>
                </section>

                {/* ⚙️ HARDWARE_CATEGORIES */}
                <section className="mb-24">
                    <h2 className={styles.sectionTitle}>ANALYSIS_CATEGORIES</h2>
                    <nav className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {['LAPTOP', 'GAMING', 'WORKSTATION', 'MOBILE'].map(cat => (
                            <Link href={`/catalog?q=${cat}`} key={cat} className={styles.categoryCard}>
                                <ShieldCheck className="w-4 h-4 mb-2 opacity-50" aria-hidden="true" />
                                <span>{cat}</span>
                            </Link>
                        ))}
                    </nav>
                </section>

                {/* 🛡️ MISSION_STATEMENT */}
                <section className={styles.missionSection}>
                    <div className={styles.missionCard}>
                        <h3 className={styles.sectionTitle}>MISSION_STATEMENT</h3>
                        <div className={styles.missionText}>
                            <p className="mb-4">
                                {siteConfig.site_name} は、技術情報の永続的な保存と、エンジニアの経験則に基づく客観的評価を目的としたインテリジェンス・アーカイブです。
                            </p>
                            <p>
                                マイコン時代から培われた44年のキャリアをベースに、ノイズを排除した真の性能指標を抽出し、次世代へ繋ぐためのハブとして機能します。
                            </p>
                        </div>
                    </div>
                </section>
            </div>

            <footer className={styles.systemFooter}>
                <p className={styles.copyright}>
                    &copy; 2026 {siteConfig.site_name.toUpperCase()} / Produced by CORE LINKS
                </p>
                <p className={styles.protocolTag}>PROTOCOL_STABLE_V10.9_FUSION</p>
            </footer>
        </div>
    );
}