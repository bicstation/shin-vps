// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/[type]/sections/hero/HeroSection.tsx

/* eslint-disable @next/next/no-img-element */
// @ts-nocheck

import styles
  from './HeroSection.module.css'

/* =========================================
🔥 Components
========================================= */

import RankingHero
  from '../../components/RankingHero'

/* =========================================
🔥 Types
========================================= */

type Props = {

  type: string

  topProduct: any
}

/* =========================================
🔥 Section
========================================= */

export default function
HeroSection({
  type,
  topProduct,
}: Props) {

  // ======================================
  // Empty Guard
  // ======================================

  if (!topProduct) {
    return null
  }

  return (

    <section
      className={
        styles.section
      }
    >

      {/* ==================================
      Hero Renderer
      semantic entry layer
      ================================== */}

      <RankingHero
        type={type}
        topProduct={
          topProduct
        }
      />

    </section>

  )
}

