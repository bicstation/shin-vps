// ============================================================================
// FILE:
// /app/catalog/orchestration/CatalogRuntimeOrchestrator.tsx
// ============================================================================

'use client'

import { useSearchParams } from 'next/navigation'

import useCatalog from '../hooks/useCatalog'

import Breadcrumb from '../components/Breadcrumb'
import CatalogHero from '../components/CatalogHero'
import ProductGrid from '../components/ProductGrid'
import Pagination from '../components/Pagination'
import EmptyProducts from '../components/EmptyProducts'

import styles from '../styles/catalog.module.css'

export default function CatalogRuntimeOrchestrator() {

    const searchParams = useSearchParams()

    const page = Number(searchParams.get('page') ?? 1)

    console.log('🔥 SEARCH PARAMS', {
        url: window.location.href,
        pageFromSearchParams: page,
    })

    const pageSize = 20

    const {
        runtime,
        loading,
        error,
    } = useCatalog(
        page,
        pageSize,
    )

    if (loading) {
        return (
            <main className={styles.catalog}>
                Loading...
            </main>
        )
    }

    if (error || !runtime) {
        return (
            <main className={styles.catalog}>
                Runtime Error
            </main>
        )
    }

    const {
        count,
        products,
        page: currentPage,
        page_size,
        has_next,
    } = runtime.data

    return (

        <main className={styles.catalog}>

            <Breadcrumb />

            <CatalogHero runtime={runtime} />

            {
                products.length > 0
                    ? (
                        <ProductGrid
                            products={products}
                        />
                    )
                    : (
                        <EmptyProducts />
                    )
            }

            <Pagination
                page={currentPage}
                page_size={page_size}
                count={count}
                has_next={has_next}
            />

        </main>

    )

}