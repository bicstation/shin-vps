// ============================================================================
// FILE:
// /app/page.tsx
// ============================================================================

/* ============================================================================
🔥 Sidebar Runtime
============================================================================ */

import {

    fetchSidebar,

} from '@/shared/lib/api/django/pc/sidebar/sidebar'

/* ============================================================================
🔥 Ranking Runtime (V2)
============================================================================ */

import {

    getRankingRuntime,

} from '@/shared/lib/api/django/pc/ranking'

/* ============================================================================
🔥 Navigation Runtime
============================================================================ */

import {

    fetchNavigationRuntime,

} from '@/shared/lib/api/django/pc/navigation'

/* ============================================================================
🔥 Top Runtime
============================================================================ */

import {

    fetchTopRuntime,

} from '@/shared/lib/api/django/pc/top'

/* ============================================================================
🔥 Home Runtime
============================================================================ */

import HomeRuntimeOrchestrator
    from './home/orchestration/HomeRuntimeOrchestrator'

/* ============================================================================
🔥 Home Page
============================================================================ */

export default async function Page() {

    // ========================================================================
    // Runtime Fetch
    // ========================================================================

    const [

        sidebar,

        ranking,

        navigation,

        top,

    ] = await Promise.all([

        fetchSidebar(),

        getRankingRuntime('all'),

        fetchNavigationRuntime(),

        fetchTopRuntime(),

    ])

    // ========================================================================
    // Runtime
    // ========================================================================

    const runtime = {

        sidebar,

        ranking,

        navigation,

        top,

        heroRanking:

            Array.isArray(

                ranking?.projection?.products

            )

                ? ranking.projection.products[0]

                : null,

        semantic_runtime: true,

        adaptive_runtime: true,

    }

    console.log(

        '🔥 NAVIGATION',

        runtime.navigation

    )

    // ========================================================================
    // Render
    // ========================================================================

    return (

        <HomeRuntimeOrchestrator

            runtime={runtime}

        />

    )

}