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


/* ============================================================================
🔥 Catalog Runtime Orchestrator
============================================================================ */

export default function CatalogRuntimeOrchestrator() {

    /* ==========================================================================
    Search Params
    ========================================================================== */

    const searchParams =
        useSearchParams()


    /* ==========================================================================
    Pagination
    ========================================================================== */

    const page =
        Number(
            searchParams.get('page') ?? 1
        )

    const pageSize =
        20


    /* ==========================================================================
    Sort
    ========================================================================== */

    const sort =
        searchParams.get('sort') ?? 'maker'


    /* ==========================================================================
    Identity Filters
    ========================================================================== */

    const maker =
        searchParams.get('maker') ?? undefined

    const brand =
        searchParams.get('brand') ?? undefined

    const series =
        searchParams.get('series') ?? undefined


    /* ==========================================================================
    Specification Filters
    ========================================================================== */

    const cpu =
        searchParams.get('cpu') ?? undefined

    const gpu =
        searchParams.get('gpu') ?? undefined

    const memory =
        searchParams.get('memory') ?? undefined

    const storage =
        searchParams.get('storage') ?? undefined


    /* ==========================================================================
    🔥 Catalog Filters
    ========================================================================== */

    const filters = {

        maker,

        brand,

        series,

        cpu,

        gpu,

        memory,

        storage,

    }


    /* ==========================================================================
    Debug — Search Params
    ========================================================================== */

    console.log(
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
    )

    console.log(
        '🎼 CATALOG ORCHESTRATOR START'
    )

    console.log(
        '🔍 Search Params'
    )

    console.log({

        page,

        pageSize,

        sort,

        maker,

        brand,

        series,

        cpu,

        gpu,

        memory,

        storage,

    })


    /* ==========================================================================
    Products Runtime
    ========================================================================== */

    const {

        runtime,

        loading,

        error,

    } =
        useCatalog(

            page,

            pageSize,

            {

                sort,

                ...filters,

            },

        )


    /* ==========================================================================
    Products Debug
    ========================================================================== */

    console.log(
        '📦 Products Runtime'
    )

    console.log(
        runtime
    )

    console.log(
        '📦 Products Data'
    )

    console.log(
        runtime?.data
    )


    /* ==========================================================================
    Catalog Options Runtime
    ========================================================================== */

    const {

        runtime:
            optionsRuntime,

        loading:
            optionsLoading,

        error:
            optionsError,

    } =
        useCatalogOptions(

            filters

        )


    /* ==========================================================================
    Options Debug
    ========================================================================== */

    console.log(
        '🧩 Options Loading'
    )

    console.log(
        optionsLoading
    )

    console.log(
        '🧩 Options Error'
    )

    console.log(
        optionsError
    )

    console.log(
        '🧩 Options Runtime'
    )

    console.log(
        optionsRuntime
    )

    console.log(
        '🧩 Options'
    )

    console.log(
        optionsRuntime?.options
    )


    /* ==========================================================================
    Options — Identity
    ========================================================================== */

    console.log(
        '🧩 Maker'
    )

    console.log(
        optionsRuntime?.options?.maker
    )

    console.log(
        '🧩 Brand'
    )

    console.log(
        optionsRuntime?.options?.brand
    )

    console.log(
        '🧩 Series'
    )

    console.log(
        optionsRuntime?.options?.series
    )


    /* ==========================================================================
    Options — Specifications
    ========================================================================== */

    console.log(
        '🧩 CPU'
    )

    console.log(
        optionsRuntime?.options?.cpu
    )

    console.log(
        '🧩 GPU'
    )

    console.log(
        optionsRuntime?.options?.gpu
    )

    console.log(
        '🧩 Memory'
    )

    console.log(
        optionsRuntime?.options?.memory
    )

    console.log(
        '🧩 Storage'
    )

    console.log(
        optionsRuntime?.options?.storage
    )


    /* ==========================================================================
    Render Summary
    ========================================================================== */

    console.log(
        '🎯 Render Summary'
    )

    console.log({

        loading,

        error,

        optionsLoading,

        optionsError,

        productCount:
            runtime?.data?.products?.length,

        totalCount:
            runtime?.data?.count,

        filters,

        options:
            optionsRuntime?.options,

    })


    console.log(
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
    )


    /* ==========================================================================
    Loading
    ========================================================================== */

    if (loading) {

        return (

            <main
                className={
                    styles.catalog
                }
            >

                Loading...

            </main>

        )

    }


    /* ==========================================================================
    Runtime Error
    ========================================================================== */

    if (
        error ||
        !runtime
    ) {

        return (

            <main
                className={
                    styles.catalog
                }
            >

                Runtime Error

            </main>

        )

    }


    /* ==========================================================================
    Runtime Data
    ========================================================================== */

    const {

        count,

        products,

        page:
            currentPage,

        page_size,

        has_next,

    } =
        runtime.data


    /* ==========================================================================
    Render
    ========================================================================== */

    return (

        <main
            className={
                styles.catalog
            }
        >

            {/* ==================================================================
            Breadcrumb
            ================================================================== */}

            <Breadcrumb />


            {/* ==================================================================
            Hero
            ================================================================== */}

            <CatalogHero

                runtime={
                    runtime
                }

                filters={
                    filters
                }

                options={
                    optionsRuntime?.options
                }

            />


            {/* ==================================================================
            Toolbar
            ================================================================== */}

            <CatalogToolbar

                count={
                    count
                }

                sort={
                    sort
                }

                options={
                    optionsRuntime?.options
                }

            />


            {/* ==================================================================
            Products
            ================================================================== */}

            {
                products.length > 0

                    ? (

                        <ProductGrid

                            products={
                                products
                            }

                        />

                    )

                    : (

                        <EmptyProducts />

                    )
            }


            {/* ==================================================================
            Pagination
            ================================================================== */}

            <Pagination

                page={
                    currentPage
                }

                page_size={
                    page_size
                }

                count={
                    count
                }

                has_next={
                    has_next
                }

            />

        </main>

    )

}