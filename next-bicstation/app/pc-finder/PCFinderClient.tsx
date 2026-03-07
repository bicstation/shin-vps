/* eslint-disable @next/next/no-img-element */
/**
 * 🔍 PC Finder クライアントコンポーネント (Full Version)
 * 🛡️ Maya's Logic: 物理パス修正 & ネットワーク耐性強化版
 * 物理パス: app/pc-finder/PCFinderClient.tsx
 */

"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';

/**
 * ✅ 修正ポイント 1: インポートパスを物理構造に合わせる
 * ログによるとエイリアスは @/shared (スラッシュあり) が標準的な Next.js 設定です。
 * また、物理構造リストに存在する正確なパスを指定します。
 */
import ProductCard from '@/shared/components/organisms/cards/ProductCard';

// ✅ 修正ポイント 2: CSSモジュールのインポート
// ログのエラーを防ぐため、物理ファイル名と一致させてください。
import styles from './PCFinderPage.module.css';

/**
 * =============================================================================
 * 🛠️ PC Finder クライアントコンポーネント
 * =============================================================================
 */
export default function PCFinderClient() {
    // --- 状態管理 ---
    const [products, setProducts] = useState<any[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    
    // AbortControllerを使用して、連打時の古いリクエストをキャンセルする
    const abortControllerRef = useRef<AbortController | null>(null);

    // フィルタ条件
    const [filters, setFilters] = useState({
        budget: 300000,
        type: 'all',
        brand: 'all',
        npuRequired: false,
        gpuRequired: false,
    });
    const [sortBy, setSortBy] = useState('newest');

    // スライダー操作中の表示用（即時反映）
    const [tempBudget, setTempBudget] = useState(filters.budget);

    /**
     * APIから製品データを取得
     */
    const fetchProducts = useCallback(async () => {
        // 以前のリクエストがあればキャンセル
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        const controller = new AbortController();
        abortControllerRef.current = controller;

        setIsLoading(true);
        try {
            const query = new URLSearchParams({
                budget: filters.budget.toString(),
                type: filters.type !== 'all' ? filters.type : '',
                brand: filters.brand !== 'all' ? filters.brand : '',
                npu: filters.npuRequired.toString(),
                gpu: filters.gpuRequired.toString(),
                sort: sortBy,
            });

            // 💡 環境変数からAPIベースURLを取得
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.tiper.live';
            
            const response = await fetch(`${API_URL}/pc-products/?${query}`, {
                signal: controller.signal,
                headers: {
                    'Accept': 'application/json',
                },
                cache: 'no-store'
            });
            
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const data = await response.json();
            
            const results = data.results || (Array.isArray(data) ? data : []);
            const count = data.count || (Array.isArray(data) ? data.length : 0);
            
            setProducts(results);
            setTotalCount(count);
        } catch (e: any) {
            if (e.name !== 'AbortError') {
                console.error("[PC Finder API Error]:", e);
                setProducts([]);
                setTotalCount(0);
            }
        } finally {
            if (abortControllerRef.current === controller) {
                setIsLoading(false);
            }
        }
    }, [filters, sortBy]);

    /**
     * 🛡️ デバウンス処理: スライダー操作が止まって400ms後にフィルタを更新
     */
    useEffect(() => {
        const timer = setTimeout(() => {
            setFilters(f => ({ ...f, budget: tempBudget }));
        }, 400);
        return () => clearTimeout(timer);
    }, [tempBudget]);

    /**
     * フィルタまたはソート順が変更されたらフェッチ実行
     */
    useEffect(() => {
        fetchProducts();
        return () => {
            if (abortControllerRef.current) abortControllerRef.current.abort();
        };
    }, [fetchProducts]);

    return (
        <div className={styles.fullWidthContainer}>
            {/* 🌌 ヒーローセクション */}
            <header className={styles.heroHeader}>
                <div className={styles.heroInner}>
                    <span className={styles.neonBadge}>LIVE DATABASE v2.1</span>
                    <h1 className={styles.heroTitle}>PC_FINDER</h1>
                    <p className={styles.heroSubText}>理想のスペックを、最新の製品アーカイブから即座に抽出。</p>
                </div>
            </header>

            {/* ⚙️ コントロールパネル */}
            <nav className={styles.controlPanel}>
                <div className={styles.filterRow}>
                    <div className={styles.filterGroup}>
                        <div className={styles.labelWrapper}>
                            <label className={styles.inlineLabel}>Budget</label>
                            <span className={styles.budgetValue}>¥{tempBudget.toLocaleString()}</span>
                        </div>
                        <input 
                            type="range" min="50000" max="1000000" step="10000" 
                            value={tempBudget} 
                            onChange={e => setTempBudget(Number(e.target.value))}
                            className={styles.modernRange}
                        />
                    </div>

                    <div className={styles.filterGroup}>
                        <label className={styles.inlineLabel}>Form Factor</label>
                        <select 
                            value={filters.type} 
                            onChange={e => setFilters({...filters, type: e.target.value})} 
                            className={styles.minimalSelect}
                        >
                            <option value="all">ALL SHAPES</option>
                            <option value="type-laptop">LAPTOP</option>
                            <option value="type-desktop">DESKTOP</option>
                            <option value="type-handheld">HANDHELD</option>
                        </select>
                    </div>

                    <div className={styles.filterGroup}>
                        <label className={styles.inlineLabel}>Manufacturer</label>
                        <select 
                            value={filters.brand} 
                            onChange={e => setFilters({...filters, brand: e.target.value})} 
                            className={styles.minimalSelect}
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

                    <div className={styles.filterGroup}>
                        <label className={styles.inlineLabel}>Sort Order</label>
                        <select 
                            value={sortBy} 
                            onChange={e => setSortBy(e.target.value)} 
                            className={styles.minimalSelect}
                        >
                            <option value="newest">NEWEST FIRST</option>
                            <option value="price_asc">PRICE: LOW-HIGH</option>
                            <option value="price_desc">PRICE: HIGH-LOW</option>
                            <option value="spec_score">SPEC: HIGH SCORE</option>
                        </select>
                    </div>
                </div>

                <div className={styles.chipRow}>
                    <div className={styles.chipActions}>
                        <button 
                            onClick={() => setFilters({...filters, npuRequired: !filters.npuRequired})} 
                            className={filters.npuRequired ? styles.chipActive : styles.chip}
                        >
                            <span className={styles.chipDot}></span> NPU (AI PC)
                        </button>
                        <button 
                            onClick={() => setFilters({...filters, gpuRequired: !filters.gpuRequired})} 
                            className={filters.gpuRequired ? styles.chipActive : styles.chip}
                        >
                            <span className={styles.chipDot}></span> DEDICATED GPU
                        </button>
                    </div>
                    
                    <div className={styles.counterDisplay}>
                        <span className={styles.counterLabel}>HITS_FOUND</span>
                        <strong className={styles.counterValue}>{totalCount}</strong>
                    </div>
                </div>
            </nav>

            {/* 📦 製品ギャラリー */}
            <main className={styles.mainGallery}>
                {isLoading ? (
                    <div className={styles.productGrid}>
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className={styles.skeletonCard}>
                                <div className={styles.skeletonImage}></div>
                                <div className={styles.skeletonText}></div>
                                <div className={styles.skeletonSubText}></div>
                            </div>
                        ))}
                    </div>
                ) : products.length > 0 ? (
                    <div className={styles.productGrid}>
                        {products.map(p => (
                            <ProductCard key={p.unique_id || p.id} product={p} />
                        ))}
                    </div>
                ) : (
                    <div className={styles.emptyState}>
                        <p>該当する製品がデータベースに見つかりませんでした。</p>
                        <button 
                            onClick={() => {
                                setTempBudget(300000);
                                setFilters({ budget: 300000, type: 'all', brand: 'all', npuRequired: false, gpuRequired: false });
                                setSortBy('newest');
                            }} 
                            className={styles.resetLink}
                        >
                            検索条件をリセットする
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}