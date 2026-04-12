/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
/**
 * =====================================================================
 * 🛰️ BICSTATION TOP_NODE_V11.0.4 (Final System Integration)
 * 🛡️ Maya's Logic: 堅牢化 v11.0.4 / Zenith v10.0 API サービス完全同期
 * 💎 Update: 
 * 1. Ranking API (fetchPCProductRanking) の配列戻り値を直接処理
 * 2. Posts API (fetchPostList) の siteTag フィルタ引数を最適化
 * 3. PC Archive のフォールバック・カテゴリ表示の整合性
 * 4. 44年エンジニアの矜持: 物理ログと解析データのハイブリッド表示
 * =====================================================================
 */

import React from 'react';
import Link from 'next/link';
import { headers } from 'next/headers';
import { 
    Activity, ShieldCheck, Zap, TrendingUp, BarChart3, 
    Database, FileText, ChevronRight, Cpu, Layout 
} from 'lucide-react';

// ✅ 指定コンポーネント (共有 UI)
import ProductCard from '@/shared/components/organisms/cards/ProductCard';

// ✅ API 統合 (Zenith v10.0 仕様に準拠)
import { fetchWPTechInsights } from '@/shared/lib/api/django/wordpress'; // WordPress ログ
import { fetchPostList } from '@/shared/lib/api/django/posts';           // Django Posts
import { fetchPCProductRanking } from '@/shared/lib/api/django/pc';      // PC Ranking & Stats

// 共通ユーティリティ
import { constructMetadata } from '@/shared/lib/utils/metadata';
import { getSiteMetadata } from '@/shared/lib/utils/siteConfig';

// 🎨 スタイルシート
import styles from './page.module.css';

export const dynamic = 'force-dynamic';
export const revalidate = 600; 

// Google AdSense 審査用フラグ (必要に応じて true)
const IS_ADSENSE_REVIEW = true; 

/**
 * 🛡️ 高度なフェッチ・ガード
 * 実行時エラーを封じ込め、fallback データを確実に返却する。
 */
async function safeFetch<T>(fetcher: any, args: any[], fallback: T): Promise<T> {
    try {
        if (typeof fetcher !== 'function') {
            console.warn(`⚠️ [API_NOT_FOUND]: 関数が正しくインポートされていません。`);
            return fallback;
        }
        const data = await fetcher(...args);
        return data ?? fallback;
    } catch (e) {
        console.error(`🚨 [RUNTIME_FETCH_ERROR]:`, e);
        return fallback;
    }
}

export async function generateMetadata() {
    const headerList = await headers();
    const host = headerList.get('host') || "bicstation.com";
    const siteConfig = getSiteMetadata(host);

    return constructMetadata({
        title: `${siteConfig.site_name.toUpperCase()} | AI解析アーカイブ & 技術ログ`,
        description: `44年のエンジニアリングキャリアに基づく、ハードウェア解析と開発ログの集積地。`,
        host: host 
    });
}

export default async function HomePageMain() {
    const headerList = await headers();
    const host = headerList.get('host') || "bicstation.com";
    const siteConfig = getSiteMetadata(host); 
    const siteTag = siteConfig.site_tag || 'bicstation'; // サイト識別用

    // --- 🎯 5つのデータストリームを同時並列取得 ---
    const [wpLogs, djangoPosts, pcRankingData, scoreRank, popularityRank] = await Promise.all([
        safeFetch(fetchWPTechInsights, [6], []),                                     // WordPress (配列)
        safeFetch(fetchPostList, [6, 0, siteTag], { results: [], count: 0 }),        // Django Posts ({results: []})
        safeFetch(fetchPCProductRanking, ['score', host], []),                       // PC Archive (配列)
        safeFetch(fetchPCProductRanking, ['score', host], []),                       // AI Ranking (配列)
        safeFetch(fetchPCProductRanking, ['popularity', host], [])                   // Trend Ranking (配列)
    ]);

    // 🛡️ データ正規化ロジック (API 戻り値の構造差を吸収)
    const satelliteLogs = Array.isArray(wpLogs) ? wpLogs : [];
    const corePosts = Array.isArray(djangoPosts?.results) ? djangoPosts.results : [];
    
    // PC Ranking は API 側で data.results が抽出済み（配列直下）
    const aiTop3 = Array.isArray(scoreRank) ? scoreRank.slice(0, 3) : [];
    const trendTop3 = Array.isArray(popularityRank) ? popularityRank.slice(0, 3) : [];
    const pcArchiveSample = Array.isArray(pcRankingData) ? pcRankingData.slice(0, 4) : [];

    return (
        <div className={styles.mainWrapper}>
            {/* 🛠️ システムステータスバー: Node V11.0.4 */}
            <header className={styles.systemStatus} aria-label="System Node Status">
                <div className={styles.statusInner}>
                    <div className={styles.pulseIndicator}>
                        <span className={styles.dot}></span>
                        <span className={styles.statusLabel}>HYBRID_CORE_ONLINE</span>
                    </div>
                    <div className={styles.versionTag}>
                        {siteConfig.site_name.toUpperCase()} <span className={styles.verNum}>NODE_V11.0.4_FINAL</span>
                    </div>
                    <div className={styles.nodeStats}>
                        <Database className="inline w-3 h-3 mr-1" />
                        <span className={styles.countNum}>5_DATA_STREAMS_SYNCED</span>
                    </div>
                </div>
            </header>

            {/* 🚀 ヒーローセクション: エンジニアの矜持 */}
            <section className={styles.heroSection}>
                <div className={styles.heroBackgroundImage}></div>
                <div className={styles.heroContent}>
                    <h1 className={styles.glitchTitle}>{siteConfig.site_name.toUpperCase()}</h1>
                    <p className={styles.subText}>44年の経験則が、複雑なテクノロジーを解き明かす。</p>
                </div>
            </section>

            <div className={styles.contentContainer}>
                
                {/* 1. 🏆 AI ANALYSIS RANKING (Ranking API / score) */}
                <section className="mb-24">
                    <div className={styles.sectionTitleArea}>
                        <h2 className={styles.sectionTitle}>
                            <BarChart3 className="text-blue-400 w-5 h-5" /> AI_ANALYSIS_TOP_3
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {aiTop3.length > 0 ? aiTop3.map((product: any, i) => (
                            <div key={`ai-${product.unique_id || product.id || i}`} className="relative group">
                                <ProductCard product={product} rank={i + 1} isReviewMode={IS_ADSENSE_REVIEW} />
                                <Zap className="absolute top-4 right-4 w-5 h-5 text-yellow-500 z-10 animate-pulse" />
                            </div>
                        )) : <p className="text-slate-500 font-mono text-xs">AWAITING_AI_DATA...</p>}
                    </div>
                </section>

                {/* 2 & 3. 🛰️ DOUBLE STREAM LOGS (WP サテライト & Django コア) */}
                <section className="mb-24">
                    <div className={styles.sectionTitleArea}>
                        <h2 className={styles.sectionTitle}>
                            <FileText className="text-emerald-400 w-5 h-5" /> LATEST_TECH_REPORTS
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* 左：WordPress Satellite Logs */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-mono text-slate-500 border-b border-slate-800 pb-2 uppercase tracking-widest">Satellite_Tech_Logs</h3>
                            {satelliteLogs.length > 0 ? satelliteLogs.slice(0, 3).map((post: any) => (
                                <Link href={`/news/${post.slug || post.id}`} key={post.id} className="flex items-center p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all group">
                                    <div className="flex-1">
                                        <span className="text-[10px] text-emerald-500 font-mono block">{new Date(post.date).toLocaleDateString()}</span>
                                        <p className="text-sm font-bold text-slate-200 group-hover:text-emerald-400 line-clamp-1">{post.title}</p>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-slate-600" />
                                </Link>
                            )) : <p className="text-xs text-slate-600 font-mono">NO_SATELLITE_STREAM</p>}
                        </div>
                        {/* 右：Django Core System Logs */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-mono text-slate-500 border-b border-slate-800 pb-2 uppercase tracking-widest">Core_System_Logs</h3>
                            {corePosts.length > 0 ? corePosts.slice(0, 3).map((post: any) => (
                                <Link href={`/post/${post.slug || post.id}`} key={post.id} className="flex items-center p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all group">
                                    <div className="flex-1">
                                        <span className="text-[10px] text-blue-400 font-mono block">{new Date(post.created_at || Date.now()).toLocaleDateString()}</span>
                                        <p className="text-sm font-bold text-slate-200 group-hover:text-blue-400 line-clamp-1">{post.title}</p>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-slate-600" />
                                </Link>
                            )) : <p className="text-xs text-slate-600 font-mono">NO_CORE_POSTS_STREAM</p>}
                        </div>
                    </div>
                </section>

                {/* 4. 🔥 MARKET TREND RANKING (Ranking API / popularity) */}
                <section className="mb-24">
                    <div className={styles.sectionTitleArea}>
                        <h2 className={`${styles.sectionTitle} !border-orange-500/30`}>
                            <TrendingUp className="text-orange-400 w-5 h-5" /> MARKET_TREND_TOP_3
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {trendTop3.length > 0 ? trendTop3.map((product: any, i) => (
                            <ProductCard key={`trend-${product.unique_id || product.id || i}`} product={product} rank={i + 1} isReviewMode={IS_ADSENSE_REVIEW} />
                        )) : <p className="text-slate-500 font-mono text-xs">ANALYZING_MARKET_TREND...</p>}
                    </div>
                </section>

                {/* 5. ⚙️ PC ANALYSIS ARCHIVE (Hardware spec Database) */}
                <section className="mb-24">
                    <div className={styles.sectionTitleArea}>
                        <h2 className={styles.sectionTitle}>
                            <Cpu className="text-purple-400 w-5 h-5" /> HARDWARE_SPEC_DATABASE
                        </h2>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {pcArchiveSample.length > 0 ? pcArchiveSample.map((pc: any) => (
                            <Link href={`/product/${pc.unique_id || pc.id}`} key={pc.id} className="p-4 bg-slate-900/50 border border-slate-800 rounded hover:border-purple-500 transition-all group">
                                <p className="text-xs font-bold text-slate-300 group-hover:text-purple-400 truncate">{pc.name || pc.title}</p>
                                <span className="text-[10px] font-mono text-purple-600 opacity-70">SPEC_NODE: {pc.unique_id || pc.id}</span>
                            </Link>
                        )) : (
                            ['LAPTOP', 'GAMING', 'WORKSTATION', 'MOBILE'].map(cat => (
                                <Link href={`/catalog?q=${cat}`} key={cat} className={styles.categoryCard}>
                                    <Layout className="w-4 h-4 mb-2 opacity-50" />
                                    <span className="text-xs font-mono">{cat}_NODE</span>
                                </Link>
                            ))
                        )}
                    </div>
                </section>

                {/* 🛡️ MISSION_STATEMENT */}
                <section className={styles.missionSection}>
                    <div className={styles.missionCard}>
                        <h3 className={styles.sectionTitle}>MISSION_STATEMENT</h3>
                        <p className={styles.missionText}>
                            44年のキャリアに基づく技術アーカイブ。Djangoによる高度なデータ解析と、WordPressサテライトによる現場の「苦行ログ」を完全統合。
                            情報が氾濫する現代において、真実のスペックとエンジニアの矜持を記録し続けます。
                        </p>
                    </div>
                </section>
            </div>

            <footer className={styles.systemFooter}>
                <p className={styles.copyright}>&copy; 2026 {siteConfig.site_name.toUpperCase()} / Produced by SHIN CORE LINX</p>
            </footer>
        </div>
    );
}