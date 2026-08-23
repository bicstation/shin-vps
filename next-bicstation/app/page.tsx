// ============================================================================
// FILE:
// /app/page.tsx
// Copyright (c) 2026 Shin Corporation.
// ============================================================================

import type {
    Metadata,
} from 'next'

/* ============================================================================
🔥 Publishing
============================================================================ */

import {
    createMetadata,
} from '@/shared/publishing'

import {
    toNextMetadata,
} from './publishing/next'

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
🔥 Metadata
============================================================================ */

export async function generateMetadata():

    Promise<Metadata> {

    return toNextMetadata(

        createMetadata({

            canonical:
                'https://bicstation.com',

        })

    )

}

/* ============================================================================
🔥 Home Page
============================================================================ */

export default async function Page() {

    /* ========================================================================
    🔥 Runtime Measurement Helper

    Purpose:
        Measure actual Runtime completion time.

    Important:
        - No Runtime behavior change
        - No sequential execution
        - Promise.all remains
        - Only observability is added
    ======================================================================== */

    async function measureRuntime<T>(

        name: string,

        runtimePromise: Promise<T>,

    ): Promise<T> {

        const startedAt =
            performance.now()

        console.log(
            `⏱️ TOP RUNTIME START: ${name}`
        )

        try {

            const result =
                await runtimePromise

            const elapsed =
                performance.now()
                -
                startedAt

            console.log(
                `⏱️ TOP RUNTIME COMPLETE: ${name} = ${elapsed.toFixed(0)}ms`
            )

            return result

        } catch (error) {

            const elapsed =
                performance.now()
                -
                startedAt

            console.error(
                `⏱️ TOP RUNTIME ERROR: ${name} = ${elapsed.toFixed(0)}ms`,
                error,
            )

            throw error

        }

    }


    /* ========================================================================
    🔥 Runtime Fetch
    ======================================================================== */

    console.log(
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
    )

    console.log(
        '🔥 TOP RUNTIME FETCH START'
    )

    const topRuntimeStartedAt =
        performance.now()


    const [

        sidebar,

        ranking,

        navigation,

        top,

    ] = await Promise.all([

        measureRuntime(
            'sidebar',
            fetchSidebar(),
        ),

        measureRuntime(
            'ranking',
            getRankingRuntime('all'),
        ),

        measureRuntime(
            'navigation',
            fetchNavigationRuntime(),
        ),

        measureRuntime(
            'top',
            fetchTopRuntime(),
        ),

    ])


    const topRuntimeElapsed =
        performance.now()
        -
        topRuntimeStartedAt


    console.log(
        `🔥 TOP RUNTIME FETCH COMPLETE = ${topRuntimeElapsed.toFixed(0)}ms`
    )

    console.log(
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
    )


    /* ========================================================================
    🔥 Runtime
    ======================================================================== */

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

        semantic_runtime:
            true,

        adaptive_runtime:
            true,

    }


    /* ========================================================================
    🔥 Navigation Observability
    ======================================================================== */

    console.log(

        '🔥 NAVIGATION',

        runtime.navigation,

    )


    /* ========================================================================
    🔥 Render
    ======================================================================== */

    return (

        <HomeRuntimeOrchestrator

            runtime={runtime}

        />

    )

}