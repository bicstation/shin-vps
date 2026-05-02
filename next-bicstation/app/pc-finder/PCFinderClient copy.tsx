"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import ProductCard from '@/shared/components/organisms/cards/ProductCard';
import { getSiteMetadata } from '@/shared/lib/utils/siteConfig'; 
import styles from './PCFinderPage.module.css';

/**
 * =====================================================================
 * 🛰️ PC Finder クライアントコンポーネント (Zenith v25.2.0)
 * 🛡️ Maya's Logic: 動的フェッチ & ステート・ページネーション統合
 * =====================================================================
 */

export default function PCFinderClient() {
    // --- 状態管理 ---
    const [isMounted, setIsMounted] = useState(false);
    const [products, setProducts] = useState<any[]>([]);
    const [makers, setMakers] = useState<string[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const abortControllerRef = useRef<AbortController | null>(null);

    // 🔢 ページネーション用ステート
    const LIMIT = 36;
    const [currentOffset, setCurrentOffset] = useState(0);

    // フィルタ条件
    const [filters, setFilters] = useState({
        budget: 400000,
        brand: 'all',      
        isAiPc: false,     
        searchQuery: '',
    });
    
    // ソート順
    const [sortBy, setSortBy] = useState('-created_at');

    // スライダーの即時反映用
    const [tempBudget, setTempBudget] = useState(filters.budget);

    // 1. マウント確認 (ハイドレーションエラー回避)
    useEffect(() => {
        setIsMounted(true);
    }, []);

    /**
     * 🏭 メーカー一覧を動的に取得
     */
    const fetchMakers = useCallback(async () => {
        try {
            const meta = getSiteMetadata() || {};
            const cleanBaseUrl = (meta.api_base_url || '').replace(/\/api$/, '');
            const requestUrl = `${cleanBaseUrl}/api/general/pc-makers/?site_prefix=${meta.site_tag || 'bicstation'}`;
            const res = await fetch(requestUrl);
            
            if (res.ok) {
                const data = await res.json();
                const rawList = Array.isArray(data) ? data : (data.results || []);
                const cleanList = rawList.map((m: any) => String(m)).filter(Boolean);
                setMakers(cleanList);
            } else {
                setMakers(['asus', 'dell', 'dynabook', 'fmv', 'fujitsu', 'hp', 'apple', 'lenovo']);
            }
        } catch (e) {
            console.warn("⚠️ [Maker Fetch failed]: Using fallback.");
            setMakers(['asus', 'dell', 'dynabook', 'fmv', 'fujitsu', 'hp']);
        }
    }, []);

    /**
     * 🌐 製品データ取得 (現在のオフセット、フィルタ、ソートに基づく)
     */
    const fetchProducts = useCallback(async () => {
        if (abortControllerRef.current) abortControllerRef.current.abort();
        const controller = new AbortController();
        abortControllerRef.current = controller;

        setIsLoading(true);
        try {
            const meta = getSiteMetadata() || {};
            const siteTag = meta.site_tag || 'bicstation';

            const queryParams = new URLSearchParams({
                offset: currentOffset.toString(),
                limit: LIMIT.toString(),
                site_prefix: siteTag,
                ordering: sortBy,
            });

            if (filters.searchQuery) queryParams.append('search', filters.searchQuery);
            if (filters.brand !== 'all') queryParams.append('maker', filters.brand);
            if (filters.isAiPc) queryParams.append('is_ai_pc', 'true');
            if (filters.budget < 1000000) queryParams.append('max_price', filters.budget.toString());

            const cleanBaseUrl = (meta.api_base_url || '').replace(/\/api$/, '');
            const requestUrl = `${cleanBaseUrl}/api/general/pc-products/?${queryParams.toString()}`;
            
            const response = await fetch(requestUrl, {
                signal: controller.signal,
                headers: { 'Accept': 'application/json' },
                cache: 'no-store'
            });
            
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();
            
            const results = data.results || (Array.isArray(data) ? data : []);
            setProducts(results);
            setTotalCount(data.count || results.length);

            // ページ最上部へスクロール（UX向上）
            window.scrollTo({ top: 0, behavior: 'smooth' });

        } catch (e: any) {
            if (e.name !== 'AbortError') {
                console.error("🚨 [PC Finder Error]:", e);
                setProducts([]);
                setTotalCount(0);
            }
        } finally {
            if (abortControllerRef.current === controller) setIsLoading(false);
        }
    }, [filters, sortBy, currentOffset]);

    // 初期起動: メーカー取得
    useEffect(() => {
        if (isMounted) fetchMakers();
    }, [isMounted, fetchMakers]);

    // フィルター変更時は offset を 0 にリセット
    useEffect(() => {
        setCurrentOffset(0);
    }, [filters, sortBy]);

    // 予算スライダーのデバウンス反映
    useEffect(() => {
        if (!isMounted) return;
        const timer = setTimeout(() => {
            setFilters(f => ({ ...f, budget: tempBudget }));
        }, 400);
        return () => clearTimeout(timer);
    }, [tempBudget, isMounted]);

    // メインフェッチ
    useEffect(() => {
        if (!isMounted) return;
        fetchProducts();
        return () => { if (abortControllerRef.current) abortControllerRef.current.abort(); };
    }, [fetchProducts, isMounted]);

    if (!isMounted) return null;
    const currentMeta = getSiteMetadata() || {};
    const totalPages = Math.ceil(totalCount / LIMIT);
    const currentPage = Math.floor(currentOffset / LIMIT) + 1;

    return (
        <div className={styles.finderLayout}>
            {/* --- サイドバー --- */}
            <aside className={styles.sidebar}>
                <div className={styles.sidebarInner}>
                    <div className={styles.brandArea}>
                        <span className={styles.neonBadge}>
                            {(currentMeta.site_tag || 'system').toUpperCase()} CORE
                        </span>
                        <h1 className={styles.sidebarTitle}>PC_FINDER</h1>
                    </div>

                    <div className={styles.filterSection}>
                        {/* 予算 */}
                        <div className={styles.controlGroup}>
                            <div className={styles.labelRow}>
                                <label>MAX BUDGET</label>
                                <span className={styles.accentText}>¥{tempBudget.toLocaleString()}</span>
                            </div>
                            <input 
                                type="range" min="50000" max="1000000" step="5000" 
                                value={tempBudget} 
                                onChange={e => setTempBudget(Number(e.target.value))}
                                className={styles.cyberRange}
                            />
                        </div>

                        {/* メーカー選択 */}
                        <div className={styles.controlGroup}>
                            <label>MANUFACTURER</label>
                            <div className={styles.selectWrapper}>
                                <select 
                                    value={filters.brand} 
                                    onChange={e => setFilters({...filters, brand: e.target.value})}
                                >
                                    <option value="all">ALL BRANDS (全メーカー)</option>
                                    {makers.map(makerName => (
                                        <option key={makerName} value={makerName}>
                                            {String(makerName).toUpperCase()}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* ソート設定 */}
                        <div className={styles.controlGroup}>
                            <label>SORT_PROTOCOL</label>
                            <div className={styles.selectWrapper}>
                                <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
                                    <optgroup label="🕒 TIME_LINE">
                                        <option value="-created_at">NEWEST (新着順)</option>
                                        <option value="-updated_at">UPDATED (更新順)</option>
                                    </optgroup>
                                    <optgroup label="💰 ECONOMY">
                                        <option value="price">PRICE_ASC (安い順)</option>
                                        <option value="-price">PRICE_DESC (高い順)</option>
                                        <option value="-score_cost">BEST_VALUE (コスパ順)</option>
                                    </optgroup>
                                    <optgroup label="⚡ PERFORMANCE">
                                        <option value="-spec_score">TOTAL_SCORE (性能順)</option>
                                        <option value="-score_cpu">CPU_POWER (CPU性能)</option>
                                        <option value="-score_ai">AI_CAPABILITY (AIスコア)</option>
                                    </optgroup>
                                </select>
                            </div>
                        </div>

                        {/* AI PC トグル */}
                        <div className={styles.toggleGroup}>
                            <button 
                                onClick={() => setFilters({...filters, isAiPc: !filters.isAiPc})} 
                                className={filters.isAiPc ? styles.toggleActive : styles.toggle}
                            >
                                <span className={styles.dot} /> CO-PILOT+ / AI PC ONLY
                            </button>
                        </div>
                    </div>

                    <div className={styles.statsArea}>
                        <div className={styles.statLine}>
                            <span>DB_HITS</span>
                            <span className={styles.statValue}>{totalCount}</span>
                        </div>
                        <button className={styles.resetButton} onClick={() => window.location.reload()}>REBOOT_SYSTEM</button>
                    </div>
                </div>
            </aside>

            {/* --- メインコンテンツ --- */}
            <main className={styles.mainContent}>
                <header className={styles.contentHeader}>
                    <p className={styles.breadcrumb}>
                        ZENITH / {(currentMeta.origin_domain || 'localhost').toUpperCase()} / PC_PRODUCTS
                    </p>
                </header>

                <div className={styles.scrollArea}>
                    {isLoading ? (
                        <div className={styles.grid}>
                            {[...Array(6)].map((_, i) => <div key={i} className={styles.skeletonCard} />)}
                        </div>
                    ) : products.length > 0 ? (
                        <>
                            <div className={styles.grid}>
                                {products.map(p => (
                                    <ProductCard key={p.unique_id || p.id} product={p} />
                                ))}
                            </div>

                            {/* 🔢 クライアントサイド・ページネーション */}
                            {totalPages > 1 && (
                                <div className={styles.paginationLayer}>
                                    <button 
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentOffset(Math.max(0, currentOffset - LIMIT))}
                                        className={styles.pageArrow}
                                    >
                                        PREV
                                    </button>
                                    
                                    <div className={styles.pageInfo}>
                                        <span className={styles.current}>{currentPage}</span>
                                        <span className={styles.divider}>/</span>
                                        <span className={styles.total}>{totalPages}</span>
                                    </div>

                                    <button 
                                        disabled={currentPage === totalPages}
                                        onClick={() => setCurrentOffset(currentOffset + LIMIT)}
                                        className={styles.pageArrow}
                                    >
                                        NEXT
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className={styles.emptyState}>
                            <span className={styles.emptyIcon}>∅</span>
                            <h3>NO_DATA_STREAM</h3>
                            <p>サーバーとの通信は正常ですが、条件に合う商品が見つかりません。</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}