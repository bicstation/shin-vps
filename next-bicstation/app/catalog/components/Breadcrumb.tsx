// ============================================================================
// FILE:
// /app/catalog/components/Breadcrumb.tsx
// ============================================================================

'use client'

import Link from 'next/link'

import {
    useSearchParams,
} from 'next/navigation'

import styles from '../styles/catalog.module.css'


/* ============================================================================
🔥 Component
============================================================================ */

export default function Breadcrumb() {

    const searchParams =
        useSearchParams()


    /* ==========================================================================
    Current Filters
    ========================================================================== */

    const maker =
        searchParams.get(
            'maker'
        )

    const brand =
        searchParams.get(
            'brand'
        )

    const series =
        searchParams.get(
            'series'
        )


    /* ==========================================================================
    URL Builder
    ========================================================================== */

    function buildCatalogUrl({

        maker,
        brand,
        series,

    }: {

        maker?: string | null

        brand?: string | null

        series?: string | null

    }) {

        const params =
            new URLSearchParams()


        if (maker) {

            params.set(
                'maker',
                maker
            )

        }


        if (brand) {

            params.set(
                'brand',
                brand
            )

        }


        if (series) {

            params.set(
                'series',
                series
            )

        }


        const query =
            params.toString()


        return query

            ? `/catalog?${query}`

            : '/catalog'

    }


    /* ==========================================================================
    Breadcrumb Items
    ========================================================================== */

    const items: {

        name: string

        href?: string

        current?: boolean

    }[] = []


    /* --------------------------------------------------------------------------
    Catalog Root
    -------------------------------------------------------------------------- */

    items.push({

        name:
            '商品一覧',

        href:
            '/catalog',

    })


    /* --------------------------------------------------------------------------
    Maker
    -------------------------------------------------------------------------- */

    if (maker) {

        items.push({

            name:
                maker,

            href:
                buildCatalogUrl({

                    maker,

                }),

        })

    }


    /* --------------------------------------------------------------------------
    Brand
    -------------------------------------------------------------------------- */

    if (brand) {

        items.push({

            name:
                brand,

            href:
                buildCatalogUrl({

                    maker,

                    brand,

                }),

        })

    }


    /* --------------------------------------------------------------------------
    Series
    -------------------------------------------------------------------------- */

    if (series) {

        items.push({

            name:
                series,

            current:
                true,

        })

    }


    /* ==========================================================================
    Render
    ========================================================================== */

    return (

        <nav

            className={
                styles.breadcrumb
            }

            aria-label="Breadcrumb"

        >

            {/* ==================================================================
            Home
            ================================================================== */}

            <Link

                href="/"

                className={
                    styles.breadcrumbLink
                }

            >

                ホーム

            </Link>


            {/* ==================================================================
            Breadcrumb Items
            ================================================================== */}

            {

                items.map(

                    (
                        item,
                        index,
                    ) => (

                        <span

                            key={
                                `${item.name}-${index}`
                            }

                            style={{
                                display:
                                    'contents',
                            }}

                        >

                            <span
                                className={
                                    styles.breadcrumbSeparator
                                }
                            >

                                /

                            </span>


                            {

                                item.current

                                    ? (

                                        <span

                                            className={
                                                styles.breadcrumbCurrent
                                            }

                                        >

                                            {
                                                item.name
                                            }

                                        </span>

                                    )

                                    : (

                                        <Link

                                            href={
                                                item.href
                                                || '/catalog'
                                            }

                                            className={
                                                styles.breadcrumbLink
                                            }

                                        >

                                            {
                                                item.name
                                            }

                                        </Link>

                                    )

                            }

                        </span>

                    )

                )

            }

        </nav>

    )

}