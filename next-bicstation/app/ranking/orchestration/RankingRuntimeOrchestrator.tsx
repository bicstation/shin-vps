// ============================================================================
// FILE:
// /app/ranking/orchestration/RankingRuntimeOrchestrator.tsx
// Copyright (c) 2024 Shin Corporation.
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

    navigationRuntime: any

    rankingRuntime: any

    rankingCategories: any[]

    semantic_runtime: boolean

    adaptive_runtime: boolean

  }

}

/* ============================================================================
🔥 Ranking Runtime Orchestrator
============================================================================ */

export default function RankingRuntimeOrchestrator(

  {

    runtime,

  }: RankingRuntimeOrchestratorProps,

) {

  /* --------------------------------------------------------------------------
  Runtime
  -------------------------------------------------------------------------- */

  const {

    navigationRuntime,

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
  Navigation
  -------------------------------------------------------------------------- */

  const items =

    navigationRuntime?.intents ?? []

  const categories =

    rankingCategories ?? []

  /* --------------------------------------------------------------------------
  Filter
  -------------------------------------------------------------------------- */

  const filteredItems =

    activeGroup === 'all'

      ? items

      : items.filter(

          (item: any) =>

            item.parent_group === activeGroup,

        )

  /* --------------------------------------------------------------------------
  Presentation
  -------------------------------------------------------------------------- */

  const sectionTitle =

    activeGroup === 'all'

      ? 'すべてのランキング'

      : 'ランキング'

  const sectionDescription =

    activeGroup === 'all'

      ? '公開中のランキング一覧です。'

      : '選択したカテゴリのランキングです。'

  /* --------------------------------------------------------------------------
  Runtime Error
  -------------------------------------------------------------------------- */

  if (

    !navigationRuntime ||

    !rankingRuntime

  ) {

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

      <RankingHero

        runtime={navigationRuntime}

      />

      <FeaturedOverall

        runtime={rankingRuntime.runtime}

      />

      <RankingNavigation

        items={items}

        categories={categories}

        activeGroup={activeGroup}

        onSelect={setActiveGroup}

      />

      {

        filteredItems.length > 0

          ? (

              <RankingGroupSection

                icon="🎮"

                title={sectionTitle}

                description={sectionDescription}

                items={filteredItems}

                actionLabel="ランキングを見る"

              />

            )

          : (

              <EmptyRanking />

            )

      }

    </main>

  )

}