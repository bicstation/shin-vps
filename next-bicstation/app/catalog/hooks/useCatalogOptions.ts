// /home/maya/shin-dev/shin-vps/next-bicstation/app/catalog/hooks/useCatalogOptions.ts

// ============================================================================
// FILE:
// /app/catalog/hooks/useCatalogOptions.ts
// ============================================================================

'use client'

import { useEffect, useState } from 'react'

import { fetchCatalogOptions } from '@/shared/lib/api/django/pc/options'
import type { CatalogOptionsRuntimeContract } from '@/shared/lib/api/django/pc/options/contracts'

export default function useCatalogOptions() {

    const [runtime, setRuntime] =
        useState<CatalogOptionsRuntimeContract | null>(null)

    const [loading, setLoading] =
        useState(true)

    const [error, setError] =
        useState<Error | null>(null)

    useEffect(() => {

        let mounted = true

        async function loadRuntime() {

            setLoading(true)
            setError(null)

            try {

                const runtime =
                    await fetchCatalogOptions()

                if (mounted) {
                    setRuntime(runtime)
                }

            } catch (err) {

                console.error(
                    'CATALOG OPTIONS RUNTIME ERROR',
                    err,
                )

                if (mounted) {
                    setError(err as Error)
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

    }, [])

    return {
        runtime,
        loading,
        error,
    }

}