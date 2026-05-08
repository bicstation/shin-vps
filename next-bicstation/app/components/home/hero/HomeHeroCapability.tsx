// /home/maya/shin-vps/next-bicstation/app/components/home/hero/HomeHeroTrust.tsx

import styles
  from '../styles/hero.module.css'

const TRUST_POINTS = [
  {
    title: '初心者でも比較しやすい',
    description:
      '用途ベース recommendation により、スペック知識がなくても探しやすい。',
  },
  {
    title: 'AI用途もわかりやすい',
    description:
      '画像生成・動画編集・LLM用途などを semantic に比較可能。',
  },
  {
    title: '失敗しにくい構成を案内',
    description:
      '価格だけでなく、長く使いやすいバランスも重視。',
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
          TRUSTED RECOMMENDATION
        </div>

        <h2
          className={
            styles.heroTrustTitle
          }
        >
          比較に迷いにくい
          PC選びへ
        </h2>

        <p
          className={
            styles.heroTrustDescription
          }
        >
          SHIN CORE LINX は、
          価格だけではなく、

          「何ができるか」

          を semantic に整理し、
          安心して比較を始められる
          recommendation platform を目指しています。
        </p>

      </div>

      {/* =====================================
      GRID
      ===================================== */}

      <div
        className={
          styles.heroTrustGrid
        }
      >

        {TRUST_POINTS.map((item) => (

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
              ✔
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