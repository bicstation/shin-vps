"use client";

/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import styles from './ProductCard.module.css';
import { ReactNode } from 'react';
// ✅ 新しく作成したデコードユーティリティをインポート
import { decodeHtml } from '../lib/decode';

/**
 * =====================================================================
 * 🗂️ 拡張版 ProductCard コンポーネント
 * Finder, Ranking, Catalog すべてに対応可能なユニバーサル設計
 * =====================================================================
 */

interface ProductCardProps {
  product: any;
  rank?: number;        // ランキング順位 (オプション)
  children?: ReactNode; // レーダーチャート等の追加コンテンツ (オプション)
  showActions?: boolean; // 詳細・購入ボタンを表示するか (デフォルト true)
}

const attrColorMap: { [key: string]: { bg: string, text: string, border: string } } = {
  cpu: { bg: '#eef2ff', text: '#3730a3', border: '#e0e7ff' },
  mem: { bg: '#f0fdf4', text: '#166534', border: '#dcfce7' },
  storage: { bg: '#fffbeb', text: '#92400e', border: '#fef3c7' },
  gpu: { bg: '#fef2f2', text: '#991b1b', border: '#fee2e2' },
  'GPUモデル': { bg: '#fef2f2', text: '#991b1b', border: '#fee2e2' },
  npu: { bg: '#faf5ff', text: '#6b21a8', border: '#f3e8ff' },
  '1. 画面サイズ': { bg: '#f8fafc', text: '#475569', border: '#e2e8f0' },
  'PC形状': { bg: '#f5f5f5', text: '#666666', border: '#e5e5e5' },
};

export default function ProductCard({ 
  product, 
  rank, 
  children, 
  showActions = true 
}: ProductCardProps) {
  
  if (!product) return null;

  // 🚩 各種データの正規化
  const buyLink = product.affiliate_url || product.url || '#';
  const displayMaker = product.maker || product.maker_name || 'Brand';
  const displayPrice = product.price ? Number(product.price) : 0;

  // ✅ 商品名をデコード済みの状態で変数に格納
  const decodedProductName = decodeHtml(product.name || '');

  const getSafeImageUrl = () => {
    // 画像URLがない場合
    if (!product?.image_url) {
      return 'https://placehold.jp/24/3b82f6/ffffff/300x200.png?text=No%20Image';
    }
    // 文字列であることを保証しつつ、httpをhttpsに置換
    return String(product.image_url).replace('http://', 'https://');
  };

  const getAttrHref = (attrSlug: string) => {
    return displayMaker 
      ? `/brand/${displayMaker.toLowerCase()}?attribute=${attrSlug}`
      : `/catalog?attribute=${attrSlug}`;
  };

  // 🚩 ランキングに応じたクラス付与 (rank_1, rank_2, rank_3 ...)
  const cardClassName = `${styles.card} ${rank ? styles[`rank_${rank}`] : ''}`;

  return (
    <article className={cardClassName}>
      {/* 🚩 順位バッジ */}
      {rank && (
        <div className={`${styles.rankBadge} ${styles[`rankBadge_${rank}`]}`}>
          {rank}
        </div>
      )}

      {/* 🚩 スコア表示 */}
      {product.spec_score && (
        <div className={styles.scoreBadge}>
          AI SCORE: <span>{product.spec_score}</span>
        </div>
      )}

      <div className={styles.imageArea}>
        <img 
          src={getSafeImageUrl()} 
          alt={`${displayMaker} ${decodedProductName}`} 
          className={styles.image}
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://placehold.jp/24/3b82f6/ffffff/300x200.png?text=No%20Image';
          }}
        />
      </div>

      <div className={styles.metaInfo}>
        <span className={styles.makerBadge}>{displayMaker}</span>
        {product.stock_status && (
          <span className={`${styles.stockStatus} ${product.stock_status === '在庫あり' ? styles.inStock : ''}`}>
            {product.stock_status}
          </span>
        )}
      </div>

      <h3 className={styles.productName}>
        {/* ✅ 表示テキストにデコード済みの名前を適用 */}
        <Link href={`/product/${product.unique_id}`}>{decodedProductName}</Link>
      </h3>

      {/* 🚩 追加コンテンツスロット (ここにレーダーチャートなどが入る) */}
      {children && (
        <div className={styles.extraContent}>
          {/* ResponsiveContainerがこのコンポーネントの外側（親側）で定義されている場合、
            ここでの children に minWidth={0} などのプロパティが伝播しないことがあります。
            もし警告が消えない場合は、親側（チャートを渡している側）の 
            <ResponsiveContainer> に minWidth={0} を追加してください。
          */}
          {children}
        </div>
      )}

      <div className={styles.attributeList}>
        {/* 詳細属性がある場合 */}
        {product.attributes?.map((attr: any) => {
          const colors = attrColorMap[attr.attr_type] || attrColorMap[attr.attr_type_display] || { bg: '#f9fafb', text: '#374151', border: '#f3f4f6' };
          return (
            <Link key={attr.id} href={getAttrHref(attr.slug)} className={styles.attrBadge} style={{ backgroundColor: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}>
              <span className={styles.attrTypeLabel}>{attr.attr_type_display}:</span> {attr.name}
            </Link>
          );
        })}

        {/* 属性がない場合の簡易タグ (スペックを文字列で表示) */}
        {!product.attributes && (
          <div className={styles.simpleTags}>
            {product.cpu_model && <span className={styles.simpleTag}>{product.cpu_model}</span>}
            {product.memory_gb && <span className={styles.simpleTag}>{product.memory_gb}GB RAM</span>}
            {product.storage_gb && <span className={styles.simpleTag}>{product.storage_gb}GB SSD</span>}
            {product.is_ai_pc && <span className={styles.aiBadge}>AI PC</span>}
          </div>
        )}
      </div>

      <div className={styles.priceContainer}>
        <p className={styles.price}>
          {displayPrice > 0 ? (
            <>
              <span className={styles.currency}>¥</span>
              <span className={styles.amount}>{displayPrice.toLocaleString()}</span>
              <span className={styles.taxLabel}>(税込)</span>
            </>
          ) : <span className={styles.priceUnknown}>価格不明</span>}
        </p>
      </div>

      {/* 🚩 ボタンエリア (フラグで非表示も可能) */}
      {showActions && (
        <div className={styles.actions}>
          <Link href={`/product/${product.unique_id}`} className={styles.detailBtn}>詳細スペック</Link>
          <a href={buyLink} target="_blank" rel="noopener noreferrer" className={styles.buyBtn}>公式サイト</a>
        </div>
      )}
    </article>
  );
}