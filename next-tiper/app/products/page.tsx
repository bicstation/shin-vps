/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
// ✅ shared/lib 経由のパス
import { getFanzaProducts } from '@shared/lib/api'; 
// ✅ 新構造のパス（カードコンポーネント）
import ProductCard from '@shared/cards/AdultProductCard';
import styles from './products.module.css'; 

export const dynamic = 'force-dynamic';

/**
 * 価格表示用のユーティリティ・コンポーネント
 * セール状況や価格帯を視覚的にわかりやすく表示します
 */
const PriceTag = ({ product }: { product: any }) => {
  const { price, price_info } = product;
  const isSale = price_info?.is_sale;
  const minPrice = price_info?.min_price;

  if (!price && !minPrice) return <span className={styles.freePrice}>無料 / 特典</span>;

  return (
    <div className={styles.priceWrapper}>
      {isSale && <span className={styles.saleBadge}>SALE</span>}
      <span className={isSale ? styles.salePrice : styles.normalPrice}>
        ¥{(minPrice || price).toLocaleString()}
        <span className={styles.taxIn}> (税込)</span>
      </span>
      {price_info?.campaign?.title && (
        <div className={styles.campaignText}>{price_info.campaign.title}</div>
      )}
    </div>
  );
};

export default async function ProductsPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ page?: string }> 
}) {
  // 💡 Next.js 15: searchParams を await
  const resolvedSearchParams = await searchParams;
  const currentPage = Number(resolvedSearchParams.page) || 1;
  const limit = 40;
  const offset = (currentPage - 1) * limit;

  // 💡 API呼び出し: 新しい FanzaProduct エンドポイントを使用
  // ※プロジェクトに合わせて getAdultProducts から getFanzaProducts に適宜読み替えてください
  const data = await getFanzaProducts({ 
    limit, 
    offset, 
    ordering: '-release_date' 
  }).catch((err) => {
    console.error("❌ Products fetch error:", err);
    return { results: [], count: 0 };
  });

  const products = data?.results || [];
  const totalCount = data?.count || 0;
  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        
        {/* ヘッダーエリア：統計情報を視覚化 */}
        <header className={styles.header}>
          <div className={styles.titleGroup}>
            <div className={styles.accentBar}></div>
            <h1 className={styles.title}>PREMIUM ARCHIVE</h1>
            <div className={styles.statsInfo}>
              <span className={styles.countBadge}>{totalCount.toLocaleString()}</span>
              <span className={styles.unitText}>作品を解析済み</span>
            </div>
          </div>
          
          {/* 簡単なソート・フィルタ状態の表示（将来用） */}
          <div className={styles.filterStatus}>
            Sorted by: <strong>Newest Release</strong>
          </div>
        </header>
        
        <hr className={styles.dividerLine} />

        {/* 商品グリッド */}
        {products.length > 0 ? (
          <div className={styles.grid}>
            {products.map((product: any) => (
              <div key={product.id} className={styles.cardWrapper}>
                <ProductCard product={product} />
                {/* カードの下部または内部に価格情報を差し込む */}
                <div className={styles.priceOverlay}>
                  <PriceTag product={product} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.emptyBox}>
            <div className={styles.emptyIcon}>📂</div>
            <p className={styles.emptyMsg}>作品データが見つかりませんでした。</p>
            <p className={styles.emptySub}>APIの接続設定、または同期ジョブを確認してください。</p>
          </div>
        )}
        
        {/* ページネーション：モダンなデザイン */}
        {totalPages > 1 && (
          <nav className={styles.paginationNav}>
            {currentPage > 1 ? (
              <a href={`/products?page=${currentPage - 1}`} className={styles.navBtn}>
                <span className={styles.arrow}>←</span> PREV
              </a>
            ) : <div className={styles.navBtnDisabled}>← PREV</div>}
            
            <div className={styles.pageIndicator}>
              <span className={styles.activePage}>{currentPage}</span>
              <span className={styles.slash}>/</span>
              <span className={styles.totalPage}>{totalPages}</span>
            </div>

            {currentPage < totalPages ? (
              <a href={`/products?page=${currentPage + 1}`} className={styles.navBtn}>
                NEXT <span className={styles.arrow}>→</span>
              </a>
            ) : <div className={styles.navBtnDisabled}>NEXT →</div>}
          </nav>
        )}
      </div>
    </div>
  );
}