// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/[type]/sections/compare/QuickCompareSection.tsx

/* eslint-disable @next/next/no-img-element */
// @ts-nocheck

import styles
  from './QuickCompareSection.module.css'

/* =========================================
🔥 Components
========================================= */

import RankingQuickCompare
  from '../../components/RankingQuickCompare'

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
QuickCompareSection({
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
      Section Header
      comparison cognition layer
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
          Quick Compare
        </div>

        <h2
          className={
            styles.title
          }
        >
          一瞬で違いを比較
        </h2>

        <p
          className={
            styles.description
          }
        >
          CPU・GPU・価格・用途を横断比較し、
          自分に最適な構成を素早く判断できます。
        </p>

      </div>

      {/* ==================================
      Compare Renderer
      ================================== */}

      <RankingQuickCompare
        products={products}
      />

    </section>

  )
}
