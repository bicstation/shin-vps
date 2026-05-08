// /home/maya/shin-vps/next-bicstation/app/components/home/compare/HomeQuickCompare.tsx

import Link
  from 'next/link'

import styles
  from '../styles/compare.module.css'

const QUICK_COMPARE_ITEMS = [
  {
    icon: '🎮',

    title: 'FPS Gaming',

    description:
      '高FPS・高リフレッシュレート向け gaming PC を比較。',

    specs: [
      'RTX 5070〜',
      '高fps対応',
      '144Hz向け',
    ],

    href: '/ranking/gaming',
  },

  {
    icon: '🤖',

    title: 'AI画像生成',

    description:
      'Stable Diffusion や生成AI用途向けの GPU構成。',

    specs: [
      'VRAM重視',
      'RTX GPU',
      '生成速度向上',
    ],

    href: '/ranking/ai',
  },

  {
    icon: '🎬',

    title: '動画編集',

    description:
      'Premiere Pro・配信向けの creator PC。',

    specs: [
      '高性能CPU',
      '高速SSD',
      'マルチタスク',
    ],

    href: '/ranking/creator',
  },
]

export default function HomeQuickCompare() {

  return (

    <section
      className={
        styles.quickCompareSection
      }
    >

      {/* =====================================
      HEADER
      ===================================== */}

      <div
        className={
          styles.quickCompareHeader
        }
      >

        <div
          className={
            styles.quickCompareLabel
          }
        >
          QUICK COMPARISON
        </div>

        <h2
          className={
            styles.quickCompareTitle
          }
        >
          用途別に
          比較しやすい
        </h2>

        <p
          className={
            styles.quickCompareDescription
          }
        >
          gaming・AI画像生成・
          動画編集など、

          「何をしたいか」

          から比較しやすい
          semantic recommendation
          experience を提供します。
        </p>

      </div>

      {/* =====================================
      GRID
      ===================================== */}

      <div
        className={
          styles.quickCompareGrid
        }
      >

        {QUICK_COMPARE_ITEMS.map((item) => (

          <Link
            key={item.title}

            href={item.href}

            className={
              styles.quickCompareCard
            }
          >

            {/* =================================
            TOP
            ================================= */}

            <div
              className={
                styles.quickCompareCardTop
              }
            >

              <div
                className={
                  styles.quickCompareIcon
                }
              >
                {item.icon}
              </div>

              <h3
                className={
                  styles.quickCompareCardTitle
                }
              >
                {item.title}
              </h3>

              <p
                className={
                  styles.quickCompareCardDescription
                }
              >
                {item.description}
              </p>

            </div>

            {/* =================================
            META
            ================================= */}

            <div
              className={
                styles.quickCompareMeta
              }
            >

              {item.specs.map((spec) => (

                <div
                  key={spec}

                  className={
                    styles.quickCompareChip
                  }
                >
                  {spec}
                </div>

              ))}

            </div>

            {/* =================================
            ACTION
            ================================= */}

            <div
              className={
                styles.quickCompareAction
              }
            >
              比較を見る →
            </div>

          </Link>

        ))}

      </div>

    </section>

  )
}