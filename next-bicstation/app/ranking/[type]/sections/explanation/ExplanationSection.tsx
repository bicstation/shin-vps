// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/[type]/sections/explanation/ExplanationSection.tsx

/* eslint-disable @next/next/no-img-element */
// @ts-nocheck

import styles
  from './ExplanationSection.module.css'

/* =========================================
🔥 Components
========================================= */

import RankingExplanation
  from '../../components/RankingExplanation'

/* =========================================
🔥 Types
========================================= */

type Props = {

  products: any[]
}

/* =========================================
🔥 Section
========================================= */

export default function
ExplanationSection({
  products,
}: Props) {

  // ======================================
  // Empty Guard
  // ======================================

  if (
    !products?.length
  ) {
    return null
  }

  return (

    <section
      className={
        styles.section
      }
    >

      {/* ==================================
      Header
      semantic understanding layer
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
          Ranking Logic
        </div>

        <h2
          className={
            styles.title
          }
        >
          なぜこの順位なのか
        </h2>

        <p
          className={
            styles.description
          }
        >
          用途・GPU・CPU・価格・将来性を含めた
          semantic comparison によって順位を構成しています。
        </p>

      </div>

      {/* ==================================
      Explanation Renderer
      ================================== */}

      <RankingExplanation
        products={products}
      />

    </section>

  )
}
