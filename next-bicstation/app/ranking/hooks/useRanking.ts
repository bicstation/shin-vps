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
🔥 Runtime
============================================================================ */

import {

    fetchNavigationRuntime,

} from '@/shared/lib/api/django/pc/navigation'

/* ============================================================================
🔥 Types
============================================================================ */

import type {

    RankingRuntime,

} from '../types/ranking'

/* ============================================================================
🔥 Hook
============================================================================ */

export default function useRanking() {

    /* =========================================================================
    🔥 State
    ========================================================================= */

    const [

        runtime,

        setRuntime,

    ] = useState<RankingRuntime | null>(

        null

    )

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

            setLoading(true)

            setError(null)

            try {

                const data =

                    await fetchNavigationRuntime()

                console.log(

                    '🔥 RANKING RUNTIME',

                    data

                )

                setRuntime(

                    data

                )

            }

            catch (err) {

                console.error(

                    'RANKING RUNTIME ERROR',

                    err

                )

                setError(

                    err as Error

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

        runtime,

        loading,

        error,

    }

}