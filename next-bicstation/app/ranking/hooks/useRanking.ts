// ============================================================================
// FILE:
// /app/ranking/hooks/useRanking.ts
// Copyright (c) 2024 Shin Corporation.
// All rights reserved.
// ============================================================================

'use client'

/* ============================================================================
🔥 React
============================================================================ */

import {

    useEffect,
    useState,

} from 'react'

/* ============================================================================
🔥 Navigation Runtime
============================================================================ */

import {

    fetchNavigationRuntime,

} from '@/shared/lib/api/django/pc/navigation'

import type {

    NavigationRuntime,

} from '@/shared/lib/api/django/pc/navigation/contracts'

/* ============================================================================
🔥 Ranking Runtime Facade (V2)
============================================================================ */

import {

    getRankingRuntime,

} from '@/shared/lib/api/django/pc/ranking'

import type {

    RankingRuntimeResult,

} from '@/shared/lib/api/django/pc/ranking/runtime'

/* ============================================================================
🔥 Hook
============================================================================ */

export default function useRanking() {

    /* =========================================================================
    🔥 Runtime
    ========================================================================= */

    const [

        navigationRuntime,

        setNavigationRuntime,

    ] = useState<NavigationRuntime | null>(

        null

    )

    const [

        rankingRuntime,

        setRankingRuntime,

    ] = useState<RankingRuntimeResult | null>(

        null

    )

    /* =========================================================================
    🔥 State
    ========================================================================= */

    const [

        loading,

        setLoading,

    ] = useState(true)

    const [

        error,

        setError,

    ] = useState<Error | null>(

        null

    )

    /* =========================================================================
    🔥 Load Runtime
    ========================================================================= */

    useEffect(() => {

        async function loadRuntime() {

            try {

                const [

                    navigation,

                    ranking,

                ] = await Promise.all([

                    fetchNavigationRuntime(),

                    getRankingRuntime('all'),

                ])

                setNavigationRuntime(

                    navigation

                )

                setRankingRuntime(

                    ranking

                )

            }

            catch (

                error

            ) {

                console.error(

                    'Ranking Runtime Error',

                    error

                )

                setError(

                    error as Error

                )

            }

            finally {

                setLoading(false)

            }

        }

        loadRuntime()

    }, [])

    /* =========================================================================
    🔥 Debug Navigation Runtime
    ========================================================================= */

    useEffect(() => {

        if (!navigationRuntime) {

            console.log(
                '🔥 Navigation Runtime: null'
            )

            return

        }

        console.log(
            '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
        )

        console.log(
            '🔥 NAVIGATION RUNTIME DEBUG'
        )

        console.log(
            'Intent Count:',
            navigationRuntime.intents.length
        )

        console.table(

            navigationRuntime.intents.map(

                item => ({

                    slug: item.slug,

                    type: item.type,

                    parent_group: item.parent_group,

                    product_count: item.product_count,

                    sort_order: item.sort_order,

                })

            )

        )

        console.log(
            '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
        )

    }, [

        navigationRuntime,

    ])

        /* =========================================================================
        🔥 Debug Ranking Runtime
        ========================================================================= */

        useEffect(() => {

            if (!rankingRuntime) {

                console.log(
                    '🔥 Ranking Runtime: null'
                )

                return

            }

            console.log(
                '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
            )

            console.log(
                '🔥 RANKING RUNTIME DEBUG'
            )

            console.log(
                rankingRuntime
            )

            /* --------------------------------------------------------------------
            Projection Categories
            -------------------------------------------------------------------- */

            console.log(
                '🔥 PROJECTION CATEGORY COUNT:',
                rankingRuntime.projection.categories.length
            )

            console.table(

                rankingRuntime.projection.categories.map(

                    category => ({

                        parentGroup:
                            category.parentGroup,

                        presentationName:
                            category.presentationName,

                        groupCount:
                            category.groupCount,

                        groups:
                            category.groups.length,

                    })

                )

            )

            /* --------------------------------------------------------------------
            Projection Products
            -------------------------------------------------------------------- */

            console.log(
                '🔥 PROJECTION PRODUCT COUNT:',
                rankingRuntime.projection.products.length
            )

            console.table(

                rankingRuntime.projection.products

                    .slice(0, 10)

                    .map(

                        product => ({

                            id:
                                product.id,

                            name:
                                product.name,

                            maker:
                                product.maker,

                            score:
                                product.score,

                            emphasis:
                                product.ui_state.emphasis,

                            variant:
                                product.ui_state.variant,

                        })

                    )

            )

            console.log(
                '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
            )

        }, [

            rankingRuntime,

        ])

    /* =========================================================================
    🔥 Return
    ========================================================================= */

    return {

        navigationRuntime,

        rankingRuntime,

        /* ---------------------------------------------------------------------
        V2 Projection
        --------------------------------------------------------------------- */

        rankingCategories:

            rankingRuntime?.projection.categories ?? [],

        loading,

        error,

    }


}