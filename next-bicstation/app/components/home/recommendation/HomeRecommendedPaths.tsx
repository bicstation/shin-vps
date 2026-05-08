// /home/maya/shin-vps/next-bicstation/app/components/home/recommendation/HomeRecommendedPaths.tsx

import Link
  from 'next/link'

import styles
  from '../styles/recommendation.module.css'

import {
  HOME_RECOMMENDATION_PATHS,
} from '../data/recommendation'

export default function HomeRecommendedPaths() {

  return (

    <section
      className={
        styles.pathsSection
      }
    >

      {/* =====================================
      HEADER
      ===================================== */}

      <div
        className={
          styles.pathsHeader
        }
      >

        <div
          className={
            styles.pathsLabel
          }
        >
          RECOMMENDED PATHS
        </div>

        <h2
          className={
            styles.pathsTitle
          }
        >
          用途別に
          比較しやすい
        </h2>

        <p
          className={
            styles.pathsDescription
          }
        >
          gaming・AI画像生成・
          creator用途・コスパ重視など。

          「何をしたいか」

          から比較しやすい
          semantic recommendation path を
          提供します。
        </p>

      </div>

      {/* =====================================
      GRID
      ===================================== */}

      <div
        className={
          styles.pathsGrid
        }
      >

        {HOME_RECOMMENDATION_PATHS.map((item) => (

          <Link
            key={item.id}

            href={item.href}

            className={
              styles.pathsCard
            }
          >

            {/* =================================
            TOP
            ================================= */}

            <div
              className={
                styles.pathsCardTop
              }
            >

              <div
                className={
                  styles.pathsIcon
                }
              >
                {item.icon}
              </div>

              <div
                className={
                  styles.pathsCardTitle
                }
              >
                {item.title}
              </div>

            </div>

            {/* =================================
            DESCRIPTION
            ================================= */}

            <div
              className={
                styles.pathsCardDescription
              }
            >
              {item.description}
            </div>

            {/* =================================
            ACTION
            ================================= */}

            <div
              className={
                styles.pathsCardAction
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