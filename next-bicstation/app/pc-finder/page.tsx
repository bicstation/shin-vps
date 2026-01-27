"use client";

import React, { useState, useEffect, useCallback } from 'react';
// ✅ 外部JS (Script) は不要になったためインポートから削除
import styles from './PCFinderPage.module.css';
import ProductCard from '@/components/product/ProductCard';

/**
 * =====================================================================
 * 💻 PC-FINDER ページコンポーネント
 * 4,000件のデータベース検索に対応したローディング強化版
 * =====================================================================
 */

export default function PCFinderPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // 環境変数の取得
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';

  // 🚩 フィルター条件の初期値
  const [filters, setFilters] = useState({
    budget: 300000,
    type: 'all',         // type-laptop, type-desktop 等
    usage: 'all',        // usage-gaming, usage-business 等
    brand: 'all',
    ram: 0,
    npuRequired: false,
    gpuRequired: false,
  });

  const [sortBy, setSortBy] = useState('newest');

  // 🚀 API通信ロジック
  const fetchProductsFromDatabase = useCallback(async () => {
    setIsLoading(true);
    try {
      const query = new URLSearchParams({
        budget: filters.budget.toString(),
        type: filters.type !== 'all' ? filters.type : '',
        usage: filters.usage !== 'all' ? filters.usage : '',
        brand: filters.brand !== 'all' ? filters.brand : '',
        ram: filters.ram.toString(),
        npu: filters.npuRequired.toString(),
        gpu: filters.gpuRequired.toString(),
        sort: sortBy,
      });

      const endpoint = `${apiUrl}/pc-products/?${query.toString()}`;
      const response = await fetch(endpoint);
      console.log("Fetching from:", endpoint);  

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const data = await response.json();

      // Djangoのレスポンス形式に合わせてデータをセット
      if (data.results && Array.isArray(data.results)) {
        setProducts(data.results);
        setTotalCount(data.count);
      } else if (Array.isArray(data)) {
        setProducts(data);
        setTotalCount(data.length);
      } else {
        setProducts([]);
        setTotalCount(0);
      }
    } catch (error) {
      console.error("❌ Fetch failed:", error);
      setProducts([]);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [filters, sortBy, apiUrl]);

  useEffect(() => {
    fetchProductsFromDatabase();
  }, [fetchProductsFromDatabase]);

  return (
    <div className={styles.pageContainer}>
      
      <div className={styles.contentWrapper}>
        <header className={styles.header}>
          <div className={styles.badge}>BICSTATION LIVE DATABASE</div>
          <h1 className={styles.mainTitle}>PC-FINDER</h1>
          <p className={styles.subTitle}>
            Django データベース直結。AI解析スコアと価格をリアルタイム反映。
          </p>
        </header>

        <div className={styles.layoutGrid}>
          {/* 左側：検索フィルター (サイドバー) */}
          <aside className={styles.sidebar}>
            <div className={styles.filterSection}>

              {/* 01. 予算 */}
              <section className={styles.filterGroup}>
                <label className={styles.filterLabel}>01. Budget (Max)</label>
                <input
                  type="range" min="50000" max="500000" step="10000"
                  value={filters.budget}
                  onChange={(e) => setFilters({ ...filters, budget: Number(e.target.value) })}
                  className={styles.rangeInput}
                />
                <div className={styles.priceDisplay}>
                  <span className={styles.priceMin}>~ ¥{filters.budget.toLocaleString()}</span>
                </div>
              </section>

              {/* 02. PC形状 */}
              <section className={styles.filterGroup}>
                <label className={styles.filterLabel}>02. Form Factor</label>
                <div className={styles.buttonGrid}>
                  {[
                    { label: '全て', val: 'all' },
                    { label: 'ノート', val: 'type-laptop' },
                    { label: 'デスク', val: 'type-desktop' },
                    { label: '小型', val: 'type-mini-pc' }
                  ].map((t) => (
                    <button
                      key={t.val}
                      onClick={() => setFilters({ ...filters, type: t.val })}
                      className={filters.type === t.val ? styles.btnActive : styles.btnInactive}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </section>

              {/* 03. 主な用途 */}
              <section className={styles.filterGroup}>
                <label className={styles.filterLabel}>03. Purpose</label>
                <select
                  value={filters.usage}
                  onChange={(e) => setFilters({ ...filters, usage: e.target.value })}
                  className={styles.selectInput}
                >
                  <option value="all">全ての用途</option>
                  <option value="usage-general">一般・スタンダード</option>
                  <option value="usage-gaming">ゲーミングPC</option>
                  <option value="usage-business">ビジネス・法人</option>
                  <option value="usage-creator">クリエイター向け</option>
                  <option value="usage-ai-dev">AI開発・生成AI</option>
                </select>
              </section>

              {/* 04. メーカー */}
              <section className={styles.filterGroup}>
                <label className={styles.filterLabel}>04. Manufacturer</label>
                <select
                  value={filters.brand}
                  onChange={(e) => setFilters({ ...filters, brand: e.target.value })}
                  className={styles.selectInput}
                >
                  <option value="all">全てのブランド</option>
                  <option value="lenovo">Lenovo</option>
                  <option value="dell">DELL</option>
                  <option value="hp">HP</option>
                  <option value="apple">Apple</option>
                  <option value="mouse">Mouse</option>
                  <option value="asus">ASUS</option>
                  <option value="dynabook">Dynabook</option>
                  <option value="panasonic">Panasonic</option>
                </select>
              </section>

              {/* 05. メモリ */}
              <section className={styles.filterGroup}>
                <label className={styles.filterLabel}>05. Memory (Min)</label>
                <div className={styles.buttonGrid}>
                  {[0, 16, 32].map((r) => (
                    <button
                      key={r}
                      onClick={() => setFilters({ ...filters, ram: r })}
                      className={filters.ram === r ? styles.btnActive : styles.btnInactive}
                    >
                      {r === 0 ? '不問' : `${r}GB+`}
                    </button>
                  ))}
                </div>
              </section>

              {/* 06. 特殊要件 */}
              <section className={styles.checkboxGroup}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={filters.npuRequired}
                    onChange={(e) => setFilters({ ...filters, npuRequired: e.target.checked })}
                  />
                  <span>AI PC (NPU 搭載)</span>
                </label>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={filters.gpuRequired}
                    onChange={(e) => setFilters({ ...filters, gpuRequired: e.target.checked })}
                  />
                  <span>独立GPU (GeForce等)</span>
                </label>
              </section>
            </div>
          </aside>

          {/* 右側：検索結果表示エリア */}
          <main className={styles.mainContent}>
            <div className={styles.toolbar}>
              <div className={styles.resultInfo}>
                <span className={styles.resultLabel}>Search Results</span>
                <div className={styles.resultCount}>
                  <span className={styles.highlight}>{totalCount}</span> Products Found
                </div>
              </div>

              <div className={styles.sortBox}>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className={styles.sortSelect}
                >
                  <option value="newest">発売日が新しい順</option>
                  <option value="price_asc">価格が安い順</option>
                  <option value="price_desc">価格が高い順</option>
                  <option value="spec_score">総合評価が高い順</option>
                </select>
              </div>
            </div>

            {/* ✅ 修正：ローディング中の表示をユーザーに優しく強化 */}
            {isLoading ? (
              <div className={styles.loadingContainer}>
                <div className={styles.loaderContent}>
                  <div className={styles.spinner}></div>
                  <h3 className={styles.loadingTitle}>ただいま検索中です...</h3>
                  <p className={styles.loadingText}>
                    約4,000件のデータベースから最適なPCを抽出しています。
                  </p>
                </div>
                <div className={styles.productGrid}>
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className={styles.skeletonCard}></div>
                  ))}
                </div>
              </div>
            ) : products.length > 0 ? (
              <div className={styles.productGrid}>
                {products.map(product => (
                  <ProductCard key={product.unique_id} product={product} />
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>🔍</div>
                <h3 className={styles.emptyTitle}>一致する製品が見つかりませんでした</h3>
                <p className={styles.emptyText}>条件を緩めて再検索してみてください。</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}