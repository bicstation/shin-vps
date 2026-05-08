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

  // =====================================
  // Empty
  // =====================================

  if (!products?.length) {
    return null
  }

  // =====================================
  // Compare Products
  // =====================================

  const compareProducts =
    products.slice(0, 12)

  return (

    <section
      className={
        styles.productSection
      }
    >

      {/* =================================
      HEADER
      comparison continuation layer
      ================================= */}

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
          COMPARE PRODUCTS
        </span>

        <h2
          className={
            styles.sectionTitle
          }
        >
          あなたに合う構成を比較
        </h2>

        <p
          className={
            styles.sectionDescription
          }
        >
          FPS・AI・動画編集・コスパなど、
          用途ごとの違いを見比べながら
          自分に合う構成を探せます。
        </p>

      </div>

      {/* =================================
      GRID
      comparison continuation grid
      ================================= */}

      <div
        className={
          styles.grid
        }
      >

        {compareProducts.map((

          product,
          index

        ) => {

          // -------------------------------
          // Guard
          // -------------------------------

          if (
            !product?.unique_id
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

        })}

      </div>

    </section>

  )
}