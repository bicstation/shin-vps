// next-bicstation/app/product/[unique_id]/components/spec/ProductSpec.tsx

import styles
  from './spec.module.css'

type Props = {
  product: any
}

/* =========================================
🔥 HELPERS
========================================= */

function buildSpecs(
  product: any
) {

  return [

    {
      label: 'GPU',
      value:
        product?.gpu_name
        || 'Unknown',
    },

    {
      label: 'CPU',
      value:
        product?.cpu_name
        || 'Unknown',
    },

    {
      label: 'MEMORY',
      value:
        product?.memory
        || 'Unknown',
    },

    {
      label: 'STORAGE',
      value:
        product?.storage
        || 'Unknown',
    },

    {
      label: 'PRICE',
      value:
        product?.price
          ? `¥${Number(
              product.price
            ).toLocaleString()}`
          : 'Unknown',
    },

    {
      label: 'MAKER',
      value:
        product?.maker_name
        || product?.maker
        || 'Unknown',
    },

  ]

}

/* =========================================
🔥 COMPONENT
========================================= */

export default function ProductSpec({
  product,
}: Props) {

  const specs =
    buildSpecs(
      product
    )

  return (

    <section
      className={
        styles.specSection
      }
    >

      {/* ==================================
      HEADER
      ================================== */}

      <div
        className={
          styles.specHeader
        }
      >

        <div
          className={
            styles.specLabel
          }
        >
          FULL SPECIFICATIONS
        </div>

        <h2
          className={
            styles.specTitle
          }
        >
          詳細スペック
        </h2>

        <p
          className={
            styles.specDescription
          }
        >
          主要パーツ・価格・構成情報を
          一覧で整理しています。
        </p>

      </div>

      {/* ==================================
      TABLE
      ================================== */}

      <div
        className={
          styles.specTable
        }
      >

        {specs.map(
          (spec) => (

            <div
              key={
                spec.label
              }

              className={
                styles.specRow
              }
            >

              {/* ==========================
              LABEL
              ========================== */}

              <div
                className={
                  styles.specRowLabel
                }
              >
                {spec.label}
              </div>

              {/* ==========================
              VALUE
              ========================== */}

              <div
                className={
                  styles.specRowValue
                }
              >
                {spec.value}
              </div>

            </div>

          )
        )}

      </div>

      {/* ==================================
      FOOTER
      ================================== */}

      <div
        className={
          styles.specFooter
        }
      >

        <div
          className={
            styles.specFooterText
          }
        >
          ✔ semantic recommendation に加えて、
          構成詳細も確認できます。
        </div>

      </div>

    </section>

  )
}