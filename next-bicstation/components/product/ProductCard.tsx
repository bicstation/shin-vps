/* eslint-disable @next/next/no-img-element */

"use client"

import Link from 'next/link';
import styles from './ProductCard.module.css';

/**
 * 💡 新しいデータ構造に合わせたカラーマップ
 */
const attrColorMap: { [key: string]: { bg: string, text: string, border: string } } = {
  cpu: { bg: '#eef2ff', text: '#3730a3', border: '#e0e7ff' },
  mem: { bg: '#f0fdf4', text: '#166534', border: '#dcfce7' },
  storage: { bg: '#fffbeb', text: '#92400e', border: '#fef3c7' },
  gpu: { bg: '#fef2f2', text: '#991b1b', border: '#fee2e2' },
  'GPUモデル': { bg: '#fef2f2', text: '#991b1b', border: '#fee2e2' },
  'ビデオメモリ': { bg: '#fff1f2', text: '#be123c', border: '#ffe4e6' },
  npu: { bg: '#faf5ff', text: '#6b21a8', border: '#f3e8ff' },
  'AIプロセッサ(NPU)': { bg: '#faf5ff', text: '#6b21a8', border: '#f3e8ff' },
  spec: { bg: '#ecfeff', text: '#0891b2', border: '#cffafe' },
  '1. 画面サイズ': { bg: '#f8fafc', text: '#475569', border: '#e2e8f0' },
  '2. 解像度軸': { bg: '#f0f9ff', text: '#0369a1', border: '#e0f2fe' },
  '3. リフレッシュレート軸': { bg: '#fff7ed', text: '#c2410c', border: '#ffedd5' },
  '4. パネル・付加価値': { bg: '#fdf2f8', text: '#9d174d', border: '#fce7f3' },
  'PC形状': { bg: '#f5f5f5', text: '#666666', border: '#e5e5e5' },
  os: { bg: '#f8fafc', text: '#1e293b', border: '#f1f5f9' },
};

export default function ProductCard({ product }: any) {
  const buyLink = product.affiliate_url || product.url || '#';

  /**
   * 🚀 Mixed Content 対策 ＆ 画像フォールバック処理
   */
  const getSafeImageUrl = () => {
    if (!product.image_url) {
      // 404エラーを防ぐため、外部プレースホルダーを使用（または確実に存在するパスに変更）
      return 'https://via.placeholder.com/300x200?text=No+Image';
    }
    // http:// を https:// に置換して Mixed Content を回避
    return product.image_url.replace('http://', 'https://');
  };

  const getAttrHref = (attrSlug: string) => {
    if (product.maker) {
      return `/brand/${product.maker.toLowerCase()}?attribute=${attrSlug}`;
    }
    return `/pc-products?attribute=${attrSlug}`;
  };

  return (
    <article className={styles.card}>
      <div className={styles.imageArea}>
        <img 
          src={getSafeImageUrl()} 
          alt={`${product.maker} ${product.name} - スペック詳細`} 
          className={styles.image}
          loading="lazy"
          onError={(e) => {
            // 画像読み込みに失敗した際の最終的なバックアップ
            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x200?text=Image+Not+Found';
          }}
        />
      </div>

      <div className={styles.metaInfo}>
        <span className={styles.makerBadge}>
          {product.maker}
        </span>
        <span className={`${styles.stockStatus} ${product.stock_status === '在庫あり' ? styles.inStock : ''}`}>
          {product.stock_status}
        </span>
      </div>

      <h3 className={styles.productName}>
        <Link href={`/product/${product.unique_id}`}>
          {product.name}
        </Link>
      </h3>

      <div className={styles.attributeList}>
        {product.attributes && product.attributes.map((attr: any) => {
          const colors = attrColorMap[attr.attr_type] || 
                         attrColorMap[attr.attr_type_display] || 
                         { bg: '#f9fafb', text: '#374151', border: '#f3f4f6' };
          
          return (
            <Link
              key={attr.id}
              href={getAttrHref(attr.slug)}
              className={styles.attrBadge}
              title={`${attr.attr_type_display}: ${attr.name} 搭載モデル一覧へ`}
              style={{
                backgroundColor: colors.bg,
                color: colors.text,
                border: `1px solid ${colors.border}`,
              }}
            >
              <span className={styles.attrTypeLabel}>{attr.attr_type_display}:</span> {attr.name}
            </Link>
          );
        })}
      </div>

      <div className={styles.priceContainer}>
        <p className={styles.price}>
          {product.price > 0 ? (
            <>
              <span className={styles.currency}>¥</span>
              <span className={styles.amount}>{product.price.toLocaleString()}</span>
              <span className={styles.taxLabel}>(税込)</span>
            </>
          ) : (
            <span className={styles.priceUnknown}>価格不明</span>
          )}
        </p>
      </div>

      <div className={styles.actions}>
        <Link 
          href={`/product/${product.unique_id}`} 
          className={styles.detailBtn}
          aria-label={`${product.name} の詳細スペックと価格推移を確認`}
        >
          詳細スペック
        </Link>

        <a 
          href={buyLink} 
          target="_blank" 
          rel="noopener noreferrer" 
          className={styles.buyBtn}
        >
          公式サイト
        </a>
      </div>
    </article>
  );
}