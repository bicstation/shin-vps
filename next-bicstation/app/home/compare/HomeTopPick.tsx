// /home/maya/shin-vps/next-bicstation/app/components/home/compare/HomeTopPick.tsx

import ProductCard
  from '@/shared/components/organisms/cards/ProductCard'

import styles
  from '../styles/compare.module.css'

type Props = {
  product: any
}

const TOP_PICK_POINTS = [
  '初心者にも人気',
  'FPS gaming対応',
  '動画編集も快適',
  'AI画像生成向け',
]

export default function HomeTopPick({
  product,
}: Props) {

  // ====================================
  // EMPTY
  // ====================================

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
          TOP RECOMMENDATION
        </div>

        <h2
          className={
            styles.topPickTitle
          }
        >
          迷ったら
          まず比較したい
          人気構成
        </h2>

        <p
          className={
            styles.topPickDescription
          }
        >
          FPS gaming・動画編集・
          AI画像生成まで。

          幅広い用途で
          バランスが良く、
          初心者でも比較しやすい
          high performance PC を
          recommendation。
        </p>

      </div>

      {/* =====================================
      PRODUCT CARD
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
      SEMANTIC FOOTER
      ===================================== */}

      <div
        className={
          styles.topPickFooter
        }
      >

        {TOP_PICK_POINTS.map((point) => (

          <div
            key={point}

            className={
              styles.topPickFooterItem
            }
          >
            ✔ {point}
          </div>

        ))}

      </div>

    </section>

  )
}