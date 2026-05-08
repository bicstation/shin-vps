// /home/maya/shin-vps/next-bicstation/app/components/home/hero/HomeHeroTrust.tsx

import styles
  from '../styles/hero.module.css'

const TRUST_ITEMS = [
  {
    icon: '🛡',
    title: '初心者でも比較しやすい',
    description:
      '用途ベース recommendation により、スペック知識がなくても探しやすい。',
  },
  {
    icon: '🤖',
    title: 'AI用途もわかりやすい',
    description:
      '画像生成・動画編集・LLM用途などを semantic に比較できます。',
  },
  {
    icon: '⚖',
    title: '失敗しにくい選び方',
    description:
      '価格だけでなく、長く使いやすい構成も重視しています。',
  },
]

export default function HomeHeroTrust() {

  return (

    <section
      className={
        styles.heroTrustSection
      }
    >

      {/* =====================================
      HEADER
      ===================================== */}

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
          TRUST & CONFIDENCE
        </div>

        <h2
          className={
            styles.heroTrustTitle
          }
        >
          安心して
          比較を始められる
        </h2>

        <p
          className={
            styles.heroTrustDescription
          }
        >
          SHIN CORE LINX は、
          スペック比較だけではなく、

          「何ができるか」

          を semantic に整理し、
          初心者でも比較しやすい
          recommendation experience を提供します。
        </p>

      </div>

      {/* =====================================
      TRUST GRID
      ===================================== */}

      <div
        className={
          styles.heroTrustGrid
        }
      >

        {TRUST_ITEMS.map((item) => (

          <div
            key={item.title}

            className={
              styles.heroTrustCard
            }
          >

            <div
              className={
                styles.heroTrustIcon
              }
            >
              {item.icon}
            </div>

            <h3
              className={
                styles.heroTrustCardTitle
              }
            >
              {item.title}
            </h3>

            <p
              className={
                styles.heroTrustCardDescription
              }
            >
              {item.description}
            </p>

          </div>

        ))}

      </div>

    </section>

  )
}