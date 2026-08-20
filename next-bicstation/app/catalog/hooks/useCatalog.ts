// ============================================================================
// FILE:
// /app/catalog/hooks/useCatalog.ts
// ============================================================================

'use client'

import {
    useEffect,
    useState,
} from 'react'

import {
    fetchProducts,
    type ProductFilters,
} from '@/shared/lib/api/django/pc/products'

import type {
    ProductsRuntime,
} from '@/shared/lib/api/django/pc/products/contracts'


/* ============================================================================
🔥 Catalog Runtime Hook
============================================================================ */

export default function useCatalog(

    page: number,

    pageSize = 20,

    filters: ProductFilters = {},

) {

    /* ==========================================================================
    Runtime State
    ========================================================================== */

    const [runtime, setRuntime] =
        useState<ProductsRuntime | null>(
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
    Runtime Fetch
    ========================================================================== */

    useEffect(() => {

        let mounted = true


        async function loadRuntime() {

            setLoading(true)

            setError(null)


            try {

                const runtime =
                    await fetchProducts(

                        page,

                        pageSize,

                        filters,

                    )


                if (mounted) {

                    setRuntime(
                        runtime
                    )

                }

            } catch (err) {

                console.error(
                    'CATALOG RUNTIME ERROR',
                    err,
                )


                if (mounted) {

                    setError(
                        err as Error,
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


    }, [

        page,

        pageSize,

        filters.sort,

        filters.maker,

        filters.brand,

        filters.series,

        filters.cpu,

        filters.gpu,

        filters.memory,

        filters.storage,

    ])


    /* ==========================================================================
    Return
    ========================================================================== */

    return {

        runtime,

        loading,

        error,

    }

}