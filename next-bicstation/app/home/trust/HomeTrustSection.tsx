// /home/maya/shin-vps/next-bicstation/app/components/home/trust/HomeTrustSection.tsx

import styles
  from '../styles/trust.module.css'

const TRUST_ITEMS = [
  {
    icon: '🛡',
    title: '初心者でも比較しやすい',
    description:
      '用途ベース recommendation により、スペック知識がなくても選びやすい。',
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
      '価格だけでなく、長く使いやすい構成も考慮しています。',
  },
  {
    icon: '🎮',
    title: '用途別 recommendation',
    description:
      'FPS gaming・配信・動画編集など目的別に探せます。',
  },
]

export default function HomeTrustSection() {

  return (

    <section
      className={
        styles.trustSection
      }
    >

      {/* =====================================
      HEADER
      ===================================== */}

      <div
        className={
          styles.trustHeader
        }
      >

        <div
          className={
            styles.trustLabel
          }
        >
          TRUSTED COMPARISON
        </div>

        <h2
          className={
            styles.trustTitle
          }
        >
          安心して
          比較を始められる
        </h2>

        <p
          className={
            styles.trustDescription
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
          styles.trustGrid
        }
      >

        {TRUST_ITEMS.map((item) => (

          <div
            key={item.title}

            className={
              styles.trustCard
            }
          >

            <div
              className={
                styles.trustIcon
              }
            >
              {item.icon}
            </div>

            <h3
              className={
                styles.trustCardTitle
              }
            >
              {item.title}
            </h3>

            <p
              className={
                styles.trustCardDescription
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