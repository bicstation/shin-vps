/* eslint-disable @next/next/no-img-element */
/**
 * 🔍 PC Finder クライアントコンポーネント (Zenith v25.1 準拠版)
 * 🛡️ 同期対象: fetchPCProducts / getSiteMetadata
 */

"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import ProductCard from '@/shared/components/organisms/cards/ProductCard';
import { getSiteMetadata } from '@/shared/lib/utils/siteConfig'; // パスは環境に合わせて調整してください
import styles from './PCFinderPage.module.css';

export default function PCFinderClient() {
    // --- 状態管理 ---
    const [products, setProducts] = useState<any[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const abortControllerRef = useRef<AbortController | null>(null);

    // フィルタ条件 (Django API Zenith v11.0 の命名規則に準拠)
    const [filters, setFilters] = useState({
        budget: 400000,
        type: 'all',
        brand: 'all',
        npuRequired: false,
        gpuRequired: false,
        searchQuery: '', // q パラメータ用
    });
    const [sortBy, setSortBy] = useState('-created_at'); // attribute パラメータ用

    // スライダー即時反映用
    const [tempBudget, setTempBudget] = useState(filters.budget);

    /**
     * 🌐 API連携ロジック (Zenith v11.0 サービス層のロジックを完全移植)
     */
    const fetchProducts = useCallback(async () => {
        if (abortControllerRef.current) abortControllerRef.current.abort();
        const controller = new AbortController();
        abortControllerRef.current = controller;

        setIsLoading(true);
        try {
            // 1. サイト構成の取得 (Zenith v25.1 判定)
            const meta = getSiteMetadata();
            const siteTag = meta.site_tag || 'bicstation';

            // 2. クエリパラメータの構築 (fetchPCProducts の仕様を再現)
            const queryParams = new URLSearchParams({
                offset: '0',
                limit: '36',
                site: siteTag, // 💡 必須: サイト別在庫のキー
            });

            // site_group の判定 (general 以外なら追加)
            if (meta.site_group && meta.site_group !== 'general') {
                queryParams.append('site_group', meta.site_group);
            } else if (meta.site_tag === 'bicstation') {
                // 明示的に general を送ることで 0件を回避
                queryParams.append('site_group', 'general');
            }

            // 検索・フィルタ (search, maker, attribute)
            if (filters.searchQuery) queryParams.append('search', filters.searchQuery);
            if (filters.brand !== 'all') queryParams.append('maker', filters.brand);
            
            // ソートと追加属性を attribute として送信
            queryParams.append('attribute', sortBy);

            // 予算フィルタ (Djangoが max_price をサポートしている前提)
            if (filters.budget < 1000000) {
                queryParams.append('max_price', filters.budget.toString());
            }

            // 3. API URL の解決 (resolveApiUrl の挙動を再現)
            // api_base_url は https://api.bicstation.com (末尾/apiなし)
            const requestUrl = `${meta.api_base_url}/api/general/pc-products/?${queryParams.toString()}`;
            
            console.log("📡 [ZENITH_SYNC_FETCH]:", requestUrl);

            const response = await fetch(requestUrl, {
                signal: controller.signal,
                headers: { 
                    'Accept': 'application/json',
                    // getDjangoHeaders 相当の処理が必要な場合はここに追加
                },
                cache: 'no-store'
            });
            
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();
            
            // 4. データ抽出 (replaceInternalUrls 相当は ProductCard 側で行われる想定)
            const results = data.results || (Array.isArray(data) ? data : []);
            setProducts(results);
            setTotalCount(data.count || results.length);

        } catch (e: any) {
            if (e.name !== 'AbortError') {
                console.error("🚨 [PC Finder Sync Error]:", e);
                setProducts([]);
                setTotalCount(0);
            }
        } finally {
            if (abortControllerRef.current === controller) setIsLoading(false);
        }
    }, [filters, sortBy]);

    // デバウンス処理 (400ms)
    useEffect(() => {
        const timer = setTimeout(() => {
            setFilters(f => ({ ...f, budget: tempBudget }));
        }, 400);
        return () => clearTimeout(timer);
    }, [tempBudget]);

    // 条件変更時にフェッチ実行
    useEffect(() => {
        fetchProducts();
        return () => { if (abortControllerRef.current) abortControllerRef.current.abort(); };
    }, [fetchProducts]);

    return (
        <div className={styles.finderLayout}>
            {/* サイドバー */}
            <aside className={styles.sidebar}>
                <div className={styles.sidebarInner}>
                    <div className={styles.brandArea}>
                        <span className={styles.neonBadge}>{getSiteMetadata().site_tag.toUpperCase()} CORE</span>
                        <h1 className={styles.sidebarTitle}>PC_FINDER</h1>
                    </div>

                    <div className={styles.filterSection}>
                        <div className={styles.controlGroup}>
                            <div className={styles.labelRow}>
                                <label>MAX BUDGET</label>
                                <span className={styles.accentText}>¥{tempBudget.toLocaleString()}</span>
                            </div>
                            <input 
                                type="range" min="80000" max="1000000" step="10000" 
                                value={tempBudget} 
                                onChange={e => setTempBudget(Number(e.target.value))}
                                className={styles.cyberRange}
                            />
                        </div>

                        <div className={styles.controlGroup}>
                            <label>MANUFACTURER</label>
                            <div className={styles.selectWrapper}>
                                <select value={filters.brand} onChange={e => setFilters({...filters, brand: e.target.value})}>
                                    <option value="all">ALL BRANDS</option>
                                    <option value="apple">Apple</option>
                                    <option value="lenovo">Lenovo</option>
                                    <option value="dell">DELL</option>
                                    <option value="hp">HP</option>
                                    <option value="asus">ASUS</option>
                                </select>
                            </div>
                        </div>

                        <div className={styles.controlGroup}>
                            <label>SORT / ATTRIBUTE</label>
                            <div className={styles.selectWrapper}>
                                <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
                                    <option value="-created_at">NEWEST_DATA</option>
                                    <option value="price">PRICE_ASC</option>
                                    <option value="-price">PRICE_DESC</option>
                                    <option value="-score_ai">AI_SCORE_RANK</option>
                                </select>
                            </div>
                        </div>

                        <div className={styles.toggleGroup}>
                            <button 
                                onClick={() => setFilters({...filters, npuRequired: !filters.npuRequired})} 
                                className={filters.npuRequired ? styles.toggleActive : styles.toggle}
                            >
                                <span className={styles.dot} /> NPU ENABLED
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

            {/* メインギャラリー */}
            <main className={styles.mainContent}>
                <header className={styles.contentHeader}>
                    <p className={styles.breadcrumb}>ZENITH / {getSiteMetadata().origin_domain.toUpperCase()} / PC_PRODUCTS</p>
                </header>

                <div className={styles.scrollArea}>
                    {isLoading ? (
                        <div className={styles.grid}>
                            {[...Array(6)].map((_, i) => <div key={i} className={styles.skeletonCard} />)}
                        </div>
                    ) : products.length > 0 ? (
                        <div className={styles.grid}>
                            {products.map(p => <ProductCard key={p.unique_id || p.id} product={p} />)}
                        </div>
                    ) : (
                        <div className={styles.emptyState}>
                            <span className={styles.emptyIcon}>∅</span>
                            <h3>NO_DATA_STREAM</h3>
                            <p>リクエストは正常ですが、条件に合致する製品がDBに存在しません。</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}