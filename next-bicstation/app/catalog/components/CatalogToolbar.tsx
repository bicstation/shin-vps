// ============================================================================
// FILE:
// /app/catalog/components/CatalogToolbar.tsx
// ============================================================================

'use client'

import {
    usePathname,
    useRouter,
    useSearchParams,
} from 'next/navigation'

import type { ChangeEvent } from 'react'

import type {
    CatalogOptionsData,
} from '@/shared/lib/api/django/pc/options/contracts'

import CatalogFilter from './CatalogFilter'

import styles from '../styles/catalog.module.css'


/* ============================================================================
🔥 Props
============================================================================ */

type CatalogToolbarProps = {

    count:
        number

    sort:
        string

    options?:
        CatalogOptionsData

}


/* ============================================================================
🔥 Component
============================================================================ */

export default function CatalogToolbar({

    count,

    sort,

    options,

}: CatalogToolbarProps) {


    /* ========================================================================
    🔥 Debug
    ======================================================================== */

    console.log(
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
    )

    console.log(
        '📦 CATALOG TOOLBAR'
    )

    console.log(
        'options:',
        options
    )

    console.log(
        'Maker:',
        options?.maker
    )

    console.log(
        'Maker length:',
        options?.maker?.length
    )

    console.log(
        'Brand:',
        options?.brand
    )

    console.log(
        'Brand length:',
        options?.brand?.length
    )

    console.log(
        'Series:',
        options?.series
    )

    console.log(
        'Series length:',
        options?.series?.length
    )

    console.log(
        'CPU:',
        options?.cpu
    )

    console.log(
        'CPU length:',
        options?.cpu?.length
    )

    console.log(
        'GPU:',
        options?.gpu
    )

    console.log(
        'GPU length:',
        options?.gpu?.length
    )

    console.log(
        'Memory:',
        options?.memory
    )

    console.log(
        'Memory length:',
        options?.memory?.length
    )

    console.log(
        'Storage:',
        options?.storage
    )

    console.log(
        'Storage length:',
        options?.storage?.length
    )

    console.log(
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
    )


    /* ========================================================================
    🔥 Router
    ======================================================================== */

    const router =
        useRouter()

    const pathname =
        usePathname()

    const searchParams =
        useSearchParams()


    /* ========================================================================
    🔥 Sort
    ======================================================================== */

    function handleSortChange(

        event:
            ChangeEvent<HTMLSelectElement>,

    ) {

        const {
            value,
        } =
            event.target


        const params =
            new URLSearchParams(
                searchParams.toString(),
            )


        params.set(
            'sort',
            value,
        )


        params.set(
            'page',
            '1',
        )


        router.push(
            `${pathname}?${params.toString()}`
        )

    }


    /* ========================================================================
    🔥 Render
    ======================================================================== */

    return (

        <section
            className={
                styles.catalogHeader
            }
        >

            {/* ==================================================================
            HEADER
            ================================================================== */}

            <div
                className={
                    styles.catalogHeaderTop
                }
            >

                {/* ==============================================================
                STATUS
                ============================================================== */}

                <div
                    className={
                        styles.catalogStatus
                    }
                >

                    <span
                        className={
                            styles.catalogCount
                        }
                    >

                        {
                            count.toLocaleString()
                        }

                        {' '}

                        Products

                    </span>


                    <span
                        className={
                            styles.catalogCaption
                        }
                    >

                        Browse the complete catalog

                    </span>

                </div>


                {/* ==============================================================
                SORT
                ============================================================== */}

                <div
                    className={
                        styles.catalogCommands
                    }
                >

                    <label
                        htmlFor="catalog-sort"
                        className={
                            styles.catalogSortLabel
                        }
                    >

                        Sort

                    </label>


                    <select

                        id="catalog-sort"

                        className={
                            styles.catalogSort
                        }

                        value={
                            sort
                        }

                        onChange={
                            handleSortChange
                        }

                    >

                        <option
                            value="maker"
                        >

                            メーカー順

                        </option>


                        <option
                            value="price_low"
                        >

                            価格が安い順

                        </option>


                        <option
                            value="price_high"
                        >

                            価格が高い順

                        </option>


                        <option
                            value="new"
                        >

                            新着順

                        </option>

                    </select>

                </div>

            </div>


            {/* ==================================================================
            FILTERS
            ================================================================== */}

            <div
                className={
                    styles.catalogFilters
                }
            >

                {/* ==============================================================
                01 — PROVIDER
                ============================================================== */}

                <CatalogFilter

                    title="提供元"

                    queryKey="maker"

                    items={
                        options?.maker ?? []
                    }

                />


                {/* ==============================================================
                02 — BRAND
                ============================================================== */}

                <CatalogFilter

                    title="ブランド"

                    queryKey="brand"

                    items={
                        options?.brand ?? []
                    }

                />


                {/* ==============================================================
                03 — SERIES
                ============================================================== */}

                <CatalogFilter

                    title="シリーズ"

                    queryKey="series"

                    items={
                        options?.series ?? []
                    }

                />


                {/* ==============================================================
                04 — CPU
                ============================================================== */}

                <CatalogFilter

                    title="CPU"

                    queryKey="cpu"

                    items={
                        options?.cpu ?? []
                    }

                />


                {/* ==============================================================
                05 — GPU
                ============================================================== */}

                <CatalogFilter

                    title="GPU"

                    queryKey="gpu"

                    items={
                        options?.gpu ?? []
                    }

                />


                {/* ==============================================================
                06 — MEMORY
                ============================================================== */}

                <CatalogFilter

                    title="メモリ"

                    queryKey="memory"

                    items={
                        options?.memory ?? []
                    }

                />


                {/* ==============================================================
                07 — STORAGE
                ============================================================== */}

                <CatalogFilter

                    title="ストレージ"

                    queryKey="storage"

                    items={
                        options?.storage ?? []
                    }

                />

            </div>

        </section>

    )

}