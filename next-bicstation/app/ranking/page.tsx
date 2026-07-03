// ============================================================================
// FILE:
// /app/ranking/page.tsx
// Copyright (c) 2024 Shin Corporation.
// All rights reserved.
// ============================================================================

'use client'

import {

    useMemo,
    useState,

} from 'react'

/* ============================================================================
🔥 Hook
============================================================================ */

import useRanking
    from './hooks/useRanking'

/* ============================================================================
🔥 Components
============================================================================ */

import Breadcrumb
    from './components/Breadcrumb'

import RankingHero
    from './components/hero/RankingHero'

import FeaturedOverallBanner
    from './components/featured/FeaturedOverallBanner'

// import RankingTabs
//     from './components/RankingTabs'

import RankingNavigation
    from './components/navigation/RankingNavigation'

import RankingGroupSection
    from './components/sections/RankingGroupSection'

import RankingSummary
    from './components/RankingSummary'

import RankingCardGrid
    from './components/RankingCardGrid'

import EmptyRanking
    from './components/EmptyRanking'

/* ============================================================================
🔥 Styles
============================================================================ */

import styles
    from './styles/ranking.module.css'

/* ============================================================================
🔥 Ranking Experience
============================================================================ */

export default function RankingPage() {

    /* =========================================================================
    🔥 Runtime
    ========================================================================= */

    const {

        runtime,

        loading,

        error,

    } = useRanking()

    /* =========================================================================
    🔥 Active Group
    ========================================================================= */

    const [

        activeType,

        setActiveType,

    ] = useState('all')

    /* =========================================================================
    🔥 Runtime
    ========================================================================= */

    const items =

        runtime?.intents ?? []

    /* =========================================================================
    🔥 Filter
    ========================================================================= */

    const filteredItems =

        useMemo(() => {

            if (

                activeType === 'all'

            ) {

                return items

            }

            return items.filter(

                item =>

                    item.type === activeType

            )

        }, [

            items,

            activeType,

        ])

    /* =========================================================================
    🔥 Loading
    ========================================================================= */

    if (

        loading

    ) {

        return (

            <main
                className={styles.ranking}
            >

                Loading...

            </main>

        )

    }

    /* =========================================================================
    🔥 Error
    ========================================================================= */

    if (

        error ||

        !runtime

    ) {

        return (

            <main
                className={styles.ranking}
            >

                Ranking Runtime Error

            </main>

        )

    }

    /* =========================================================================
    🔥 Runtime
    ========================================================================= */

    const hasItems =

        filteredItems.length > 0

    /* =========================================================================
    🔥 Render
    ========================================================================= */

    return (

        <main
            className={styles.ranking}
        >

            {/* ==========================================================
            Breadcrumb
            ========================================================== */}

            <Breadcrumb />

            {/* ==========================================================
            Hero
            Ranking Experience Portal
            ========================================================== */}

            <RankingHero

                runtime={runtime}

            />

            {/* ==========================================================
            Featured Overall Ranking
            Canonical Slug : all
            ========================================================== */}

            <FeaturedOverallBanner

                runtime={runtime}

            />

            {/* ==========================================================
            Semantic Group Navigation
            Backend parent_group
            ========================================================== */}

            <RankingNavigation

                items={items}

                activeGroup={activeType}

                onSelect={setActiveType}

            />

            {/* ==========================================================
            Summary
            ========================================================== */}

            <RankingSummary

                items={filteredItems}

            />

            {/* ==========================================================
            Ranking Cards
            group_slug
            ========================================================== */}

            {

                hasItems

                    ? (

                        <RankingCardGrid

                            items={filteredItems}

                        />

                    )

                    : (

                        <EmptyRanking />

                    )

            }

        </main>

    )

}