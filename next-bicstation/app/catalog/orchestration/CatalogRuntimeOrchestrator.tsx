// ============================================================================
// FILE:
// /app/catalog/orchestration/CatalogRuntimeOrchestrator.tsx
// Copyright (c) 2024 Shin Corporation.
// All rights reserved.
// ============================================================================

'use client'

/* ============================================================================
🔥 Next
============================================================================ */

import {

    useSearchParams,

} from 'next/navigation'

/* ============================================================================
🔥 Hook
============================================================================ */

import useCatalog
    from '../hooks/useCatalog'

/* ============================================================================
🔥 Components
============================================================================ */

import Breadcrumb
    from '../components/Breadcrumb'

import CatalogHero
    from '../components/CatalogHero'

// import CatalogSummary
//     from '../components/CatalogSummary'

import ProductGrid
    from '../components/ProductGrid'

import Pagination
    from '../components/Pagination'

import EmptyProducts
    from '../components/EmptyProducts'

/* ============================================================================
🔥 Styles
============================================================================ */

import styles
    from '../styles/catalog.module.css'

/* ============================================================================
🔥 Catalog Runtime Orchestrator
============================================================================ */

export default function CatalogRuntimeOrchestrator() {

    /* ==========================================================================
    🔥 URL State
    ========================================================================== */

    const searchParams =
        useSearchParams()

    const page = Number(

        searchParams.get('page')

        ?? 1

    )

    const pageSize = 20

    /* ==========================================================================
    🔥 Runtime
    ========================================================================== */

    const {

        runtime,

        loading,

        error,

    } = useCatalog(

        page,

        pageSize,

    )

    /* ==========================================================================
    🔥 Loading
    ========================================================================== */

    if (

        loading

    ) {

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
    🔥 Error
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
    🔥 Products
    ========================================================================== */

    const hasProducts =

        runtime.products.length > 0

    /* ==========================================================================
    🔥 Render
    ========================================================================== */

    return (

        <main
            className={
                styles.catalog
            }
        >

            {/* ==========================================================
            Breadcrumb
            ========================================================== */}

            <Breadcrumb />

            {/* ==========================================================
            Hero
            ========================================================== */}

            <CatalogHero

                runtime={
                    runtime
                }

            />

            {/* ==========================================================
            Summary
            ========================================================== */}

            {/*
            <CatalogSummary

                count={
                    runtime.count
                }

                page={
                    runtime.page
                }

                page_size={
                    runtime.page_size
                }

            />
            */}

            {/* ==========================================================
            Products
            ========================================================== */}

            {

                hasProducts

                    ? (

                        <ProductGrid

                            products={
                                runtime.products
                            }

                        />

                    )

                    : (

                        <EmptyProducts />

                    )

            }

            {/* ==========================================================
            Pagination
            ========================================================== */}

            <Pagination

                page={
                    runtime.page
                }

                page_size={
                    runtime.page_size
                }

                has_next={
                    runtime.has_next
                }

            />

        </main>

    )

}