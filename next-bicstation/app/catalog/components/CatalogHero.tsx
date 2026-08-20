// ============================================================================
// FILE:
// /app/catalog/components/CatalogHero.tsx
// ============================================================================

'use client'

import type {
    ProductsRuntime,
} from '@/shared/lib/api/django/pc/products/contracts'

import type {
    CatalogOptionsData,
} from '@/shared/lib/api/django/pc/options/contracts'

import styles from '../styles/catalog.module.css'


/* ============================================================================
🔥 Props
============================================================================ */

type CatalogFilters = {

    maker?: string

    brand?: string

    series?: string

    cpu?: string

    gpu?: string

    memory?: string

    storage?: string

}


type Props = {

    runtime:
        ProductsRuntime

    filters:
        CatalogFilters

    options?:
        CatalogOptionsData

}


/* ============================================================================
🔥 Option Label Resolver
============================================================================ */

function resolveOptionLabel(

    items:
        CatalogOptionsData[keyof CatalogOptionsData]
        | undefined,

    value:
        string
        | undefined,

) {

    if (
        !value ||
        !items
    ) {

        return undefined

    }


    const option =
        items.find(

            item =>
                String(
                    item.value
                ) ===
                String(
                    value
                )

        )


    return (
        option?.label
        || value
    )

}


/* ============================================================================
🔥 Catalog Hero
============================================================================ */

export default function CatalogHero({

    runtime,

    filters,

    options,

}: Props) {


    /* ==========================================================================
    Runtime Data
    ========================================================================== */

    const {

        count,

        page,

        page_size,

    } =
        runtime.data


    /* ==========================================================================
    Selected Option Labels
    ========================================================================== */

    const makerLabel =
        resolveOptionLabel(

            options?.maker,

            filters.maker,

        )


    const brandLabel =
        resolveOptionLabel(

            options?.brand,

            filters.brand,

        )


    const seriesLabel =
        resolveOptionLabel(

            options?.series,

            filters.series,

        )


    const cpuLabel =
        resolveOptionLabel(

            options?.cpu,

            filters.cpu,

        )


    const gpuLabel =
        resolveOptionLabel(

            options?.gpu,

            filters.gpu,

        )


    const memoryLabel =
        resolveOptionLabel(

            options?.memory,

            filters.memory,

        )


    const storageLabel =
        resolveOptionLabel(

            options?.storage,

            filters.storage,

        )


    /* ==========================================================================
    Filtered Catalog Title
    ========================================================================== */

    let title: string


    if (seriesLabel) {

        title =
            `${seriesLabel}のPC一覧`

    }
    else if (brandLabel) {

        title =
            `${brandLabel}のPC一覧`

    }
    else if (makerLabel) {

        title =
            `${makerLabel}のPC一覧`

    }
    else {

        title =
            runtime.presentation?.title
            || runtime.seo?.title
            || runtime.meaning?.identity
            || 'PC商品一覧'

    }


    /* ==========================================================================
    Subtitle
    ========================================================================== */

    let subtitle: string | undefined


    if (seriesLabel) {

        if (brandLabel && makerLabel) {

            subtitle =
                `${makerLabel} / ${brandLabel} の ${seriesLabel} を表示しています。`

        }
        else if (brandLabel) {

            subtitle =
                `${brandLabel} の ${seriesLabel} を表示しています。`

        }
        else {

            subtitle =
                `${seriesLabel} に該当するPCを表示しています。`

        }

    }
    else if (brandLabel) {

        if (makerLabel) {

            subtitle =
                `${makerLabel} の ${brandLabel} ブランドのPCを表示しています。`

        }
        else {

            subtitle =
                `${brandLabel} ブランドのPCを表示しています。`

        }

    }
    else if (makerLabel) {

        subtitle =
            `${makerLabel} から提供されているPCを表示しています。`

    }
    else {

        subtitle =
            runtime.presentation?.subtitle

    }


    /* ==========================================================================
    Description
    ========================================================================== */

    let description: string


    if (
        cpuLabel
        ||
        gpuLabel
        ||
        memoryLabel
        ||
        storageLabel
    ) {

        const specifications: string[] = []


        if (cpuLabel) {

            specifications.push(
                `CPU: ${cpuLabel}`
            )

        }


        if (gpuLabel) {

            specifications.push(
                `GPU: ${gpuLabel}`
            )

        }


        if (memoryLabel) {

            specifications.push(
                `メモリ: ${memoryLabel}`
            )

        }


        if (storageLabel) {

            specifications.push(
                `ストレージ: ${storageLabel}`
            )

        }


        description =
            `${specifications.join(' / ')} の条件に一致するPCを表示しています。`

    }
    else {

        description =
            runtime.presentation?.description
            || runtime.seo?.description
            || runtime.meaning?.mission
            || '用途・メーカー・価格を問わず、登録されているPCを一覧で比較できます。'

    }


    /* ==========================================================================
    Render
    ========================================================================== */

    return (

        <section
            className={
                styles.catalogHero
            }
        >

            <div
                className={
                    styles.catalogHeroContent
                }
            >

                {/* ==================================================================
                Label
                ================================================================== */}

                <div
                    className={
                        styles.catalogHeroLabel
                    }
                >

                    PRODUCT CATALOG

                </div>


                {/* ==================================================================
                Title
                ================================================================== */}

                <h1
                    className={
                        styles.catalogHeroTitle
                    }
                >

                    {title}

                </h1>


                {/* ==================================================================
                Subtitle
                ================================================================== */}

                {subtitle && (

                    <h2
                        className={
                            styles.catalogHeroSubtitle
                        }
                    >

                        {subtitle}

                    </h2>

                )}


                {/* ==================================================================
                Description
                ================================================================== */}

                <p
                    className={
                        styles.catalogHeroDescription
                    }
                >

                    {description}

                </p>


                {/* ==================================================================
                Stats
                ================================================================== */}

                <div
                    className={
                        styles.catalogHeroStats
                    }
                >

                    {/* ==============================================================
                    Product Count
                    ============================================================== */}

                    <div
                        className={
                            styles.catalogHeroStat
                        }
                    >

                        <span
                            className={
                                styles.catalogHeroStatLabel
                            }
                        >

                            総商品数

                        </span>

                        <strong
                            className={
                                styles.catalogHeroStatValue
                            }
                        >

                            {
                                count.toLocaleString()
                            }

                        </strong>

                    </div>


                    {/* ==============================================================
                    Current Page
                    ============================================================== */}

                    <div
                        className={
                            styles.catalogHeroStat
                        }
                    >

                        <span
                            className={
                                styles.catalogHeroStatLabel
                            }
                        >

                            現在のページ

                        </span>

                        <strong
                            className={
                                styles.catalogHeroStatValue
                            }
                        >

                            {page}

                        </strong>

                    </div>


                    {/* ==============================================================
                    Display Count
                    ============================================================== */}

                    <div
                        className={
                            styles.catalogHeroStat
                        }
                    >

                        <span
                            className={
                                styles.catalogHeroStatLabel
                            }
                        >

                            表示件数

                        </span>

                        <strong
                            className={
                                styles.catalogHeroStatValue
                            }
                        >

                            {page_size}

                        </strong>

                    </div>

                </div>

            </div>


            {/* ======================================================================
            Visual
            ====================================================================== */}

            <div
                className={
                    styles.catalogHeroVisual
                }
            />

        </section>

    )

}