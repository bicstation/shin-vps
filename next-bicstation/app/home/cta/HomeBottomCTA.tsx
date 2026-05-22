// /home/maya/shin-vps/next-bicstation/app/components/home/cta/HomeBottomCTA.tsx

import Link
  from 'next/link'

import styles
  from '../styles/cta.module.css'

const FEATURES = [
  '初心者向け比較',
  'RTX 50シリーズ対応',
  'AI用途にも対応',
]

export default function HomeBottomCTA() {

  return (

    <section
      className={
        styles.bottomSection
      }
    >

      <div
        className={
          styles.bottomCard
        }
      >

        {/* =====================================
        LABEL
        ===================================== */}

        <div
          className={
            styles.bottomLabel
          }
        >
          SEMANTIC PC FINDER
        </div>

        {/* =====================================
        TITLE
        ===================================== */}

        <h2
          className={
            styles.bottomTitle
          }
        >
          あなたに合うPCを、
          用途から比較して探す
        </h2>

        {/* =====================================
        DESCRIPTION
        ===================================== */}

        <p
          className={
            styles.bottomDescription
          }
        >
          gaming・AI画像生成・
          動画編集・コスパ重視まで。

          用途別 recommendation により、
          初心者でも比較しやすい
          semantic PC finder を
          提供します。
        </p>

        {/* =====================================
        FEATURES
        ===================================== */}

        <div
          className={
            styles.bottomFeatures
          }
        >

          {FEATURES.map((feature) => (

            <div
              key={feature}

              className={
                styles.bottomFeature
              }
            >
              ✔ {feature}
            </div>

          ))}

        </div>

        {/* =====================================
        CTA
        ===================================== */}

        <Link
          href="/ranking"

          className={
            styles.bottomButton
          }
        >
          おすすめランキングを見る →
        </Link>

      </div>

    </section>

  )
}