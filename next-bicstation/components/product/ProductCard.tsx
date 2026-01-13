/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import styles from './ProductCard.module.css';

const attrColorMap: { [key: string]: { bg: string, text: string, border: string } } = {
  cpu: { bg: '#eef2ff', text: '#3730a3', border: '#e0e7ff' },
  memory: { bg: '#f0fdf4', text: '#166534', border: '#dcfce7' },
  npu: { bg: '#faf5ff', text: '#6b21a8', border: '#f3e8ff' },
  storage: { bg: '#fffbeb', text: '#92400e', border: '#fef3c7' },
  gpu: { bg: '#fef2f2', text: '#991b1b', border: '#fee2e2' },
  os: { bg: '#f8fafc', text: '#1e293b', border: '#f1f5f9' },
};

export default function ProductCard({ product }: any) {
  const buyLink = product.affiliate_url || product.url || '#';

  /**
   * 💡 スペックバッジのリンク先を決定する関数
   * 現在の商品のメーカーページ内での絞り込みを優先する
   */
  const getAttrHref = (attrSlug: string) => {
    if (product.maker) {
      return `/brand/${product.maker.toLowerCase()}?attribute=${attrSlug}`;
    }
    return `/pc-products?attribute=${attrSlug}`;
  };

  return (
    <div className={styles.card}>
      {/* 商品画像エリア */}
      <div className={styles.imageArea}>
        <img 
          src={product.image_url || '/no-image.png'} 
          alt={product.name} 
          className={styles.image}
        />
      </div>

      {/* メーカー・在庫ステータス */}
      <div className={styles.metaInfo}>
        <span className={styles.makerBadge}>
          {product.maker}
        </span>
        <span className={styles.stockStatus}>
          {product.stock_status}
        </span>
      </div>

      {/* 商品名 */}
      <h3 className={styles.productName}>
        {product.name}
      </h3>

      {/* 🚀 改善：クリック可能なバッジ表示エリア */}
      <div className={styles.attributeList}>
        {product.attributes && product.attributes.map((attr: any) => {
          const colors = attrColorMap[attr.attr_type] || { bg: '#f9fafb', text: '#374151', border: '#f3f4f6' };
          return (
            <Link
              key={attr.id}
              href={getAttrHref(attr.slug)}
              className={styles.attrBadge}
              style={{
                backgroundColor: colors.bg,
                color: colors.text,
                border: `1px solid ${colors.border}`,
              }}
            >
              {attr.attr_type_display}: {attr.name}
            </Link>
          );
        })}
      </div>

      {/* 価格表示 */}
      <p className={styles.price}>
        {product.price > 0 ? `¥${product.price.toLocaleString()}` : "価格不明"}
      </p>

      {/* アクションボタン */}
      <div className={styles.actions}>
        <Link href={`/product/${product.unique_id}`} className={styles.detailBtn}>
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
    </div>
  );
}