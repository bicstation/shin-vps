// next-bicstation/app/product/[unique_id]/components/spec/ProductRadar.tsx

import styles
  from './spec.module.css'

type Props = {
  product: any
}

/* =========================================
🔥 HELPERS
========================================= */

function buildRadarData(
  product: any
) {

  const text = JSON.stringify(
    product
  ).toLowerCase()

  let gaming = 60
  let ai = 50
  let creator = 50
  let multitask = 50
  let cost = 60

  /* ======================================
  GPU
  ====================================== */

  if (
    text.includes('4090')
  ) {

    gaming += 35
    ai += 35
    creator += 30
    cost -= 25

  } else if (
    text.includes('4080')
  ) {

    gaming += 30
    ai += 28
    creator += 24
    cost -= 18

  } else if (
    text.includes('4070')
  ) {

    gaming += 24
    ai += 22
    creator += 18
    cost -= 10

  } else if (
    text.includes('4060')
  ) {

    gaming += 18
    ai += 14
    creator += 10
    cost += 8

  }

  /* ======================================
  MEMORY
  ====================================== */

  if (
    text.includes('64gb')
  ) {

    multitask += 35
    creator += 18
    ai += 12

  } else if (
    text.includes('32gb')
  ) {

    multitask += 24
    creator += 10

  }

  return [
    {
      label: 'Gaming',
      value: Math.min(gaming, 100),
    },
    {
      label: 'AI',
      value: Math.min(ai, 100),
    },
    {
      label: 'Creator',
      value: Math.min(creator, 100),
    },
    {
      label: 'Multi',
      value: Math.min(multitask, 100),
    },
    {
      label: 'Cost',
      value: Math.min(cost, 100),
    },
  ]

}

/* =========================================
🔥 COMPONENT
========================================= */

export default function ProductRadar({
  product,
}: Props) {

  const radarData =
    buildRadarData(
      product
    )

  return (

    <section
      className={
        styles.radarSection
      }
    >

      {/* ==================================
      HEADER
      ================================== */}

      <div
        className={
          styles.radarHeader
        }
      >

        <div
          className={
            styles.radarLabel
          }
        >
          PERFORMANCE BALANCE
        </div>

        <h2
          className={
            styles.radarTitle
          }
        >
          性能バランス分析
        </h2>

        <p
          className={
            styles.radarDescription
          }
        >
          gaming・AI・creator用途など、
          利用シーン別に
          バランスを整理しています。
        </p>

      </div>

      {/* ==================================
      RADAR GRID
      ================================== */}

      <div
        className={
          styles.radarGrid
        }
      >

        {radarData.map(
          (item) => (

            <div
              key={
                item.label
              }

              className={
                styles.radarCard
              }
            >

              {/* ==========================
              TOP
              ========================== */}

              <div
                className={
                  styles.radarCardTop
                }
              >

                <div
                  className={
                    styles.radarCardLabel
                  }
                >
                  {item.label}
                </div>

                <div
                  className={
                    styles.radarCardValue
                  }
                >
                  {item.value}
                </div>

              </div>

              {/* ==========================
              BAR
              ========================== */}

              <div
                className={
                  styles.radarBar
                }
              >

                <div
                  className={
                    styles.radarBarFill
                  }

                  style={{
                    width:
                      `${item.value}%`,
                  }}
                />

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
          styles.radarFooter
        }
      >

        <div
          className={
            styles.radarFooterText
          }
        >
          ✔ semantic analysis をもとに、
          用途別バランスを整理しています。
        </div>

      </div>

    </section>

  )
}