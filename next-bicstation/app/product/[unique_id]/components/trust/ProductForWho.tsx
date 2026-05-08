// next-bicstation/app/product/[unique_id]/components/trust/ProductForWho.tsx

import styles
  from './trust.module.css'

type Props = {
  product: any
}

/* =========================================
🔥 HELPERS
========================================= */

function buildForWhoList(
  product: any
) {

  const text = JSON.stringify(
    product
  ).toLowerCase()

  const targets = []

  /* ======================================
  🎮 gaming
  ====================================== */

  if (
    text.includes('rtx')
    || text.includes('gaming')
    || text.includes('geforce')
  ) {

    targets.push(
      'FPSゲームを快適に遊びたい人'
    )

    targets.push(
      '高画質 gaming を楽しみたい人'
    )

  }

  /* ======================================
  🤖 AI
  ====================================== */

  if (
    text.includes('rtx')
    || text.includes('ai')
  ) {

    targets.push(
      'AI画像生成を始めたい人'
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

    targets.push(
      '動画編集にも使いたい人'
    )

  }

  /* ======================================
  🧠 multitask
  ====================================== */

  if (
    text.includes('32gb')
    || text.includes('64gb')
  ) {

    targets.push(
      '長く快適に使いたい人'
    )

    targets.push(
      'ゲーム配信や同時作業をしたい人'
    )

  }

  /* ======================================
  💻 default
  ====================================== */

  if (
    targets.length === 0
  ) {

    targets.push(
      '日常用途を快適化したい人'
    )

    targets.push(
      '初めて高性能PCを選ぶ人'
    )

  }

  return targets.slice(0, 6)

}

/* =========================================
🔥 COMPONENT
========================================= */

export default function ProductForWho({
  product,
}: Props) {

  const targets =
    buildForWhoList(
      product
    )

  if (
    !targets.length
  ) {
    return null
  }

  return (

    <section
      className={
        styles.forWhoSection
      }
    >

      {/* ==================================
      HEADER
      ================================== */}

      <div
        className={
          styles.forWhoHeader
        }
      >

        <div
          className={
            styles.forWhoLabel
          }
        >
          FOR WHO
        </div>

        <h2
          className={
            styles.forWhoTitle
          }
        >
          こんな人におすすめ
        </h2>

        <p
          className={
            styles.forWhoDescription
          }
        >
          このPCが特に向いている
          利用スタイルやユーザー像を
          わかりやすく整理しています。
        </p>

      </div>

      {/* ==================================
      LIST
      ================================== */}

      <div
        className={
          styles.forWhoGrid
        }
      >

        {targets.map(
          (target) => (

            <div
              key={target}

              className={
                styles.forWhoCard
              }
            >

              <div
                className={
                  styles.forWhoCheck
                }
              >
                ✓
              </div>

              <div
                className={
                  styles.forWhoText
                }
              >
                {target}
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
          styles.forWhoFooter
        }
      >

        <div
          className={
            styles.forWhoFooterText
          }
        >
          ✔ gaming・AI・クリエイティブ用途など、
          幅広いニーズに対応しやすい構成です。
        </div>

      </div>

    </section>

  )
}