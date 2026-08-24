// /home/maya/shin-dev/shin-vps/shared/components/organisms/cards/ProductCard.tsx

/* eslint-disable @next/next/no-img-element */

import Link from 'next/link'
import styles from './ProductCard.module.css'

type Props = {
  product: any
}

export default function ProductCard({
  product,
}: Props) {
  console.log('🔥 PRODUCT CARD IMAGE', {
    uniqueId: product?.uniqueId,
    name: product?.name,
    imageUrl: product?.imageUrl,
    cpuModel: product?.cpuModel,
    gpuModel: product?.gpuModel,
    memoryGb: product?.memoryGb,
  })

  const tags = [
    product?.gpuModel,
    product?.cpuModel,
    product?.memoryGb
      ? `${product.memoryGb}GB`
      : null,
  ].filter(Boolean)

  const price =
    product?.price
      ? `¥${Number(product.price).toLocaleString()}`
      : '価格未設定'

  return (
    <article className={styles.card}>
      <div className={styles.imageWrap}>
        {product?.imageUrl && (
          <img
            src={product.imageUrl}
            alt={product?.name}
            className={styles.image}
          />
        )}
      </div>

      <div className={styles.content}>
        <div className={styles.label}>
          SEMANTIC RECOMMENDATION
        </div>

        <h3 className={styles.title}>
          {product?.name}
        </h3>

        <div className={styles.maker}>
          {product?.maker}
        </div>

        <div className={styles.tags}>
          {tags.map(tag => (
            <div
              key={tag}
              className={styles.tag}
            >
              {tag}
            </div>
          ))}
        </div>

        <div className={styles.description}>
          AI画像生成・FPSゲーム・動画編集など、
          高性能用途にも対応できるバランス構成です。
        </div>

        <div className={styles.price}>
          {price}
        </div>

        <div className={styles.actions}>
          <Link
            href={`/product/${product?.uniqueId}`}
            prefetch={false}
            className={styles.primaryButton}
          >
            詳細を見る
          </Link>

          <button
            className={styles.secondaryButton}
          >
            比較
          </button>
        </div>
      </div>
    </article>
  )
}