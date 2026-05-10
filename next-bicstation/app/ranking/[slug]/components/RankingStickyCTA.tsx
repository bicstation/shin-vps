// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/[type]/components/RankingStickyCTA.tsx

/* eslint-disable @next/next/no-img-element */
// @ts-nocheck

import Link
  from 'next/link'

import styles
  from './RankingStickyCTA.module.css'

/* =========================================
🔥 Types
========================================= */

type Props = {

  primaryHref?: string

  primaryLabel?: string

  secondaryHref?: string

  secondaryLabel?: string
}

/* =========================================
🔥 Component
========================================= */

export default function
RankingStickyCTA({

  primaryHref =
    '/pc-finder',

  primaryLabel =
    'PC診断を試す',

  secondaryHref =
    '/ranking',

  secondaryLabel =
    'ランキング一覧',

}: Props) {

  return (

    <div
      className={
        styles.sticky
      }
    >

      {/* ==================================
      PRIMARY
      ================================== */}

      <Link
        href={primaryHref}

        className={
          styles.primary
        }
      >
        {primaryLabel}
      </Link>

      {/* ==================================
      SECONDARY
      ================================== */}

      <Link
        href={secondaryHref}

        className={
          styles.secondary
        }
      >
        {secondaryLabel}
      </Link>

    </div>

  )
}
