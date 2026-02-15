/* eslint-disable @next/next/no-img-element */
import { notFound } from 'next/navigation';

// 💡 共有ライブラリから最適化された関数をインポート
import { getAdultProducts } from '@/shared/lib/api/django/adult'; 
import SystemDiagnosticHero from '@/shared/debug/SystemDiagnosticHero';
import Pagination from '@/shared/common/Pagination';
import AdultProductCard from '@/shared/cards/AdultProductCard';
import AdultSidebar from '@/shared/layout/Sidebar/AdultSidebar';
import styles from './CategoryProduct.module.css';

// 許可されたカテゴリ一覧
const VALID_CATEGORIES = ['actress', 'genre', 'series', 'maker', 'director', 'author'];

interface PageProps {
  params: { category: string; id: string };
  searchParams: { offset?: string; limit?: string; api_source?: string };
}

/**
 * 🛠️ カテゴリ個別商品一覧ページ (仕分け・同期・完全版)
 * Django側の「__slug」フィルタリングと完全に連動します。
 */
export default async function CategoryProductPage({ params, searchParams }: PageProps) {
  // 1. パラメータの抽出と正規化
  const platform = (searchParams.api_source || "video").toLowerCase();
  const { category, id } = params; // id は URL上のスラッグ（例: %E7%86%9F%E5%A5%B3）
  const offset = parseInt(searchParams.offset || '0', 10);
  const limit = parseInt(searchParams.limit || '24', 10); // Djangoのページネーション設定(24)に合わせる

  // 2. バリデーション
  if (!category || !VALID_CATEGORIES.includes(category)) {
    notFound();
  }

  // 表示用にURLエンコードされたIDをデコード（例: %E7%86%9F%E5%A5%B3 -> 熟女）
  let decodedTitle = "";
  try {
    decodedTitle = decodeURIComponent(id);
  } catch (e) {
    decodedTitle = id;
  }

  /**
   * 3. APIクエリの構築
   * Djangoの AdultProductListAPIView / UnifiedAdultProductListView 
   * が待ち構えている `${category}_slug` 形式のキーを動的に生成。
   */
  const queryParams: any = {
    [`${category}_slug`]: decodedTitle, // 💡 デコード済み文字列（スラッグ）を渡す
    api_source: platform.toUpperCase(),
    offset: offset.toString(),
    limit: limit.toString(),
  };

  let items = [];
  let totalCount = 0;
  let debugInfo: any = { 
    status: 'SCANNING_NODE', 
    platform: platform.toUpperCase(), 
    category, 
    target_slug: decodedTitle,
    api_params: queryParams 
  };

  // 4. データ取得の実行 (Django APIへのリクエスト)
  try {
    // 💡 共通ライブラリ adult.ts の getAdultProducts を使用
    const response = await getAdultProducts(queryParams);
    
    items = response.results || [];
    totalCount = response.count || 0;
    
    debugInfo.status = 'NODE_SYNC_COMPLETE';
    debugInfo.count = items.length;
    debugInfo.total_in_db = totalCount;
  } catch (e) {
    debugInfo.status = 'CRITICAL_CONNECTION_ERROR';
    debugInfo.error = String(e);
  }

  return (
    <main className={styles.container}>
      {/* 🚀 システム診断：開発環境でAPI疎通とフィルタリング結果を視覚化 */}
      <SystemDiagnosticHero 
        title="CATEGORY_DATA_STREAM_ANALYZER" 
        data={debugInfo} 
      />

      <div className={styles.layout}>
        {/* ⚡ サイドバー (左配置: ジャンル・女優等の集計・切替を担当) */}
        <aside className={styles.sidebar}>
          <AdultSidebar 
            currentCategory={category}
            currentId={id} // リンク生成用にエンコード済みのIDを渡す
            platform={platform}
            totalCount={totalCount}
          />
        </aside>

        {/* 📋 メインコンテンツ (右配置: 商品グリッド) */}
        <div className={styles.mainContent}>
          <header className={styles.headerContainer}>
            <h1 className={styles.title}>
              <span className={styles.categoryPrefix}>{category.toUpperCase()}:</span>
              <span className={styles.targetName}>{decodedTitle}</span>
              <span className={styles.nodeCount}>({totalCount.toLocaleString()} items)</span>
              <div className={styles.nodeLabel}>NODE: {platform.toUpperCase()}</div>
            </h1>
          </header>

          <section className={styles.productGrid}>
            {items.length > 0 ? (
              items.map((product: any) => (
                <AdultProductCard 
                  key={product.id || product.display_id} 
                  product={product} 
                />
              ))
            ) : (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>[!]</div>
                <div className={styles.emptyText}>NO_RECORDS_FOUND_IN_THIS_NODE</div>
                <p className={styles.emptyHint}>
                  HINT: Check if <strong>{category}_slug: "{decodedTitle}"</strong> matches exactly in Django DB.
                </p>
              </div>
            )}
          </section>

          {/* 💡 ページネーション：24件ずつの遷移 */}
          {totalCount > limit && (
            <div className={styles.paginationWrapper}>
              <Pagination 
                currentOffset={offset} 
                limit={limit} 
                totalCount={totalCount} 
              />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}