// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/[type]/sections/trust/TrustSection.tsx

/* eslint-disable @next/next/no-img-element */
// @ts-nocheck

import styles
  from './TrustSection.module.css'

/* =========================================
🔥 Components
========================================= */

import RankingTrustSection
  from '../../components/RankingTrustSection'

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
TrustSection({
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
      trust reassurance layer
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
          Trusted Ranking
        </div>

        <h2
          className={
            styles.title
          }
        >
          初心者でも安心して比較できます
        </h2>

        <p
          className={
            styles.description
          }
        >
          GPU・CPU・価格・将来性を含めた
          semantic comparison により、
          バランスの良いPC構成を比較できます。
        </p>

      </div>

      {/* ==================================
      Trust Renderer
      ================================== */}

      <RankingTrustSection
        type={type}
      />

    </section>

  )
}
