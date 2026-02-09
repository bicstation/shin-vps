"use client";

import React, { useState, useEffect, useCallback } from 'react';
import styles from './AdultFinderPage.module.css'; // 専用のCSSModule（PCFinderのものをベースに調整想定）
import AdultProductCard from '@shared/cards/AdultProductCard';

/**
 * =====================================================================
 * 🔞 ADULT-FINDER ページコンポーネント
 * FANZA / DUGA 混合データベースからAI解析スコアに基づき製品を抽出
 * =====================================================================
 */

export default function AdultFinderPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // 環境変数の取得
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';

  // 🚩 アダルト検索用フィルター条件
  const [filters, setFilters] = useState({
    budget: 5000,         // 価格上限
    source: 'all',        // 全て / FANZA / DUGA
    category: 'all',      // 単体作品 / セット作品 / アニメ 等
    hasVideo: false,      // サンプル動画あり限定
    minScore: 0,          // AI解析スコア最低点
    term: '',             // キーワード検索
  });

  const [sortBy, setSortBy] = useState('newest');

  // 🚀 API通信ロジック (アダルトエンドポイントへ接続)
  const fetchAdultProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const query = new URLSearchParams({
        price_max: filters.budget.toString(),
        api_source: filters.source !== 'all' ? filters.source : '',
        category: filters.category !== 'all' ? filters.category : '',
        has_video: filters.hasVideo.toString(),
        min_score: filters.minScore.toString(),
        q: filters.term,
        sort: sortBy,
      });

      // エンドポイントを /adult-products/ 等へ変更
      const endpoint = `${apiUrl}/adult-products/?${query.toString()}`;
      const response = await fetch(endpoint);
      
      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

      const data = await response.json();

      // Djangoの標準的なページネーションレスポンスを処理
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
      console.error("❌ Adult Fetch failed:", error);
      setProducts([]);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [filters, sortBy, apiUrl]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAdultProducts();
    }, 300); // タイピング時の連続リクエストを防止
    return () => clearTimeout(timer);
  }, [fetchAdultProducts]);

  return (
    <div className={styles.pageContainer}>
      <div className={styles.contentWrapper}>
        
        {/* ヘッダーセクション */}
        <header className={styles.header}>
          <div className={styles.badge}>TIPER LIVE ADULT DATABASE</div>
          <h1 className={styles.mainTitle}>ADULT<span>-FINDER</span></h1>
          <p className={styles.subTitle}>
            AI解析エンジンが数万件のアーカイブから「あなたの嗜好」をスコアリング。
          </p>
        </header>

        <div className={styles.layoutGrid}>
          {/* 左側：検索フィルター (サイドバー) */}
          <aside className={styles.sidebar}>
            <div className={styles.filterSection}>

              {/* 01. キーワード検索 */}
              <section className={styles.filterGroup}>
                <label className={styles.filterLabel}>01. Keyword Search</label>
                <input
                  type="text"
                  placeholder="女優名、キーワード..."
                  className={styles.textInput}
                  value={filters.term}
                  onChange={(e) => setFilters({ ...filters, term: e.target.value })}
                />
              </section>

              {/* 02. 予算（価格帯） */}
              <section className={styles.filterGroup}>
                <label className={styles.filterLabel}>02. Price Cap</label>
                <input
                  type="range" min="0" max="10000" step="500"
                  value={filters.budget}
                  onChange={(e) => setFilters({ ...filters, budget: Number(e.target.value) })}
                  className={styles.rangeInput}
                />
                <div className={styles.priceDisplay}>
                  <span className={styles.priceMin}>UNDER ¥{filters.budget.toLocaleString()}</span>
                </div>
              </section>

              {/* 03. 配信プラットフォーム */}
              <section className={styles.filterGroup}>
                <label className={styles.filterLabel}>03. Platform</label>
                <div className={styles.buttonGrid}>
                  {[
                    { label: 'ALL', val: 'all' },
                    { label: 'FANZA', val: 'FANZA' },
                    { label: 'DUGA', val: 'DUGA' }
                  ].map((t) => (
                    <button
                      key={t.val}
                      onClick={() => setFilters({ ...filters, source: t.val })}
                      className={filters.source === t.val ? styles.btnActive : styles.btnInactive}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </section>

              {/* 04. カテゴリ選択 */}
              <section className={styles.filterGroup}>
                <label className={styles.filterLabel}>04. Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  className={styles.selectInput}
                >
                  <option value="all">全てのジャンル</option>
                  <option value="video">単体作品</option>
                  <option value="set">セット・まとめ買い</option>
                  <option value="anime">アダルトアニメ</option>
                  <option value="vr">VR作品</option>
                </select>
              </section>

              {/* 05. AI解析スコア */}
              <section className={styles.filterGroup}>
                <label className={styles.filterLabel}>05. Min AI Score</label>
                <div className={styles.buttonGrid}>
                  {[0, 70, 90].map((s) => (
                    <button
                      key={s}
                      onClick={() => setFilters({ ...filters, minScore: s })}
                      className={filters.minScore === s ? styles.btnActive : styles.btnInactive}
                    >
                      {s === 0 ? '不問' : `${s}+`}
                    </button>
                  ))}
                </div>
              </section>

              {/* 06. 特殊要件 */}
              <section className={styles.checkboxGroup}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={filters.hasVideo}
                    onChange={(e) => setFilters({ ...filters, hasVideo: e.target.checked })}
                  />
                  <span>サンプル動画あり限定</span>
                </label>
              </section>
            </div>
          </aside>

          {/* 右側：検索結果表示エリア */}
          <main className={styles.mainContent}>
            <div className={styles.toolbar}>
              <div className={styles.resultInfo}>
                <span className={styles.resultLabel}>Matrix Archive</span>
                <div className={styles.resultCount}>
                  <span className={styles.highlight}>{totalCount.toLocaleString()}</span> Titles Loaded
                </div>
              </div>

              <div className={styles.sortBox}>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className={styles.sortSelect}
                >
                  <option value="newest">最新リリース順</option>
                  <option value="price_asc">価格が安い順</option>
                  <option value="spec_score">AI評価が高い順</option>
                  <option value="popular">人気・トレンド順</option>
                </select>
              </div>
            </div>

            {/* コンテンツエリア */}
            {isLoading ? (
              <div className={styles.loadingContainer}>
                <div className={styles.loaderContent}>
                  <div className={styles.spinner}></div>
                  <h3 className={styles.loadingTitle}>AI解析中...</h3>
                  <p className={styles.loadingText}>
                    膨大なデータベースから条件に合致するアーカイブを抽出しています。
                  </p>
                </div>
                <div className={styles.productGrid}>
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className={styles.skeletonCard}></div>
                  ))}
                </div>
              </div>
            ) : products.length > 0 ? (
              <div className={styles.productGrid}>
                {products.map(product => (
                  <AdultProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>🛰️</div>
                <h3 className={styles.emptyTitle}>対象データが見つかりません</h3>
                <p className={styles.emptyText}>フィルター条件（予算やAIスコア）を調整してください。</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}