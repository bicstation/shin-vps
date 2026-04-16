/* eslint-disable @next/next/no-img-element */
/**
 * 🔍 PC Finder クライアントコンポーネント (Zenith v25.1.9)
 * 🚀 修正内容:
 * 1. メーカー取得エンドポイントを /api/general/pc-makers/ に修正
 * 2. APIレスポンス (文字列の配列) に適合するようデータ処理を修正
 * 3. サイドバーのリンクおよびセレクトボックスでの undefined 回避
 */

"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import ProductCard from '@/shared/components/organisms/cards/ProductCard';
import { getSiteMetadata } from '@/shared/lib/utils/siteConfig'; 
import styles from './PCFinderPage.module.css';

export default function PCFinderClient() {
    // --- 状態管理 ---
    const [isMounted, setIsMounted] = useState(false);
    const [products, setProducts] = useState<any[]>([]);
    const [makers, setMakers] = useState<string[]>([]); // APIから取得するメーカー名リスト
    const [totalCount, setTotalCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const abortControllerRef = useRef<AbortController | null>(null);

    // フィルタ条件
    const [filters, setFilters] = useState({
        budget: 400000,
        brand: 'all',      // バックエンドの 'maker' パラメータに対応
        isAiPc: false,     // バックエンドの 'is_ai_pc' パラメータに対応
        searchQuery: '',
    });
    
    // ソート順 (Django OrderingFilter 用の 'ordering' パラメータ)
    const [sortBy, setSortBy] = useState('-created_at');

    // スライダーの即時反映用
    const [tempBudget, setTempBudget] = useState(filters.budget);

    // 1. マウント確認 (ハイドレーションエラー回避)
    useEffect(() => {
        setIsMounted(true);
    }, []);

    /**
     * 🏭 メーカー一覧をDBから動的に取得
     */
    const fetchMakers = useCallback(async () => {
        try {
            const meta = getSiteMetadata() || {};
            const cleanBaseUrl = (meta.api_base_url || '').replace(/\/api$/, '');
            
            // ✅ 正しいエンドポイントに修正
            const requestUrl = `${cleanBaseUrl}/api/general/pc-makers/?site_prefix=${meta.site_tag || 'bicstation'}`;
            const res = await fetch(requestUrl);
            
            if (res.ok) {
                const data = await res.json();
                // ✅ APIが ["asus", "dell", ...] という配列を直接返しているため、そのまま処理
                const rawList = Array.isArray(data) ? data : (data.results || []);
                const cleanList = rawList.map((m: any) => String(m)).filter(Boolean);
                setMakers(cleanList);
            } else {
                // APIエラー時のフォールバック
                setMakers(['asus', 'dell', 'dynabook', 'fmv', 'fujitsu', 'hp', 'apple', 'lenovo']);
            }
        } catch (e) {
            console.warn("⚠️ [Maker Fetch failed]: Using fallback list.");
            setMakers(['asus', 'dell', 'dynabook', 'fmv', 'fujitsu', 'hp']);
        }
    }, []);

    /**
     * 🌐 製品データ取得
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
                offset: '0',
                limit: '36',
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

        } catch (e: any) {
            if (e.name !== 'AbortError') {
                console.error("🚨 [PC Finder Fetch Error]:", e);
                setProducts([]);
                setTotalCount(0);
            }
        } finally {
            if (abortControllerRef.current === controller) setIsLoading(false);
        }
    }, [filters, sortBy]);

    // 初期起動: メーカー取得
    useEffect(() => {
        if (isMounted) fetchMakers();
    }, [isMounted, fetchMakers]);

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

    return (
        <div className={styles.finderLayout}>
            {/* --- サイドバー：検索・フィルタ・ソート --- */}
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

                        {/* ✅ 動的メーカー選択（文字列配列に対応） */}
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
                                            {/* 文字列の小文字を大文字に変換して表示 */}
                                            {String(makerName).toUpperCase()}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* 高度なソート設定 */}
                        <div className={styles.controlGroup}>
                            <label>SORT_PROTOCOL</label>
                            <div className={styles.selectWrapper}>
                                <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
                                    <optgroup label="🕒 TIME_LINE">
                                        <option value="-created_at">NEWEST (新着順)</option>
                                        <option value="-updated_at">UPDATED (更新順)</option>
                                    </optgroup>
                                    <optgroup label="💰 ECONOMY">
                                        <option value="price">PRICE_ASC (価格の安い順)</option>
                                        <option value="-price">PRICE_DESC (価格の高い順)</option>
                                        <option value="-score_cost">BEST_VALUE (コスパ順)</option>
                                    </optgroup>
                                    <optgroup label="⚡ PERFORMANCE">
                                        <option value="-spec_score">TOTAL_SCORE (総合性能順)</option>
                                        <option value="-score_cpu">CPU_POWER (CPU性能順)</option>
                                        <option value="-score_ai">AI_CAPABILITY (AIスコア順)</option>
                                        <option value="-npu_tops">NPU_TOPS (NPU性能順)</option>
                                    </optgroup>
                                    <optgroup label="🔋 HARDWARE">
                                        <option value="-memory_gb">RAM_CAPACITY (メモリ順)</option>
                                        <option value="-storage_gb">STORAGE_SIZE (容量順)</option>
                                        <option value="-score_portable">MOBILITY (持ち運びやすさ)</option>
                                    </optgroup>
                                </select>
                            </div>
                        </div>

                        {/* 特化トグル */}
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
                        <div className={styles.grid}>
                            {products.map(p => (
                                <ProductCard key={p.unique_id || p.id} product={p} />
                            ))}
                        </div>
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