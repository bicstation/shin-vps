// /home/maya/shin-vps/next-bicstation/app/components/home/recommendation/HomeIntentNav.tsx

import Link
  from 'next/link'

import styles
  from '../styles/recommendation.module.css'

import {
  INTENT_NAV,
} from '../data/recommendation'

export default function HomeIntentNav() {

  return (

    <section
      className={
        styles.intentSection
      }
    >

      {/* =====================================
      HEADER
      ===================================== */}

      <div
        className={
          styles.intentHeader
        }
      >

        <div
          className={
            styles.intentLabel
          }
        >
          RECOMMENDATION PATHS
        </div>

        <h2
          className={
            styles.intentTitle
          }
        >
          やりたいこと
          から探せる
        </h2>

        <p
          className={
            styles.intentDescription
          }
        >
          gaming・AI画像生成・
          動画編集・長期利用など。

          「何をしたいか」

          から比較しやすい
          semantic recommendation
          navigation を提供します。
        </p>

      </div>

      {/* =====================================
      GRID
      ===================================== */}

      <div
        className={
          styles.intentGrid
        }
      >

        {INTENT_NAV.map((intent) => (

          <Link
            key={intent.slug}

            href={
              `/ranking/${intent.slug}`
            }

            className={
              styles.intentCard
            }
          >

            {/* =================================
            TOP
            ================================= */}

            <div
              className={
                styles.intentCardTop
              }
            >

              <div
                className={
                  styles.intentIcon
                }
              >
                {intent.icon}
              </div>

              <div>

                <div
                  className={
                    styles.intentCardTitle
                  }
                >
                  {intent.label}
                </div>

                <div
                  className={
                    styles.intentCardText
                  }
                >
                  {intent.description}
                </div>

              </div>

            </div>

            {/* =================================
            FOOTER
            ================================= */}

            <div
              className={
                styles.intentCardFooter
              }
            >
              おすすめを見る →
            </div>

          </Link>

        ))}

      </div>

    </section>

  )
}