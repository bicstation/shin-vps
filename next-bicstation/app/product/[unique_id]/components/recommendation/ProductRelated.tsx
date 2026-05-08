// next-bicstation/app/product/[unique_id]/components/hero/ProductHeroTrust.tsx

import styles
  from './recommendation.module.css'

type Props = {
  product: any
}

/* =========================================
🔥 HELPERS
========================================= */

function buildTrustBadges(
  product: any
) {

  const text = JSON.stringify(
    product
  ).toLowerCase()

  const badges = []

  /* ======================================
  🎮 gaming
  ====================================== */

  if (
    text.includes('rtx')
    || text.includes('gaming')
    || text.includes('geforce')
  ) {

    badges.push(
      '🎮 FPS gaming 対応'
    )

  }

  /* ======================================
  🤖 AI
  ====================================== */

  if (
    text.includes('rtx')
    || text.includes('ai')
  ) {

    badges.push(
      '🤖 AI画像生成対応'
    )

  }

  /* ======================================
  🎬 creator
  ====================================== */

  if (
    text.includes('creator')
    || text.includes('premiere')
    || text.includes('davinci')
  ) {

    badges.push(
      '🎬 動画編集向け'
    )

  }

  /* ======================================
  🧠 multitask
  ====================================== */

  if (
    text.includes('32gb')
    || text.includes('64gb')
  ) {

    badges.push(
      '🧠 長く使いやすい'
    )

  }

  /* ======================================
  ⚡ default
  ====================================== */

  badges.push(
    '⚡ 初心者にも人気'
  )

  return badges.slice(0, 5)

}

/* =========================================
🔥 COMPONENT
========================================= */

export default function ProductHeroTrust({
  product,
}: Props) {

  const badges =
    buildTrustBadges(
      product
    )

  if (
    !badges.length
  ) {
    return null
  }

  return (

    <section
      className={
        styles.heroTrustSection
      }
    >

      {/* ==================================
      HEADER
      ================================== */}

      <div
        className={
          styles.heroTrustHeader
        }
      >

        <div
          className={
            styles.heroTrustLabel
          }
        >
          TRUST SIGNALS
        </div>

        <h2
          className={
            styles.heroTrustTitle
          }
        >
          このPCが選ばれやすい理由
        </h2>

      </div>

      {/* ==================================
      BADGES
      ================================== */}

      <div
        className={
          styles.heroTrustGrid
        }
      >

        {badges.map(
          (badge) => (

            <div
              key={badge}

              className={
                styles.heroTrustBadge
              }
            >
              {badge}
            </div>

          )
        )}

      </div>

      {/* ==================================
      FOOTER
      ================================== */}

      <div
        className={
          styles.heroTrustFooter
        }
      >

        <div
          className={
            styles.heroTrustFooterText
          }
        >
          ✔ gaming・AI・creator用途など、
          実利用ベースで評価しています。
        </div>

      </div>

    </section>

  )
}