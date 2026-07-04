// ============================================================================
// FILE:
// /app/ranking/page.tsx
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
🔥 Runtime
============================================================================ */

import useRanking
    from './hooks/useRanking'

/* ============================================================================
🔥 Components
============================================================================ */

import Breadcrumb
    from './components/common/Breadcrumb'

import EmptyRanking
    from './components/common/EmptyRanking'

import RankingHero
    from './components/hero/RankingHero'

import FeaturedOverall
    from './components/featured/FeaturedOverall'

import RankingNavigation
    from './components/navigation/RankingNavigation'

import RankingGroupSection
    from './components/sections/RankingGroupSection'

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

        navigationRuntime,

        featuredRuntime,

        loading,

        error,

    } = useRanking()

    /* =========================================================================
    🔥 Active Group
    ========================================================================= */

    const [

        activeGroup,

        setActiveGroup,

    ] = useState('all')

    /* =========================================================================
    🔥 Navigation
    ========================================================================= */

    const items =

        navigationRuntime?.intents ?? []

    /* =========================================================================
    🔥 Active Items
    ========================================================================= */

    const filteredItems =

        activeGroup === 'all'

            ? items

            : items.filter(

                item =>

                    item.parent_group === activeGroup

            )

    /* =========================================================================
    🔥 Section Presentation
    ※ Temporary
    ※ Later supplied by Experience Dictionary
    ========================================================================= */

    const sectionTitle =

        activeGroup === 'all'

            ? 'すべてのランキング'

            : 'ランキング'

    const sectionDescription =

        activeGroup === 'all'

            ? '公開中のランキング一覧です。'

            : '選択したカテゴリのランキングです。'

    /* =========================================================================
    🔥 Loading
    ========================================================================= */

    if (loading) {

        return (

            <main className={styles.ranking}>

                Loading...

            </main>

        )

    }

    /* =========================================================================
    🔥 Error
    ========================================================================= */

    if (

        error ||

        !navigationRuntime ||

        !featuredRuntime

    ) {

        return (

            <main className={styles.ranking}>

                Ranking Runtime Error

            </main>

        )

    }

    /* =========================================================================
    🔥 Render
    ========================================================================= */

    return (

        <main className={styles.ranking}>

            <Breadcrumb />

            <RankingHero

                runtime={navigationRuntime}

            />

            <FeaturedOverall

                runtime={featuredRuntime}

            />

            <RankingNavigation

                items={items}

                activeGroup={activeGroup}

                onSelect={setActiveGroup}

            />

            {

                filteredItems.length > 0

                    ? (

                        <RankingGroupSection

                            title={sectionTitle}

                            description={sectionDescription}

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