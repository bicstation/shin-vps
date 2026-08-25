// ============================================================================
// FILE:
// /app/ranking/orchestration/RankingRuntimeOrchestrator.tsx
// Copyright (c) 2026 Shin Corporation.
// All rights reserved.
// ============================================================================

'use client'

/* ============================================================================
🔥 React
============================================================================ */

import {
  useState,
} from 'react'

/* ============================================================================
🔥 Components
============================================================================ */

import Breadcrumb
  from '../components/common/Breadcrumb'

import EmptyRanking
  from '../components/common/EmptyRanking'

import RankingHero
  from '../components/hero/RankingHero'

import FeaturedOverall
  from '../components/featured/FeaturedOverall'

import RankingNavigation
  from '../components/navigation/RankingNavigation'

import RankingGroupSection
  from '../components/sections/RankingGroupSection'

/* ============================================================================
🔥 Styles
============================================================================ */

import styles
  from '../styles/ranking.module.css'

/* ============================================================================
🔥 Props
============================================================================ */

interface RankingRuntimeOrchestratorProps {

  runtime: {

    rankingRuntime: any

    rankingCategories: any[]

    semantic_runtime: boolean

    adaptive_runtime: boolean

  }

}

/* ============================================================================
🔥 Ranking Runtime Orchestrator
============================================================================ */

export default function RankingRuntimeOrchestrator({

  runtime,

}: RankingRuntimeOrchestratorProps) {

  /* --------------------------------------------------------------------------
  Runtime
  -------------------------------------------------------------------------- */

  const {

    rankingRuntime,

    rankingCategories,

  } = runtime

  /* --------------------------------------------------------------------------
  Active Group
  -------------------------------------------------------------------------- */

  const [

    activeGroup,

    setActiveGroup,

  ] = useState('all')

  /* --------------------------------------------------------------------------
  Ranking Categories
  -------------------------------------------------------------------------- */

  const categories =

    rankingCategories ?? []

  /* --------------------------------------------------------------------------
  Active Categories
  -------------------------------------------------------------------------- */

  const filteredCategories =

    activeGroup === 'all'

      ? categories

      : categories.filter(

        (category: any) =>

          category.parentGroup === activeGroup,

      )

  /* --------------------------------------------------------------------------
  Runtime Error
  -------------------------------------------------------------------------- */

  if (!rankingRuntime) {

    return (

      <main className={styles.ranking}>

        Ranking Runtime Error

      </main>

    )

  }

  /* --------------------------------------------------------------------------
  Render
  -------------------------------------------------------------------------- */

  return (

    <main className={styles.ranking}>

      <Breadcrumb />

      <RankingHero />

      <FeaturedOverall

        runtime={rankingRuntime.runtime}

      />

      <RankingNavigation

        categories={categories}

        activeGroup={activeGroup}

        onSelect={setActiveGroup}

      />

      {/* ======================================================================
      Ranking Category Sections
      ====================================================================== */}

      {

        filteredCategories.length > 0

          ? (

            filteredCategories.map(

              (category: any) => (

                <RankingGroupSection

                  key={category.parentGroup}

                  category={category}

                  icon="✨"

                  actionLabel="すべて見る"

                />

              )

            )

          )

          : (

            <EmptyRanking />

          )

      }

    </main>

  )

}