// /app/home/products/HomeFeaturedProducts.tsx

import ProductCard from '@/shared/components/organisms/cards/ProductCard'
import styles from '../styles/v2/featured-products.module.css'

type Props = {
  products?: any[]
}

export default function HomeFeaturedProducts({
  products = [],
}: Props) {
  if (!products.length) {
    return null
  }

  return (
    <section className={styles.section}>

      <div className={styles.header}>

        <div className={styles.eyebrow}>
          FEATURED PRODUCTS
        </div>

        <h2 className={styles.title}>
          注目のPC
        </h2>

        <p className={styles.description}>
          今注目されているPCから、
          あなたに合った一台を見つけられます。
        </p>

      </div>

      <div className={styles.grid}>

        {products.map((product, index) => (
          <ProductCard
            key={
              product?.unique_id ??
              index
            }
            product={product}
          />
        ))}

      </div>

    </section>
  )
}