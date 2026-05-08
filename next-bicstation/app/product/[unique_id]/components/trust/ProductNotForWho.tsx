// next-bicstation/app/product/[unique_id]/components/trust/ProductNotForWho.tsx

import styles
  from './trust.module.css'

type Props = {
  product: any
}

/* =========================================
🔥 HELPERS
========================================= */

function buildNotForWhoList(
  product: any
) {

  const text = JSON.stringify(
    product
  ).toLowerCase()

  const cautions = []

  /* ======================================
  🎬 ultra creator
  ====================================== */

  cautions.push(
    '4K映画制作レベルなら、さらに上位GPU構成も検討推奨'
  )

  /* ======================================
  🧠 heavy workstation
  ====================================== */

  if (
    !text.includes('64gb')
  ) {

    cautions.push(
      '超重量級AI学習・大規模解析用途ではメモリ不足になる可能性があります'
    )

  }

  /* ======================================
  💰 budget
  ====================================== */

  if (
    text.includes('rtx')
    || text.includes('gaming')
  ) {

    cautions.push(
      '最低価格重視なら、より軽量なコスパ構成のほうが合う場合があります'
    )

  }

  /* ======================================
  🔋 mobile
  ====================================== */

  cautions.push(
    '軽量ノートPC中心で探している人にはサイズ感が合わない場合があります'
  )

  return cautions.slice(0, 4)

}

/* =========================================
🔥 COMPONENT
========================================= */

export default function ProductNotForWho({
  product,
}: Props) {

  const cautions =
    buildNotForWhoList(
      product
    )

  if (
    !cautions.length
  ) {
    return null
  }

  return (

    <section
      className={
        styles.notForWhoSection
      }
    >

      {/* ==================================
      HEADER
      ================================== */}

      <div
        className={
          styles.notForWhoHeader
        }
      >

        <div
          className={
            styles.notForWhoLabel
          }
        >
          BEFORE YOU DECIDE
        </div>

        <h2
          className={
            styles.notForWhoTitle
          }
        >
          事前に確認しておきたいポイント
        </h2>

        <p
          className={
            styles.notForWhoDescription
          }
        >
          「とにかくおすすめ」とは言わず、
          合わないケースも含めて
          判断しやすいよう整理しています。
        </p>

      </div>

      {/* ==================================
      LIST
      ================================== */}

      <div
        className={
          styles.notForWhoGrid
        }
      >

        {cautions.map(
          (caution) => (

            <div
              key={caution}

              className={
                styles.notForWhoCard
              }
            >

              <div
                className={
                  styles.notForWhoIcon
                }
              >
                ⚠
              </div>

              <div
                className={
                  styles.notForWhoText
                }
              >
                {caution}
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
          styles.notForWhoFooter
        }
      >

        <div
          className={
            styles.notForWhoFooterText
          }
        >
          ✔ 「向いていないケース」も整理することで、
          後悔しにくい選択をサポートします。
        </div>

      </div>

    </section>

  )
}