'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getSiteMetadata, getSiteColor } from '../../lib/siteConfig';
import { PCProduct } from '@/shared/lib/api/types';
import styles from './Sidebar.module.css';

// ✅ 五十音グループ化ユーティリティ
import { groupByGojuon } from '../../utils/grouping';

// --- インターフェース定義 (型の堅牢化) ---
interface MasterItem {
    id: number;
    name: string;
    slug: string | null;
    product_count: number;
    count?: number;
}

interface AnalysisData {
    source: string;
    genre_distribution: { genres__name: string; count: number }[];
    platform_avg_score: number;
    total_nodes: number;
    status: string;
}

interface SidebarProps {
    activeMenu?: string;
    makers?: any[]; 
    recentPosts?: { id: string; title: string; slug?: string }[];
    product?: PCProduct | any;
}

/**
 * 🚀 MARKET ANALYZER SIDEBAR - FULL SPEC EDITION
 * 行数を維持しつつ、各セクションの独立性とエラーハンドリングを強化
 */
export default function AdultSidebar({ makers: initialMakers = [], recentPosts = [], product }: SidebarProps) {
    const site = getSiteMetadata();
    const siteColor = getSiteColor(site.site_name);
    const pathname = usePathname();

    // --- 各カテゴリ独立ステート (最適化のため個別に管理) ---
    const [groupedActresses, setGroupedActresses] = useState<Record<string, any[]>>({});
    const [genres, setGenres] = useState<MasterItem[]>([]);
    const [series, setSeries] = useState<MasterItem[]>([]);
    const [directors, setDirectors] = useState<MasterItem[]>([]);
    const [makers, setMakers] = useState<MasterItem[]>([]);
    const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // --- セクションの独立開閉状態 (ユーザー体験の最適化) ---
    const [openSections, setOpenSections] = useState<Record<string, boolean>>({
        'PLATFORMS': true,
        'ANALYSIS': true,
        'ACTRESSES': false, // データ量が多いため初期は閉じる
        'GENRES': true,
        'SERIES': true,
        'MAKERS': true,
        'DIRECTORS': false,
        'LOGS': true,
    });

    const toggleSection = (section: string) => {
        setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    /**
     * ✅ 安全なURL生成 (識別子の優先順位: slug > id)
     */
    const getSafeLink = (type: string, item: any) => {
        if (!item) return '#';
        const identifier = item.slug && item.slug !== "null" ? item.slug : item.id;
        return `/${type}/${identifier}`;
    };

    /**
     * ✅ データフェッチ・コアロジック
     */
    useEffect(() => {
        const fetchSidebarData = async () => {
            setIsLoading(true);
            try {
                const apiBase = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8083/api').replace(/\/$/, '');
                
                // コンテキスト解析 (どのプラットフォームのデータを出すべきか)
                let currentSource = 'DUGA';
                if (pathname?.includes('fanza')) currentSource = 'FANZA';
                if (pathname?.includes('dmm')) currentSource = 'DMM';
                if (product?.api_source) currentSource = product.api_source;

                const sourceQuery = `?api_source=${currentSource.toLowerCase()}`;
                const baseSort = `&ordering=-product_count`;

                // 🚀 各エンドポイントへの並列リクエスト (独立したエラーハンドリング)
                const [actRes, genRes, serRes, dirRes, makRes, anaRes] = await Promise.all([
                    fetch(`${apiBase}/actresses/${sourceQuery}&limit=300${baseSort}`).catch(() => null),
                    fetch(`${apiBase}/genres/${sourceQuery}&limit=50${baseSort}`).catch(() => null),
                    fetch(`${apiBase}/series/${sourceQuery}&limit=50${baseSort}`).catch(() => null),
                    fetch(`${apiBase}/directors/${sourceQuery}&limit=50${baseSort}`).catch(() => null),
                    fetch(`${apiBase}/makers/${sourceQuery}&limit=50${baseSort}`).catch(() => null),
                    fetch(`${apiBase}/adult-products/analysis/?source=${currentSource}`).catch(() => null),
                ]);

                // 1. 女優データの処理
                if (actRes?.ok) {
                    const data = await actRes.json();
                    setGroupedActresses(groupByGojuon(data.results || []));
                }

                // 2. ジャンルデータの処理 (Top 20)
                if (genRes?.ok) {
                    const data = await genRes.json();
                    setGenres((data.results || []).slice(0, 20));
                }

                // 3. シリーズデータの処理 (Top 20)
                if (serRes?.ok) {
                    const data = await serRes.json();
                    setSeries((data.results || []).slice(0, 20));
                }

                // 4. 監督データの処理 (Top 20)
                if (dirRes?.ok) {
                    const data = await dirRes.json();
                    setDirectors((data.results || []).slice(0, 20));
                }

                // 5. メーカーデータの処理 (Top 20)
                if (makRes?.ok) {
                    const data = await makRes.json();
                    setMakers((data.results || []).slice(0, 20));
                }

                // 6. 市場解析データの処理
                if (anaRes?.ok) {
                    const data = await anaRes.json();
                    setAnalysis(data);
                }

            } catch (error) {
                console.error("Critical error in sidebar data fetching:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSidebarData();
    }, [pathname, product]);

    return (
        <aside className={styles.sidebar}>
            
            {/* --- SECTION: PLATFORM --- */}
            <section className={styles.sectionWrapper}>
                <div className={styles.sectionHeader} onClick={() => toggleSection('PLATFORMS')}>
                    <h3 className={styles.headerTitle}>📡 PLATFORM MATRIX</h3>
                    <span className={styles.arrow}>{openSections['PLATFORMS'] ? '▲' : '▼'}</span>
                </div>
                {openSections['PLATFORMS'] && (
                    <div className={styles.platformGrid}>
                        {['DUGA', 'FANZA', 'DMM'].map((p) => {
                            const pLower = p.toLowerCase();
                            const isActive = pathname?.includes(pLower);
                            return (
                                <Link key={p} href={`/brand/${pLower}`} className={`${styles.platBtn} ${isActive ? styles.active : ''}`}>
                                    {p}
                                </Link>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* --- SECTION: MARKET ANALYSIS --- */}
            {analysis && (
                <section className={styles.sectionWrapper}>
                    <div className={styles.sectionHeader} onClick={() => toggleSection('ANALYSIS')}>
                        <h3 className={styles.headerTitle}>📊 MARKET INTELLIGENCE</h3>
                        <span className={styles.arrow}>{openSections['ANALYSIS'] ? '▲' : '▼'}</span>
                    </div>
                    {openSections['ANALYSIS'] && (
                        <div className={styles.analysisContainer}>
                            <div className={styles.analysisMeta}>
                                <span className={styles.tag}>SOURCE: {analysis.source}</span>
                                <span className={styles.tag}>SCORE_AVG: {analysis.platform_avg_score}</span>
                            </div>
                            <div className={styles.distributionList}>
                                {analysis.genre_distribution?.slice(0, 6).map((item, idx) => (
                                    <div key={idx} className={styles.distRow}>
                                        <div className={styles.distInfo}>
                                            <span>{item.genres__name}</span>
                                            <span>{item.count}</span>
                                        </div>
                                        <div className={styles.barContainer}>
                                            <div 
                                                className={styles.barFill} 
                                                style={{ 
                                                    width: `${(item.count / analysis.genre_distribution[0].count) * 100}%`,
                                                    backgroundColor: siteColor
                                                }} 
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </section>
            )}

            {/* --- SECTION: ACTRESSES --- */}
            <section className={styles.sectionWrapper}>
                <div className={styles.sectionHeader}>
                    <div className={styles.headerTitle} onClick={() => toggleSection('ACTRESSES')}>💃 ACTRESSES</div>
                    <Link href="/actress" className={styles.indexLink}>ALL_INDEX →</Link>
                </div>
                {openSections['ACTRESSES'] && (
                    <div className={styles.actressScroll}>
                        {Object.entries(groupedActresses).map(([kana, list]) => (
                            <div key={kana} className={styles.kanaGroup}>
                                <div className={styles.kanaLabel} style={{ color: siteColor }}>{kana}</div>
                                <div className={styles.actressTags}>
                                    {list.slice(0, 15).map(act => (
                                        <Link key={act.id} href={getSafeLink('actress', act)} className={styles.tagLink}>
                                            {act.name}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* --- SECTION: GENRES --- */}
            <section className={styles.sectionWrapper}>
                <div className={styles.sectionHeader}>
                    <div className={styles.headerTitle} onClick={() => toggleSection('GENRES')}>🏷️ GENRES</div>
                    <Link href="/genre" className={styles.indexLink}>ALL_INDEX →</Link>
                </div>
                {openSections['GENRES'] && (
                    <ul className={styles.masterList}>
                        {genres.map(item => (
                            <li key={item.id}>
                                <Link href={getSafeLink('genre', item)} className={styles.masterLink}>
                                    <span className={styles.itemName}>{item.name}</span>
                                    <span className={styles.itemCount}>{item.product_count}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            {/* --- SECTION: SERIES --- */}
            <section className={styles.sectionWrapper}>
                <div className={styles.sectionHeader}>
                    <div className={styles.headerTitle} onClick={() => toggleSection('SERIES')}>🎞️ SERIES</div>
                    <Link href="/series" className={styles.indexLink}>ALL_INDEX →</Link>
                </div>
                {openSections['SERIES'] && (
                    <ul className={styles.masterList}>
                        {series.map(item => (
                            <li key={item.id}>
                                <Link href={getSafeLink('series', item)} className={styles.masterLink}>
                                    <span className={styles.itemName}>{item.name}</span>
                                    <span className={styles.itemCount}>{item.product_count}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            {/* --- SECTION: MAKERS --- */}
            <section className={styles.sectionWrapper}>
                <div className={styles.sectionHeader}>
                    <div className={styles.headerTitle} onClick={() => toggleSection('MAKERS')}>🏢 PRODUCTION</div>
                    <Link href="/maker" className={styles.indexLink}>ALL_INDEX →</Link>
                </div>
                {openSections['MAKERS'] && (
                    <ul className={styles.masterList}>
                        {makers.map(item => (
                            <li key={item.id}>
                                <Link href={getSafeLink('maker', item)} className={styles.masterLink}>
                                    <span className={styles.itemName}>{item.name}</span>
                                    <span className={styles.itemCount}>{item.product_count}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            {/* --- SECTION: DIRECTORS --- */}
            <section className={styles.sectionWrapper}>
                <div className={styles.sectionHeader}>
                    <div className={styles.headerTitle} onClick={() => toggleSection('DIRECTORS')}>🎬 DIRECTORS</div>
                    <Link href="/director" className={styles.indexLink}>ALL_INDEX →</Link>
                </div>
                {openSections['DIRECTORS'] && (
                    <ul className={styles.masterList}>
                        {directors.map(item => (
                            <li key={item.id}>
                                <Link href={getSafeLink('director', item)} className={styles.masterLink}>
                                    <span className={styles.itemName}>{item.name}</span>
                                    <span className={styles.itemCount}>{item.product_count}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            {/* --- SECTION: LATEST LOGS --- */}
            <section className={styles.sectionWrapper}>
                <div className={styles.sectionHeader} onClick={() => toggleSection('LOGS')}>
                    <h3 className={styles.headerTitle}>📄 INTEL LOGS</h3>
                    <span className={styles.arrow}>{openSections['LOGS'] ? '▲' : '▼'}</span>
                </div>
                {openSections['LOGS'] && (
                    <div className={styles.logList}>
                        {recentPosts.length > 0 ? recentPosts.slice(0, 5).map(post => (
                            <Link key={post.id} href={`/news/${post.slug || post.id}`} className={styles.logItem}>
                                {post.title}
                            </Link>
                        )) : (
                            <div className={styles.empty}>NO_RECENT_INTEL</div>
                        )}
                    </div>
                )}
            </section>

            {/* --- SYSTEM STATUS FOOTER --- */}
            <div className={styles.systemFooter}>
                <div className={styles.statusRow}>
                    <span className={styles.blinkDot} style={{ background: isLoading ? '#f1c40f' : '#2ecc71' }} />
                    <span className={styles.statusText}>SYS_STATUS: {isLoading ? 'SYNCING' : 'OPERATIONAL'}</span>
                </div>
                <div className={styles.nodeMeta}>
                    DATA_SOURCE: {analysis?.source || 'SCANNING...'}
                </div>
                <div className={styles.nodeMeta}>
                    TOTAL_NODES: {analysis?.total_nodes?.toLocaleString() || '---'}
                </div>
            </div>

        </aside>
    );
}