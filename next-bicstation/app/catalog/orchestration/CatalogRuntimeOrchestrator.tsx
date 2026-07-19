// ============================================================================
// FILE:
// /app/catalog/orchestration/CatalogRuntimeOrchestrator.tsx
// ============================================================================

'use client'

import { useSearchParams } from 'next/navigation'

import useCatalog from '../hooks/useCatalog'
import useCatalogOptions from '../hooks/useCatalogOptions'

import Breadcrumb from '../components/Breadcrumb'
import CatalogHero from '../components/CatalogHero'
import CatalogToolbar from '../components/CatalogToolbar'
import ProductGrid from '../components/ProductGrid'
import Pagination from '../components/Pagination'
import EmptyProducts from '../components/EmptyProducts'

import styles from '../styles/catalog.module.css'

export default function CatalogRuntimeOrchestrator() {

    const searchParams = useSearchParams()

    const page =
        Number(searchParams.get('page') ?? 1)

    const pageSize = 20

    const sort =
        searchParams.get('sort') ?? 'maker'

    const maker =
        searchParams.get('maker') ?? undefined

    const cpu =
        searchParams.get('cpu') ?? undefined

    const gpu =
        searchParams.get('gpu') ?? undefined

    const memory =
        searchParams.get('memory') ?? undefined

    const storage =
        searchParams.get('storage') ?? undefined

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🎼 CATALOG ORCHESTRATOR START')
    console.log('🔍 Search Params')
    console.log({
        page,
        pageSize,
        sort,
        maker,
        cpu,
        gpu,
        memory,
        storage,
    })

    const {
        runtime,
        loading,
        error,
    } = useCatalog(
        page,
        pageSize,
        {
            sort,
            maker,
            cpu,
            gpu,
            memory,
            storage,
        },
    )

    console.log('📦 Products Runtime')
    console.log(runtime)

    console.log('📦 Products Data')
    console.log(runtime?.data)

    const {
        runtime: optionsRuntime,
        loading: optionsLoading,
        error: optionsError,
    } = useCatalogOptions()

    console.log('🧩 Options Loading')
    console.log(optionsLoading)

    console.log('🧩 Options Error')
    console.log(optionsError)

    console.log('🧩 Options Runtime')
    console.log(optionsRuntime)

    console.log('🧩 Options')
    console.log(optionsRuntime?.options)

    console.log('🧩 Maker')
    console.log(optionsRuntime?.options?.maker)

    console.log('🧩 CPU')
    console.log(optionsRuntime?.options?.cpu)

    console.log('🧩 GPU')
    console.log(optionsRuntime?.options?.gpu)

    console.log('🧩 Memory')
    console.log(optionsRuntime?.options?.memory)

    console.log('🧩 Storage')
    console.log(optionsRuntime?.options?.storage)

    console.log('🎯 Render Summary')
    console.log({
        loading,
        error,
        optionsLoading,
        optionsError,
        productCount:
            runtime?.data?.products?.length,
        totalCount:
            runtime?.data?.count,
        options:
            optionsRuntime?.options,
    })

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

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

            <CatalogHero
                runtime={runtime}
            />

            <CatalogToolbar
                count={count}
                sort={sort}
                options={optionsRuntime?.options}
            />

            {products.length > 0 ? (

                <ProductGrid
                    products={products}
                />

            ) : (

                <EmptyProducts />

            )}

            <Pagination
                page={currentPage}
                page_size={page_size}
                count={count}
                has_next={has_next}
            />

        </main>

    )

}