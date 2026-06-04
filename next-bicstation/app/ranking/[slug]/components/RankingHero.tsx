// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/[slug]/components/RankingHero.tsx

/* eslint-disable @next/next/no-img-element */
// @ts-nocheck

import HeroRankingCard
  from '@/shared/components/organisms/cards/HeroRankingCard'

import styles
  from './RankingHero.module.css'

/* =========================================
🔥 Types
========================================= */

type Props = {

  title: string

  description: string

  label?: string

  topProduct?: any
}

/* =========================================
🔥 Component
========================================= */

export default function
RankingHero({

  title,

  description,

  label =
    'SEMANTIC RANKING',

  topProduct,
}: Props) {

  return (

    <div
      className={
        styles.hero
      }
    >

      {/* ==================================
      LABEL
      ================================== */}

      <div
        className={
          styles.label
        }
      >
        {label}
      </div>

      {/* ==================================
      TITLE
      ================================== */}

      <h1
        className={
          styles.title
        }
      >
        {title}
      </h1>

      {/* ==================================
      DESCRIPTION
      ================================== */}

      <p
        className={
          styles.description
        }
      >
        {description}
      </p>

      {/* ==================================
      HERO CARD
      ================================== */}

      {!!topProduct && (

        <div
          className={
            styles.cardWrap
          }
        >

          <HeroRankingCard
            product={topProduct}
          />

        </div>

      )}

    </div>

  )
}