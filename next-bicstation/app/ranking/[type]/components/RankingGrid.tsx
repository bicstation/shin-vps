import ProductCard
  from '@/shared/components/organisms/cards/ProductCard'

import styles
  from '../page.module.css'

type Props = {
  products: any[]
}

export default function RankingGrid({
  products,
}: Props) {

  if (!products?.length) {
    return null
  }

  return (
    <section
      className={
        styles.productSection
      }
    >

      <div
        className={
          styles.sectionHeader
        }
      >

        <span
          className={
            styles.sectionLabel
          }
        >
          SEMANTIC PRODUCTS
        </span>

        <h2>
          おすすめ構成一覧
        </h2>

      </div>

      <div className={styles.grid}>

        {products.map(
          (
            product,
            index
          ) => {

            if (
              !product
                ?.unique_id
            ) {
              return null
            }

            return (
              <ProductCard
                key={
                  product.unique_id
                }
                product={
                  product
                }
                rank={
                  index + 1
                }
              />
            )
          }
        )}

      </div>

    </section>
  )
}