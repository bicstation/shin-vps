// ============================================================================
// FILE:
// /app/catalog/hooks/useCatalog.ts
// ============================================================================

'use client'

import { useEffect, useState } from 'react'
import { fetchProducts } from '@/shared/lib/api/django/pc/products'
import type { ProductsRuntime } from '@/shared/lib/api/django/pc/products/contracts'

export default function useCatalog(
    page: number,
    pageSize = 20,
) {

    const [runtime, setRuntime] = useState<ProductsRuntime | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    useEffect(() => {

        let mounted = true

        async function loadRuntime() {

            setLoading(true)
            setError(null)

            try {

                const result = await fetchProducts(page, pageSize)

                if (mounted) {
                    setRuntime(result)
                }

            } catch (err) {

                console.error('CATALOG RUNTIME ERROR', err)

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

    }, [page, pageSize])

    return {
        runtime,
        loading,
        error,
    }

}