/* eslint-disable @next/next/no-img-element */
// @ts-nocheck

import styles from './page.module.css'

/* =========================================
🔥 Existing API
========================================= */

import {
  fetchSidebarStats,
} from '@/shared/lib/api/django/pc/stats'

/* =========================================
🔥 Temporary Navigation Adapter
========================================= */

import {
  transformSidebarStats,
} from '@/shared/lib/navigation/transformSidebarStats'

/* =========================================
🔥 Components
========================================= */

import {
  RankingHero,
} from './components/RankingHero'

import {
  SemanticSection,
} from './components/SemanticSection'

import {
  FinderCTA,
} from './components/FinderCTA'

import {
  EmptyState,
} from './components/EmptyState'

/* =========================================
🔥 Dynamic
========================================= */

export const dynamic =
  'force-dynamic'

/* =========================================
🔥 PAGE
========================================= */

export default async function
RankingIndexPage() {

  // --------------------------------
  // Existing Sidebar API
  // --------------------------------

  const stats =
    await fetchSidebarStats()

  // --------------------------------
  // Temporary Semantic Adapter
  // --------------------------------

  const navigation =
    transformSidebarStats(
      stats
    )

  // --------------------------------
  // Empty
  // --------------------------------

  if (
    !navigation?.groups?.length
  ) {
    return <EmptyState />
  }

  return (

    <main
      className={
        styles.page
      }
    >

      <div
        className={
          styles.container
        }
      >

        {/* ================================= */}
        {/* HERO */}
        {/* ================================= */}

        <RankingHero />

        {/* ================================= */}
        {/* SEMANTIC GROUPS */}
        {/* ================================= */}

        {navigation.groups.map(
          group => (

            <SemanticSection
              key={group.key}
              group={group}
            />

          )
        )}

        {/* ================================= */}
        {/* FINDER CTA */}
        {/* ================================= */}

        <FinderCTA />

      </div>

    </main>
  )
}
