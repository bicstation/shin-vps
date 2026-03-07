"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, PlayCircle, BarChart3, Database, HardDrive } from 'lucide-react';

// ✅ 修正: 物理構造 [STRUCTURE] に基づくインポートパス
import AdultProductCard from '@/shared/components/organisms/cards/AdultProductCard';
import styles from './AdultFinderPage.module.css';

/**
 * =====================================================================
 * 🛰️ ADULT-FINDER: MATRIX ARCHIVE SEARCH
 * AI解析スコアと複数プラットフォームを統合した高度な検索エンジン
 * =====================================================================
 */

export default function AdultFinderPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // 1. 📡 API設定 (環境変数のフォールバック設定)
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.tiper.live';

  // 2. 🚩 フィルター・ソート状態管理
  const [filters, setFilters] = useState({
    budget: 5000,         // 価格上限
    source: 'all',        // プラットフォーム (FANZA / DUGA)
    category: 'all',      // ジャンル
    hasVideo: false,      // サンプル動画の有無
    minScore: 0,          // AI解析スコア最低点
    term: '',             // キーワード
  });

  const [sortBy, setSortBy] = useState('newest');

  // 3. 🚀 非同期データ取得ロジック
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

      // エンドポイントの正規化
      const endpoint = `${apiUrl.replace(/\/$/, '')}/api/adult/products/?${query.toString()}`;
      const response = await fetch(endpoint);
      
      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

      const data = await response.json();

      // Django APIのページネーション構造に対応
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
      console.error("❌ AdultFinder: Connection Failed:", error);
      setProducts([]);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [filters, sortBy, apiUrl]);

  // 4. ⚡ デバウンス処理 (入力完了から300ms後に発火)
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAdultProducts();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchAdultProducts]);

  return (
    <div className={styles.pageContainer}>
      <div className={styles.contentWrapper}>
        
        {/* ─── 🌌 ヘッダーセクション ─── */}
        <header className={styles.header}>
          <div className={styles.metaInfo}>
            <div className={styles.badge}>
              <Database className="w-3 h-3 mr-1" />
              LIVE_ADULT_DATABASE_v4.0
            </div>
            <div className={styles.systemStatus}>
              <span className={styles.statusDot}></span>
              NODE_ONLINE
            </div>
          </div>
          <h1 className={styles.mainTitle}>ADULT<span>-FINDER</span></h1>
          <p className={styles.subTitle}>
            AI解析エンジンが数万件のアーカイブから「あなたの嗜好」をスコアリング。
            <br />真の価値を持つコンテンツを、マトリックスから抽出します。
          </p>
        </header>

        <div className={styles.layoutGrid}>
          
          {/* ─── 🛠️ 左側：フィルターサイドバー ─── */}
          <aside className={styles.sidebar}>
            <div className={styles.sidebarSticky}>
              <div className={styles.filterHeader}>
                <Filter className="w-4 h-4 text-pink-500" />
                <h2>SYSTEM_FILTERS</h2>
              </div>

              <div className={styles.filterSection}>

                {/* 01. キーワード */}
                <section className={styles.filterGroup}>
                  <label className={styles.filterLabel}>01. Keyword Search</label>
                  <div className={styles.inputWrapper}>
                    <Search className={styles.searchIcon} />
                    <input
                      type="text"
                      placeholder="女優名、タイトル名..."
                      className={styles.textInput}
                      value={filters.term}
                      onChange={(e) => setFilters({ ...filters, term: e.target.value })}
                    />
                  </div>
                </section>

                {/* 02. 予算 */}
                <section className={styles.filterGroup}>
                  <div className={styles.labelWithInfo}>
                    <label className={styles.filterLabel}>02. Price Cap</label>
                    <span className={styles.priceValue}>¥{filters.budget.toLocaleString()}</span>
                  </div>
                  <input
                    type="range" min="0" max="10000" step="100"
                    value={filters.budget}
                    onChange={(e) => setFilters({ ...filters, budget: Number(e.target.value) })}
                    className={styles.rangeInput}
                  />
                  <div className={styles.rangeLabels}>
                    <span>MIN</span>
                    <span>MAX</span>
                  </div>
                </section>

                {/* 03. プラットフォーム */}
                <section className={styles.filterGroup}>
                  <label className={styles.filterLabel}>03. Platform Provider</label>
                  <div className={styles.buttonGrid}>
                    {['all', 'FANZA', 'DUGA'].map((p) => (
                      <button
                        key={p}
                        onClick={() => setFilters({ ...filters, source: p })}
                        className={filters.source === p ? styles.btnActive : styles.btnInactive}
                      >
                        {p.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </section>

                {/* 04. AI解析スコア */}
                <section className={styles.filterGroup}>
                  <label className={styles.filterLabel}>04. Min AI Score</label>
                  <div className={styles.scoreSelectors}>
                    {[0, 70, 90].map((s) => (
                      <button
                        key={s}
                        onClick={() => setFilters({ ...filters, minScore: s })}
                        className={filters.minScore === s ? styles.btnActive : styles.btnInactive}
                      >
                        {s === 0 ? 'ALL' : `${s}+`}
                      </button>
                    ))}
                  </div>
                </section>

                {/* 05. 動画要件 */}
                <section className={styles.specialFilter}>
                  <label className={styles.checkboxLabel}>
                    <div className={styles.checkboxStyled}>
                      <input
                        type="checkbox"
                        checked={filters.hasVideo}
                        onChange={(e) => setFilters({ ...filters, hasVideo: e.target.checked })}
                      />
                      <div className={styles.checkboxCheck}></div>
                    </div>
                    <span className={styles.checkboxText}>
                      <PlayCircle className="w-3 h-3 mr-1 inline" />
                      サンプル動画あり限定
                    </span>
                  </label>
                </section>

              </div>
            </div>
          </aside>

          {/* ─── 📊 右側：メインコンテンツエリア ─── */}
          <main className={styles.mainContent}>
            
            {/* ツールバー */}
            <div className={styles.toolbar}>
              <div className={styles.resultMeta}>
                <div className={styles.metaItem}>
                  <HardDrive className="w-4 h-4 mr-2 text-cyan-500" />
                  <span>MATRIX ARCHIVE:</span>
                  <strong>{totalCount.toLocaleString()}</strong>
                </div>
              </div>

              <div className={styles.sortBox}>
                <BarChart3 className="w-4 h-4 mr-2 text-gray-500" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className={styles.sortSelect}
                >
                  <option value="newest">NEWEST_RELEASES</option>
                  <option value="price_asc">LOW_PRICE</option>
                  <option value="spec_score">AI_SCORE_DESC</option>
                  <option value="popular">TRENDING_NOW</option>
                </select>
              </div>
            </div>

            {/* 結果表示ロジック */}
            {isLoading ? (
              <div className={styles.loadingContainer}>
                <div className={styles.loader}>
                  <div className={styles.scanner}></div>
                  <h3 className={styles.loadingTitle}>AI_SCANNING_IN_PROGRESS...</h3>
                </div>
              </div>
            ) : products.length > 0 ? (
              <div className={styles.productGrid}>
                {products.map(product => (
                  <AdultProductCard key={product.unique_id || product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>🛰️</div>
                <h3 className={styles.emptyTitle}>NO_DATA_MATCHED</h3>
                <p className={styles.emptyText}>フィルター条件を緩和して再スキャンしてください。</p>
                <button 
                  onClick={() => setFilters({ budget: 5000, source: 'all', category: 'all', hasVideo: false, minScore: 0, term: '' })}
                  className={styles.resetBtn}
                >
                  RESET_FILTERS
                </button>
              </div>
            )}
          </main>

        </div>
      </div>
    </div>
  );
}