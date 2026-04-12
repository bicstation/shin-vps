/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
/**
 * =====================================================================
 * 🛰️ BICSTATION TOP_NODE_V10.8 (Visual Enhanced Edition)
 * 🛡️ Maya's Logic: 属性整合性 v7.0 / Zenith v10.7 同期版
 * 💎 Update: 
 * 1. ヒーローエリアにチーム写真背景レイヤー (team-office.jpg) を実装
 * 2. フッターのコピーライトを将来の展望に合わせ微調整
 * 3. 属性マッピングロジックの安定化
 * =====================================================================
 */

import React from 'react';
import Link from 'next/link';
import { headers } from 'next/headers';
import { Activity, ShieldCheck, Zap, TrendingUp, BarChart3, Database } from 'lucide-react';

// ✅ 指定のコンポーネントをインポート
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
 * 🛠️ 高精度 safeFetch
 */
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
        title: `${siteConfig.site_name.toUpperCase()} | AI解析ハードウェア・アーカイブ`,
        description: `${siteConfig.site_name}は、AI解析スコアと市場動向を統合した次世代ハードウェア・データベース。`,
        host: host 
    });
}

export default async function HomePageMain() {
    const headerList = await headers();
    const host = headerList.get('host') || "bicstation.com";
    const siteConfig = getSiteMetadata(host); 

    // --- 🎯 マルチ並列データフェッチ ---
    const [newsRes, scoreRank, popularityRank] = await Promise.all([
        safeFetch(fetchDjangoBridgeContent('posts', 6), { results: [], count: 0 }),
        safeFetch(fetchPCProductRanking('score', host), []),
        safeFetch(fetchPCProductRanking('popularity', host), [])
    ]);

    const recentPosts = newsRes?.results || [];
    const aiTop3 = scoreRank.slice(0, 3);
    const trendTop3 = popularityRank.slice(0, 3);
    const totalCount = newsRes?.count || "1,800+";

    /**
     * 🚩 ProductCard の内部ロジック (image_url) に合わせるためのデータ整形
     */
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
                        {siteConfig.site_name.toUpperCase()} <span className={styles.verNum}>DB_NODE_V10.8</span>
                    </div>
                    <div className={styles.nodeStats}>
                        <Database className="inline w-3 h-3 mr-1" aria-hidden="true" />
                        <span className={styles.countNum}>{totalCount.toLocaleString()} DATA_POINTS</span>
                    </div>
                </div>
            </header>

            {/* 🚀 ヒーローセクション: 画像背景レイヤーを追加 */}
            <section className={styles.heroSection}>
                {/* 🖼️ 背景画像レイヤー (CSSで /images/team-office.jpg を制御) */}
                <div className={styles.heroBackgroundImage} role="presentation"></div>
                
                {/* 🟦 グリッド・グロウ効果レイヤー */}
                <div className={styles.heroGlow}></div>
                
                <div className={styles.heroContent}>
                    <h1 className={styles.glitchTitle}>{siteConfig.site_name.toUpperCase()}</h1>
                    <p className={styles.subText}>AI解析スコアと市場流動性を統合した、次世代ハードウェア・データベース。</p>
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
                                />
                                <Zap className="absolute top-4 right-4 w-5 h-5 text-yellow-500 z-10 animate-pulse" aria-hidden="true" />
                            </div>
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
                                />
                                <Activity className="absolute top-4 right-4 w-5 h-5 text-orange-500 animate-pulse z-10" aria-hidden="true" />
                            </div>
                        ))}
                    </div>
                </section>

                {/* 📰 LATEST_REPORTS */}
                <section className="mb-24">
                    <div className={styles.sectionTitleArea}>
                        <h2 className={styles.sectionTitle}>LATEST_REPORTS</h2>
                        <Link href="/post" className={styles.viewAll}>VIEW_ALL_REPORTS →</Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {recentPosts.map((post) => (
                            <UnifiedProductCard key={post.id} data={post} siteConfig={siteConfig} />
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
                        <p className={styles.missionText}>
                            {siteConfig.site_name} は、技術情報の永続的な保存とAIによる客観的評価を目的としたインテリジェンス・アーカイブです。
                            膨大なスペックデータを多角的に解析し、ノイズを排除した性能指標を提供します。
                        </p>
                    </div>
                </section>
            </div>

            <footer className={styles.systemFooter}>
                <p className={styles.copyright}>
                    &copy; 2026 {siteConfig.site_name.toUpperCase()} / Produced by CORE LINKS
                </p>
                <p className={styles.protocolTag}>PROTOCOL_STABLE_V10.8</p>
            </footer>
        </div>
    );
}