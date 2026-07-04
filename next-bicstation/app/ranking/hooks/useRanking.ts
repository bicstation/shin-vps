// ============================================================================
// FILE:
// /app/ranking/hooks/useRanking.ts
// Copyright (c) 2024 Shin Corporation.
// All rights reserved.
// ============================================================================

'use client'

/**
 * ============================================================================
 * SHIN CORE LINX
 * Ranking Experience Runtime Gateway
 * ============================================================================
 *
 * Responsibilities
 *
 * - Load Navigation Runtime
 * - Load Featured Overall Runtime
 *
 * This Hook SHALL NOT:
 *
 * - transform Runtime
 * - generate semantic meaning
 * - calculate rankings
 *
 * Backend remains the Semantic Authority.
 *
 * ============================================================================
 */

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
🔥 Ranking Runtime
============================================================================ */

import {

    fetchRanking,

} from '@/shared/lib/api/django/pc/ranking'

import type {

    SemanticRankingRuntime,

} from '@/shared/lib/api/django/pc/ranking/contracts'

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

        featuredRuntime,

        setFeaturedRuntime,

    ] = useState<SemanticRankingRuntime | null>(

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

                    navigationRuntime,

                    featuredRuntime,

                ] = await Promise.all([

                    fetchNavigationRuntime(),

                    fetchRanking('all'),

                ])

                setNavigationRuntime(

                    navigationRuntime

                )

                setFeaturedRuntime(

                    featuredRuntime

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
    🔥 Return
    ========================================================================= */

    return {

        navigationRuntime,

        featuredRuntime,

        loading,

        error,

    }

}