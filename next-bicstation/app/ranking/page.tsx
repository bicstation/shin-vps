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
    from './components/RankingHero'

import FeaturedRanking
    from './components/FeaturedRanking'

import RankingTabs
    from './components/RankingTabs'

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
    🔥 Active Tab
    ========================================================================= */

    const [

        activeType,

        setActiveType,

    ] = useState(

        'all'

    )

    /* =========================================================================
    🔥 Canonical Runtime
    ========================================================================= */

    const items =

        runtime?.intents ?? []

    /* =========================================================================
    🔥 Filtered Items
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
                className={
                    styles.ranking
                }
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
                className={
                    styles.ranking
                }
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
            className={
                styles.ranking
            }
        >

            {/* ==========================================================
            Breadcrumb
            ========================================================== */}

            <Breadcrumb />

            {/* ==========================================================
            Hero
            ========================================================== */}

            <RankingHero

                runtime={
                    runtime
                }

            />

            {/* ==========================================================
            Featured Ranking
            ========================================================== */}

            <FeaturedRanking

                items={
                    items
                }

            />

            {/* ==========================================================
            Ranking Tabs
            ========================================================== */}

            <RankingTabs

                items={
                    items
                }

                activeType={
                    activeType
                }

                onSelect={
                    setActiveType
                }

            />

            {/* ==========================================================
            Summary
            ========================================================== */}

            <RankingSummary

                items={
                    filteredItems
                }

            />

            {/* ==========================================================
            Ranking Grid
            ========================================================== */}

            {

                hasItems

                    ? (

                        <RankingCardGrid

                            items={
                                filteredItems
                            }

                        />

                    )

                    : (

                        <EmptyRanking />

                    )

            }

        </main>

    )

}

