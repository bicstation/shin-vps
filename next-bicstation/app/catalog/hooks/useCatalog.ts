// ============================================================================
// FILE:
// /app/catalog/hooks/useCatalog.ts
// ============================================================================

'use client'

/* ============================================================================
React
============================================================================ */

import {

    useEffect,
    useState,

} from 'react'

/* ============================================================================
Runtime
============================================================================ */

import {

    fetchProducts,

} from '@/shared/lib/api/django/pc/products'

/* ============================================================================
Contracts
============================================================================ */

import type {

    ProductsRuntime,

} from '@/shared/lib/api/django/pc/products/contracts'

/* ============================================================================
Hook

Responsibilities

- Fetch Products Runtime
- Manage Experience State
- Expose Runtime to Experience

This hook does NOT

- Generate Semantic Meaning
- Generate Runtime
- Redefine Runtime Contracts

============================================================================ */

export default function useCatalog(

    page: number,

    pageSize = 20,

) {

    /* ========================================================================
    Runtime State
    ======================================================================== */

    const [

        runtime,

        setRuntime,

    ] = useState<ProductsRuntime | null>(

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

    /* ========================================================================
    Load Runtime
    ======================================================================== */

    useEffect(() => {

        async function loadRuntime() {

            setLoading(true)

            setError(null)

            try {

                const runtime = await fetchProducts({

                    page,

                    pageSize,

                })

                setRuntime(runtime)

            }

            catch (err) {

                console.error(

                    'CATALOG RUNTIME ERROR',

                    err,

                )

                setError(err as Error)

            }

            finally {

                setLoading(false)

            }

        }

        loadRuntime()

    }, [

        page,

        pageSize,

    ])

    /* ========================================================================
    Return
    ======================================================================== */

    return {

        runtime,

        loading,

        error,

    }

}