/* eslint-disable @next/next/no-img-element */
/**
 * 🔍 PC Finder クライアントコンポーネント (Zenith v25.1.6)
 * 🛡️ 最終同期修正:
 * 1. ソートキーを 'attribute' から 'ordering' へ変更（バックエンドのFilter仕様に準拠）
 * 2. フィルタの型安全性を強化
 * 3. メーカー名の iexact 判定を考慮したクエリ構築
 * 4. API URLの整合性修正
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
    const [totalCount, setTotalCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const abortControllerRef = useRef<AbortController | null>(null);

    // フィルタ条件 (Django Backend の filterset_fields に完全準拠)
    const [filters, setFilters] = useState({
        budget: 400000,
        brand: 'all',      // バックエンドの 'maker' パラメータに対応
        isAiPc: false,     // バックエンドの 'is_ai_pc' パラメータに対応
        searchQuery: '',
    });
    
    // ソート順 (Django OrderingFilter は通常 'ordering' キーを期待)
    const [sortBy, setSortBy] = useState('-created_at');

    // スライダーの即時表示用 (デバウンスの対象)
    const [tempBudget, setTempBudget] = useState(filters.budget);

    // 1. ハイドレーションエラーを回避するため、クライアントサイドでのマウントを確認
    useEffect(() => {
        setIsMounted(true);
    }, []);

    /**
     * 🌐 API連携ロジック (fetchProducts)
     */
    const fetchProducts = useCallback(async () => {
        // 既存の通信があれば中断
        if (abortControllerRef.current) abortControllerRef.current.abort();
        const controller = new AbortController();
        abortControllerRef.current = controller;

        setIsLoading(true);
        try {
            const meta = getSiteMetadata() || {};
            const siteTag = meta.site_tag || 'bicstation';

            // クエリパラメータの構築
            const queryParams = new URLSearchParams({
                offset: '0',
                limit: '36',
                site_prefix: siteTag, // 'site' ではなくモデルフィールド名の 'site_prefix' に合わせる
            });

            // フィルタの適用
            if (filters.searchQuery) queryParams.append('search', filters.searchQuery);
            
            // メーカー指定（バックエンドの get_queryset 内 maker__iexact に対応）
            if (filters.brand !== 'all') {
                queryParams.append('maker', filters.brand);
            }
            
            // AI PC フィルタ
            if (filters.isAiPc) {
                queryParams.append('is_ai_pc', 'true');
            }
            
            // 予算フィルタ (DjangoFilterBackend の max_price 等が未実装の場合は get_queryset での対応が必要)
            // ここではフロントエンド側でも一旦パラメータとして付与
            if (filters.budget < 1000000) {
                queryParams.append('max_price', filters.budget.toString());
            }
            
            // 【重要修正】ソートキーを 'ordering' に変更
            // バックエンドの ordering_fields = ['price', 'updated_at', ...] に対応
            queryParams.append('ordering', sortBy);

            // API URL の構築 (重複 /api の除去ロジック)
            const cleanBaseUrl = (meta.api_base_url || '').replace(/\/api$/, '');
            const requestUrl = `${cleanBaseUrl}/api/general/pc-products/?${queryParams.toString()}`;
            
            console.log("📡 [ZENITH_SYNC_FETCH]:", requestUrl);

            const response = await fetch(requestUrl, {
                signal: controller.signal,
                headers: { 'Accept': 'application/json' },
                cache: 'no-store'
            });
            
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();
            
            // Django Rest Framework の標準レスポンス構造 (count, results) に対応
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

    // 2. デバウンス処理 (予算スライダー: 400ms待機して反映)
    useEffect(() => {
        if (!isMounted) return;
        const timer = setTimeout(() => {
            setFilters(f => ({ ...f, budget: tempBudget }));
        }, 400);
        return () => clearTimeout(timer);
    }, [tempBudget, isMounted]);

    // 3. フィルタ・ソート変更時にフェッチ実行
    useEffect(() => {
        if (!isMounted) return;
        fetchProducts();
        return () => { if (abortControllerRef.current) abortControllerRef.current.abort(); };
    }, [fetchProducts, isMounted]);

    // 初期マウント前のレンダリングを防止
    if (!isMounted) {
        return null;
    }

    const currentMeta = getSiteMetadata() || {};

    return (
        <div className={styles.finderLayout}>
            {/* サイドバー：操作パネル */}
            <aside className={styles.sidebar}>
                <div className={styles.sidebarInner}>
                    <div className={styles.brandArea}>
                        <span className={styles.neonBadge}>
                            {(currentMeta.site_tag || 'system').toUpperCase()} CORE
                        </span>
                        <h1 className={styles.sidebarTitle}>PC_FINDER</h1>
                    </div>

                    <div className={styles.filterSection}>
                        {/* 予算スライダー */}
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
                                    <option value="all">ALL BRANDS</option>
                                    <option value="富士通">富士通 FMV</option>
                                    <option value="apple">Apple</option>
                                    <option value="lenovo">Lenovo</option>
                                    <option value="dell">DELL</option>
                                    <option value="hp">HP</option>
                                    <option value="asus">ASUS</option>
                                </select>
                            </div>
                        </div>

                        {/* ソート設定 (orderingに適合) */}
                        <div className={styles.controlGroup}>
                            <label>SORT_BY</label>
                            <div className={styles.selectWrapper}>
                                <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
                                    <option value="-created_at">NEWEST_DATA</option>
                                    <option value="price">PRICE_ASC</option>
                                    <option value="-price">PRICE_DESC</option>
                                    <option value="-score_ai">AI_SCORE_RANK</option>
                                    <option value="-score_cpu">CPU_PERFORMANCE</option>
                                    <option value="-score_cost">BEST_VALUE</option>
                                </select>
                            </div>
                        </div>

                        {/* AI PC 特化フィルタ */}
                        <div className={styles.toggleGroup}>
                            <button 
                                onClick={() => setFilters({...filters, isAiPc: !filters.isAiPc})} 
                                className={filters.isAiPc ? styles.toggleActive : styles.toggle}
                            >
                                <span className={styles.dot} /> CO-PILOT+ / AI PC
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
                            <p>サーバー接続成功。ただし、条件に一致する製品がDBに見つかりません。</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}