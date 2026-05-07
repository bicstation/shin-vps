import ProductCard
  from '@/shared/components/organisms/cards/ProductCard'

import styles
  from '../page.module.css'

type Props = {
  product: any
}

export default function HomeTopPick({
  product,
}: Props) {

  // --------------------------------
  // Empty
  // --------------------------------
  if (!product) {
    return null
  }

  return (
    <section
      className={
        styles.topPickSection
      }
    >

      {/* =====================================
      HEADER
      ===================================== */}

      <div
        className={
          styles.topPickHeader
        }
      >

        <div
          className={
            styles.topPickLabel
          }
        >
          🔥 TOP PICK
        </div>

        <h2
          className={
            styles.topPickTitle
          }
        >
          迷ったらまずこれ
        </h2>

        <p
          className={
            styles.topPickDescription
          }
        >
          ゲーム・動画編集・AI用途まで
          幅広く使いやすい、
          人気の高性能PCです。
        </p>

      </div>

      {/* =====================================
      HERO PRODUCT CARD
      ===================================== */}

      <div
        className={
          styles.topPickCardWrap
        }
      >

        <ProductCard
          product={product}

          rank={1}

          variant="hero"
        />

      </div>

      {/* =====================================
      SUB INFO
      ===================================== */}

      <div
        className={
          styles.topPickFooter
        }
      >

        <div
          className={
            styles.topPickFooterItem
          }
        >
          ✔ 初心者にも人気
        </div>

        <div
          className={
            styles.topPickFooterItem
          }
        >
          ✔ 高fpsゲーム対応
        </div>

        <div
          className={
            styles.topPickFooterItem
          }
        >
          ✔ 動画編集も快適
        </div>

      </div>

    </section>
  )
}