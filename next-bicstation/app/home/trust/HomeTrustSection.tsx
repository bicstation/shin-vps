// /app/home/trust/HomeTrustSection.tsx

import styles
  from '../styles/v2/trust.module.css'

const TRUST_ITEMS = [

  {
    icon: '🎯',
    title: '用途から探せる',
    description:
      'AI・ゲーム・動画編集・仕事など、やりたいことから最適なPCを見つけられます。',
  },

  {
    icon: '🤖',
    title: 'AIに強いPCがわかる',
    description:
      'NPU・GPU・メモリ構成を含め、AI用途に適したモデルを比較できます。',
  },

  {
    icon: '📊',
    title: 'ランキングで比較できる',
    description:
      '注目モデルや人気モデルをランキング形式で比較できます。',
  },

  {
    icon: '📚',
    title: '知識がなくても安心',
    description:
      'Guide と Finder が用途に合ったPC選びをサポートします。',
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
          WHY SHIN CORE LINX
        </div>

        <h2
          className={
            styles.trustTitle
          }
        >
          PC選びを
          もっとわかりやすく
        </h2>

        <p
          className={
            styles.trustDescription
          }
        >
          SHIN CORE LINX は、
          製品スペックだけではなく、

          「何ができるか」

          を中心に整理し、

          用途・ランキング・Guide・Finder
          を通じて、
          あなたに合ったPC探しを
          サポートします。

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

        {TRUST_ITEMS.map(item => (

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