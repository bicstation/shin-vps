// ============================================================================
// FILE:
// /app/catalog/hooks/useCatalog.ts
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

    fetchProducts,

} from '@/shared/lib/api/django/pc/products'

/* ============================================================================
🔥 Types
============================================================================ */

import type {

    CatalogRuntime,

} from '../types/catalog'

/* ============================================================================
🔥 Hook
============================================================================ */

export default function useCatalog(

    page: number,

    pageSize = 20,

) {

    /* ==========================================================================
    🔥 State
    ========================================================================== */

    const [

        runtime,

        setRuntime,

    ] = useState<CatalogRuntime | null>(

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

    /* ==========================================================================
    🔥 Load Runtime
    ========================================================================== */

    useEffect(() => {

        async function loadRuntime() {

            setLoading(true)

            setError(null)

            try {

                const data = await fetchProducts({

                    page,

                    pageSize,

                })

                console.log(

                    '🔥 FETCH RESULT',

                    data

                )

                setRuntime(

                    data

                )

            }

            catch (err) {

                console.error(

                    'CATALOG RUNTIME ERROR',

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

    }, [

        page,

        pageSize,

    ])

    /* ==========================================================================
    🔥 Return
    ========================================================================== */

    return {

        runtime,

        loading,

        error,

    }

}