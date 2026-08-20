// ============================================================================
// FILE:
// /app/catalog/hooks/useCatalogOptions.ts
// ============================================================================

'use client'

import {
    useEffect,
    useState,
} from 'react'

import {
    fetchCatalogOptions,
} from '@/shared/lib/api/django/pc/options'

import type {
    CatalogOptionsFilters,
} from '@/shared/lib/api/django/pc/options'

import type {
    CatalogOptionsRuntimeContract,
} from '@/shared/lib/api/django/pc/options/contracts'


/* ============================================================================
🔥 Hook Props
============================================================================ */

export default function useCatalogOptions(

    filters: CatalogOptionsFilters = {},

) {

    /* ==========================================================================
    Runtime State
    ========================================================================== */

    const [runtime, setRuntime] =
        useState<CatalogOptionsRuntimeContract | null>(
            null
        )


    /* ==========================================================================
    Loading State
    ========================================================================== */

    const [loading, setLoading] =
        useState(true)


    /* ==========================================================================
    Error State
    ========================================================================== */

    const [error, setError] =
        useState<Error | null>(
            null
        )


    /* ==========================================================================
    Filter Dependency
    ========================================================================== */

    const filterKey =
        JSON.stringify(
            filters
        )


    /* ==========================================================================
    Runtime Fetch
    ========================================================================== */

    useEffect(() => {

        let mounted = true


        async function loadRuntime() {

            setLoading(true)

            setError(null)


            try {

                const runtime =
                    await fetchCatalogOptions(
                        filters
                    )


                if (mounted) {

                    setRuntime(
                        runtime
                    )

                }

            } catch (err) {

                console.error(
                    'CATALOG OPTIONS RUNTIME ERROR',
                    err,
                )


                if (mounted) {

                    setError(
                        err as Error
                    )

                }

            } finally {

                if (mounted) {

                    setLoading(false)

                }

            }

        }


        loadRuntime()


        return () => {

            mounted = false

        }

    }, [filterKey])


    /* ==========================================================================
    Return
    ========================================================================== */

    return {

        runtime,

        loading,

        error,

    }

}