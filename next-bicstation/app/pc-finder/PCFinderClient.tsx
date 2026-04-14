/* eslint-disable @next/next/no-img-element */
/**
 * 🔍 PC Finder クライアントコンポーネント
 * 🛡️ 統合ドメイン: api.bicstation.com 
 * 🛠️ 正解パス: /api/general/pc-products/
 */

"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import ProductCard from '@/shared/components/organisms/cards/ProductCard';
import styles from './PCFinderPage.module.css';

export default function PCFinderClient() {
    // --- 状態管理 ---
    const [products, setProducts] = useState<any[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const abortControllerRef = useRef<AbortController | null>(null);

    // フィルタ条件 (Django API URL一覧とログに基づき最適化)
    const [filters, setFilters] = useState({
        budget: 400000,
        type: 'all',
        brand: 'all',
        npuRequired: false,
        gpuRequired: false,
    });
    const [sortBy, setSortBy] = useState('-created_at');

    // スライダー即時反映用
    const [tempBudget, setTempBudget] = useState(filters.budget);

    /**
     * API連携ロジック
     * 接続先: api.bicstation.com
     */
    const fetchProducts = useCallback(async () => {
        // 既存のリクエストがあればキャンセル
        if (abortControllerRef.current) abortControllerRef.current.abort();
        const controller = new AbortController();
        abortControllerRef.current = controller;

        setIsLoading(true);
        try {
            // URL一覧の構成に基づいたクエリパラメータの構築
            const params = new URLSearchParams({
                site: 'bicstation',        // ログに基づき必須
                limit: '36',               // 取得件数
                offset: '0',
                max_price: filters.budget.toString(), // 予算
                attribute: sortBy,         // ログで確認されたソートキー
                ordering: sortBy,          // 互換性のため両方送付
            });

            // メーカー・カテゴリの追加
            if (filters.brand !== 'all') params.append('maker', filters.brand);
            if (filters.type !== 'all') params.append('type', filters.type);
            
            // 特殊フラグ
            if (filters.npuRequired) params.append('npu', 'true');
            if (filters.gpuRequired) params.append('gpu', 'true');

            // 🛠️ 確定したドメインとエンドポイント
            const API_BASE = 'https://api.bicstation.com';
            const targetUrl = `${API_BASE}/api/general/pc-products/?${params.toString()}`;
            
            console.log("📡 [FETCHING]:", targetUrl);

            const response = await fetch(targetUrl, {
                signal: controller.signal,
                headers: { 
                    'Accept': 'application/json',
                },
                cache: 'no-store'
            });
            
            if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
            const data = await response.json();
            
            // Django DRF形式 (results) か 配列直かを確認してセット
            const results = data.results || (Array.isArray(data) ? data : []);
            setProducts(results);
            setTotalCount(data.count || results.length);

        } catch (e: any) {
            if (e.name !== 'AbortError') {
                console.error("🚨 [PC Finder API Error]:", e);
                setProducts([]);
                setTotalCount(0);
            }
        } finally {
            if (abortControllerRef.current === controller) setIsLoading(false);
        }
    }, [filters, sortBy]);

    // デバウンス処理 (400ms) - スライダー操作の負荷軽減
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
            {/* 🛠️ サイドバー・コントロールパネル */}
            <aside className={styles.sidebar}>
                <div className={styles.sidebarInner}>
                    <div className={styles.brandArea}>
                        <span className={styles.neonBadge}>BIC_CORE v3.5</span>
                        <h1 className={styles.sidebarTitle}>PC_FINDER</h1>
                    </div>

                    <div className={styles.filterSection}>
                        <div className={styles.controlGroup}>
                            <div className={styles.labelRow}>
                                <label>MAX BUDGET</label>
                                <span className={styles.accentText}>¥{tempBudget.toLocaleString()}</span>
                            </div>
                            <input 
                                type="range" min="50000" max="1000000" step="10000" 
                                value={tempBudget} 
                                onChange={e => setTempBudget(Number(e.target.value))}
                                className={styles.cyberRange}
                            />
                        </div>

                        <div className={styles.controlGroup}>
                            <label>FORM FACTOR</label>
                            <div className={styles.selectWrapper}>
                                <select 
                                    value={filters.type} 
                                    onChange={e => setFilters({...filters, type: e.target.value})}
                                >
                                    <option value="all">ALL CATEGORIES</option>
                                    <option value="laptop">LAPTOP</option>
                                    <option value="desktop">DESKTOP</option>
                                </select>
                            </div>
                        </div>

                        <div className={styles.controlGroup}>
                            <label>MANUFACTURER</label>
                            <div className={styles.selectWrapper}>
                                <select 
                                    value={filters.brand} 
                                    onChange={e => setFilters({...filters, brand: e.target.value})}
                                >
                                    <option value="all">ALL BRANDS</option>
                                    <option value="apple">Apple</option>
                                    <option value="lenovo">Lenovo</option>
                                    <option value="dell">DELL</option>
                                    <option value="hp">HP</option>
                                    <option value="asus">ASUS</option>
                                    <option value="msi">MSI</option>
                                </select>
                            </div>
                        </div>

                        <div className={styles.controlGroup}>
                            <label>SORT ORDER</label>
                            <div className={styles.selectWrapper}>
                                <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
                                    <option value="-created_at">NEWEST_ARRIVALS</option>
                                    <option value="price">PRICE: LOW_TO_HIGH</option>
                                    <option value="-price">PRICE: HIGH_TO_LOW</option>
                                    <option value="-score_ai">AI_SPEC_SCORE</option>
                                </select>
                            </div>
                        </div>

                        <div className={styles.toggleGroup}>
                            <button 
                                onClick={() => setFilters({...filters, npuRequired: !filters.npuRequired})} 
                                className={filters.npuRequired ? styles.toggleActive : styles.toggle}
                            >
                                <span className={styles.dot} /> NPU (AI PC)
                            </button>
                            <button 
                                onClick={() => setFilters({...filters, gpuRequired: !filters.gpuRequired})} 
                                className={filters.gpuRequired ? styles.toggleActive : styles.toggle}
                            >
                                <span className={styles.dot} /> DISCRETE GPU
                            </button>
                        </div>
                    </div>

                    <div className={styles.statsArea}>
                        <div className={styles.statLine}>
                            <span>LIVE_HITS</span>
                            <span className={styles.statValue}>{totalCount}</span>
                        </div>
                        <button 
                            className={styles.resetButton}
                            onClick={() => {
                                setTempBudget(400000);
                                setFilters({ budget: 400000, type: 'all', brand: 'all', npuRequired: false, gpuRequired: false });
                                setSortBy('-created_at');
                            }}
                        >
                            RESET_FILTERS
                        </button>
                    </div>
                </div>
            </aside>

            {/* 📦 メインコンテンツ・ギャラリー */}
            <main className={styles.mainContent}>
                <header className={styles.contentHeader}>
                    <p className={styles.breadcrumb}>SYSTEM / PC_FINDER / CONNECTED: {totalCount} UNITS</p>
                </header>

                <div className={styles.scrollArea}>
                    {isLoading ? (
                        <div className={styles.grid}>
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className={styles.skeletonCard} />
                            ))}
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
                            <h3>DATA_STREAM_EMPTY</h3>
                            <p>サーバーとの接続は正常ですが、該当する製品が0件です。</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}