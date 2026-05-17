// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/[slug]/components/RankingRuntime.tsx
// ============================================================================

'use client'

import styles from '../RankingSlugPage.module.css'

import {
  RuntimeHero,
  RuntimeBreadcrumbs,
  SemanticFlagshipCard,
  DiscoveryCardGrid,
  ExplorationList,
  RuntimeFAQ,
} from './'

type Props = {
  runtime: any
}

/* ============================================================================
🔥 Ranking Runtime
============================================================================ */

export default function RankingRuntime({
  runtime,
}: Props) {

  /* ==========================================================================
  🔥 Runtime
  ========================================================================== */

  const products =
    runtime?.products || []

  const breadcrumbs =
    runtime?.breadcrumbs || []

  const faq =
    runtime?.faq || []

  const seo =
    runtime?.seo || {}

  /* ==========================================================================
  🔥 Semantic Hierarchy
  ========================================================================== */

  const flagship =
    products?.[0]

  const discoveryProducts =
    products.slice(1, 4)

  const explorationProducts =
    products.slice(4)

  /* ==========================================================================
  🔥 Render
  ========================================================================== */

  return (

    <div className={styles.runtimePage}>

      {/* ================================================================
      HERO
      ================================================================ */}

      <RuntimeHero
        seo={seo}
      />

      {/* ================================================================
      BREADCRUMBS
      ================================================================ */}

      <RuntimeBreadcrumbs
        breadcrumbs={
          breadcrumbs
        }
      />

      {/* ================================================================
      FLAGSHIP
      ================================================================ */}

      {flagship && (

        <SemanticFlagshipCard
          product={flagship}
          rank={1}
        />

      )}

      {/* ================================================================
      DISCOVERY GRID
      ================================================================ */}

      <DiscoveryCardGrid
        products={
          discoveryProducts
        }
      />

      {/* ================================================================
      EXPLORATION LIST
      ================================================================ */}

      <ExplorationList
        products={
          explorationProducts
        }
        startRank={5}
      />

      {/* ================================================================
      FAQ
      ================================================================ */}

      <RuntimeFAQ
        faq={faq}
      />

    </div>

  )
}