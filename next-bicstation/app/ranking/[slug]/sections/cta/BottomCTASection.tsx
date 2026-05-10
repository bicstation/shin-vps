// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/[type]/sections/cta/BottomCTASection.tsx

/* eslint-disable @next/next/no-img-element */
// @ts-nocheck

import styles
  from './BottomCTASection.module.css'

/* =========================================
🔥 Components
========================================= */

import RankingBottomCTA
  from '../../components/RankingBottomCTA'

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
BottomCTASection({
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
      conversion continuation layer
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
          Final Recommendation
        </div>

        <h2
          className={
            styles.title
          }
        >
          最後に、
          あなたに最適な1台を選びましょう
        </h2>

        <p
          className={
            styles.description
          }
        >
          用途・性能・価格・将来性を比較し、
          後悔しないPC選びをサポートします。
        </p>

      </div>

      {/* ==================================
      CTA Renderer
      ================================== */}

      <RankingBottomCTA
        type={type}
      />

    </section>

  )
}
