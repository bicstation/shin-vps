// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/[type]/sections/grid/GridSection.tsx

/* eslint-disable @next/next/no-img-element */
// @ts-nocheck

import styles
  from './GridSection.module.css'

/* =========================================
🔥 Components
========================================= */

import RankingGrid
  from '../../components/RankingGrid'

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
GridSection({
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
      semantic comparison layer
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
          Ranking Grid
        </div>

        <h2
          className={
            styles.title
          }
        >
          構成・性能・価格を比較
        </h2>

        <p
          className={
            styles.description
          }
        >
          GPU・CPU・メモリ・価格・用途を横断比較し、
          最適なPC構成を判断できます。
        </p>

      </div>

      {/* ==================================
      Grid Renderer
      ================================== */}

      <RankingGrid
        products={products}
      />

    </section>

  )
}

