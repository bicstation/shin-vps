import ProductCard
  from '@/shared/components/organisms/cards/ProductCard'

import styles
  from '../page.module.css'

import {
  getSemanticDifference,
} from '../lib/homeHelpers'

type Props = {
  products: any[]
}

export default function HomeCompareGrid({
  products,
}: Props) {

  if (!products?.length) {
    return null
  }

  return (
    <section
      className={
        styles.compareSection
      }
    >

      <div
        className={
          styles.compareHeader
        }
      >

        <div
          className={
            styles.compareLabel
          }
        >
          Semantic Comparison
        </div>

        <h2
          className={
            styles.compareTitle
          }
        >
          他のおすすめ構成
        </h2>

        <p
          className={
            styles.compareDescription
          }
        >
          semantic difference /
          workload /
          GPU balance
          を比較。
        </p>

      </div>

      <div
        className={
          styles.compareGrid
        }
      >

        {products.map((
          product,
          index
        ) => {

          const semantic =
            getSemanticDifference(
              product
            )

          return (
            <div
              key={
                product.unique_id
              }

              className={
                styles.compareItem
              }
            >

              <div
                className={
                  styles.compareMeta
                }
              >

                {semantic.usage && (

                  <div
                    className={
                      styles.compareChip
                    }
                  >
                    {semantic.usage}
                  </div>

                )}

                {semantic.gpu && (

                  <div
                    className={
                      styles.compareChipStrong
                    }
                  >
                    {semantic.gpu}
                  </div>

                )}

                {semantic.maker && (

                  <div
                    className={
                      styles.compareChip
                    }
                  >
                    {semantic.maker}
                  </div>

                )}

              </div>

              <ProductCard
                product={product}
                rank={index + 2}
              />

            </div>
          )
        })}

      </div>

    </section>
  )
}