// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/[type]/sections/recommendation/RecommendationSection.tsx

/* eslint-disable @next/next/no-img-element */
// @ts-nocheck

import styles
  from './RecommendationSection.module.css'

/* =========================================
🔥 Components
========================================= */

import RecommendedForYou
  from '../../components/RecommendedForYou'

/* =========================================
🔥 Types
========================================= */

type Props = {

  type: string
}

/* =========================================
🔥 Section
========================================= */

export default function
RecommendationSection({
  type,
}: Props) {

  return (

    <section
      className={
        styles.section
      }
    >

      {/* ==================================
      Header
      semantic continuation layer
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
          Recommended
        </div>

        <h2
          className={
            styles.title
          }
        >
          あなたに近いおすすめ構成
        </h2>

        <p
          className={
            styles.description
          }
        >
          現在のランキング結果をもとに、
          用途や価格帯が近いおすすめ構成を提案します。
        </p>

      </div>

      {/* ==================================
      Recommendation Renderer
      ================================== */}

      <RecommendedForYou
        type={type}
      />

    </section>

  )
}

