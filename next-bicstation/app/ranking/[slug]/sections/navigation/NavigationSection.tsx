// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/[type]/sections/navigation/NavigationSection.tsx

/* eslint-disable @next/next/no-img-element */
// @ts-nocheck

import styles
  from './NavigationSection.module.css'

/* =========================================
🔥 Components
========================================= */

import RankingNavigation
  from '../../components/RankingNavigation'

/* =========================================
🔥 Section
========================================= */

export default function
NavigationSection() {

  return (

    <section
      className={
        styles.section
      }
    >

      {/* ==================================
      Header
      semantic routing layer
      ================================== */}

      <div
        className={
          styles.header
        }
      >

        <div
          className={
            styles.label
          }
        >
          Explore More
        </div>

        <h2
          className={
            styles.title
          }
        >
          他のランキングも見る
        </h2>

        <p
          className={
            styles.description
          }
        >
          用途・GPU・価格・メーカーなど、
          別の視点から最適なPCを探せます。
        </p>

      </div>

      {/* ==================================
      Navigation Renderer
      ================================== */}

      <RankingNavigation />

    </section>

  )
}

