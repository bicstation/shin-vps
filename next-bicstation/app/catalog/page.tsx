// ============================================================================
// FILE:
// /app/catalog/page.tsx
// Copyright (c) 2024 Shin Corporation.
// All rights reserved.
// ============================================================================

/**
 * ============================================================================
 * SHIN CORE LINX
 * Catalog Page
 * ============================================================================
 *
 * PURPOSE
 *
 * Platform Runtime Entry.
 *
 * This module SHALL:
 *
 * ✓ Generate Metadata
 * ✓ Generate JSON-LD
 * ✓ Resolve Catalog SEO Identity from URL filters
 * ✓ Enter Platform Runtime
 * ✓ Delegate Experience to Orchestrator
 *
 * This module SHALL NOT:
 *
 * ✗ Render UI
 * ✗ Manage State
 * ✗ Generate Semantic Meaning
 * ✗ Generate Product Meaning
 * ✗ Fetch Catalog Runtime
 * ✗ Generate Product Recommendations
 *
 * ============================================================================
 */

import type {
    Metadata,
} from 'next'


/* ============================================================================
🔥 Publishing
============================================================================ */

import {
    buildPageMetadata,
    createJsonLdGraph,
} from '@/shared/publishing'

import {
    toNextMetadata,
} from '@/app/publishing/next'

import JsonLd
    from '@/app/publishing/JsonLd'


/* ============================================================================
🔥 Frontend
============================================================================ */

import CatalogRuntimeOrchestrator
    from './orchestration/CatalogRuntimeOrchestrator'


/* ============================================================================
🔥 Catalog Search Params
============================================================================ */

type CatalogSearchParams = {

    maker?: string

    brand?: string

    series?: string

    cpu?: string

    gpu?: string

    memory?: string

    storage?: string

    page?: string

    sort?: string

}


/* ============================================================================
🔥 Page Props
============================================================================ */

type PageProps = {

    searchParams: Promise<CatalogSearchParams>

}


/* ============================================================================
🔥 Catalog SEO Identity
============================================================================ */

function resolveCatalogIdentity(

    searchParams:
        CatalogSearchParams,

) {

    const maker =
        searchParams.maker?.trim()

    const brand =
        searchParams.brand?.trim()

    const series =
        searchParams.series?.trim()

    const cpu =
        searchParams.cpu?.trim()

    const gpu =
        searchParams.gpu?.trim()

    const memory =
        searchParams.memory?.trim()

    const storage =
        searchParams.storage?.trim()


    /* ==========================================================================
    Title
    ========================================================================== */

    let title =
        'PC商品一覧｜BIC STATION'


    if (series) {

        title =
            `${series}のPC一覧｜BIC STATION`

    }
    else if (brand) {

        title =
            `${brand}のPC一覧｜BIC STATION`

    }
    else if (maker) {

        title =
            `${maker}のPC一覧｜BIC STATION`

    }


    /* ==========================================================================
    Description
    ========================================================================== */

    const identityParts: string[] = []


    if (maker) {

        identityParts.push(
            maker
        )

    }

    if (brand) {

        identityParts.push(
            brand
        )

    }

    if (series) {

        identityParts.push(
            series
        )

    }


    const specificationParts: string[] = []


    if (cpu) {

        specificationParts.push(
            `CPU ${cpu}`
        )

    }

    if (gpu) {

        specificationParts.push(
            `GPU ${gpu}`
        )

    }

    if (memory) {

        specificationParts.push(
            `メモリ ${memory}`
        )

    }

    if (storage) {

        specificationParts.push(
            `ストレージ ${storage}`
        )

    }


    /* ==========================================================================
    Description — Identity
    ========================================================================== */

    let description: string


    if (identityParts.length > 0) {

        description =
            `${identityParts.join(' / ')}のPCを一覧で比較できます。`

    }
    else {

        description =
            '掲載中のPCをメーカー・ブランド・シリーズ・スペックから比較・検索できます。'

    }


    /* ==========================================================================
    Description — Specifications
    ========================================================================== */

    if (
        specificationParts.length > 0
    ) {

        description +=
            ` ${specificationParts.join('、')}の条件にも対応しています。`

    }


    /* ==========================================================================
    Keywords
    ========================================================================== */

    const keywords = [

        'PC',

        'ノートパソコン',

        'デスクトップ',

        'PC商品一覧',

        'PC比較',

        'BIC STATION',

    ]


    if (maker) {

        keywords.push(
            maker
        )

    }

    if (brand) {

        keywords.push(
            brand
        )

    }

    if (series) {

        keywords.push(
            series
        )

    }


    if (cpu) {

        keywords.push(
            cpu
        )

    }

    if (gpu) {

        keywords.push(
            gpu
        )

    }


    /* ==========================================================================
    Return
    ========================================================================== */

    return {

        title,

        description,

        keywords,

        maker,

        brand,

        series,

        cpu,

        gpu,

        memory,

        storage,

    }

}


/* ============================================================================
🔥 Canonical URL
============================================================================ */

function buildCatalogCanonical(

    searchParams:
        CatalogSearchParams,

) {

    const maker =
        searchParams.maker?.trim()

    const brand =
        searchParams.brand?.trim()

    const series =
        searchParams.series?.trim()


    const params =
        new URLSearchParams()


    /*
     * SEO Identityとして扱うFilterのみcanonicalに残す。
     *
     * CPU / GPU / Memory / Storage / sort / page は
     * Catalog UIの絞り込み・表示制御であり、
     * Canonical Identityには含めない。
     */

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

        ? `https://bicstation.com/catalog?${query}`

        : 'https://bicstation.com/catalog'

}


/* ============================================================================
🔥 JSON-LD
============================================================================ */

export async function generateJsonLd(

    searchParams:
        CatalogSearchParams = {},

) {

    const seo =
        resolveCatalogIdentity(
            searchParams
        )


    const canonical =
        buildCatalogCanonical(
            searchParams
        )


    /* ==========================================================================
    Breadcrumb
    ========================================================================== */

    const breadcrumb = [

        {

            name:
                'ホーム',

            path:
                '/',

        },

        {

            name:
                '商品一覧',

            path:
                '/catalog',

        },

    ]


    /* ==========================================================================
    Filtered Breadcrumb
    ========================================================================== */

    if (seo.maker) {

        breadcrumb.push({

            name:
                seo.maker,

            path:
                `/catalog?maker=${encodeURIComponent(
                    seo.maker
                )}`,

        })

    }


    if (seo.brand) {

        const params =
            new URLSearchParams()

        if (seo.maker) {

            params.set(
                'maker',
                seo.maker
            )

        }

        params.set(
            'brand',
            seo.brand
        )


        breadcrumb.push({

            name:
                seo.brand,

            path:
                `/catalog?${params.toString()}`,

        })

    }


    if (seo.series) {

        const params =
            new URLSearchParams()

        if (seo.maker) {

            params.set(
                'maker',
                seo.maker
            )

        }

        if (seo.brand) {

            params.set(
                'brand',
                seo.brand
            )

        }

        params.set(
            'series',
            seo.series
        )


        breadcrumb.push({

            name:
                seo.series,

            path:
                `/catalog?${params.toString()}`,

        })

    }


    /* ==========================================================================
    CollectionPage
    ========================================================================== */

    return createJsonLdGraph({

        breadcrumb,

        collectionPage: {

            name:
                seo.title,

            description:
                seo.description,

            url:
                canonical,

        },

    })

}


/* ============================================================================
🔥 Metadata
============================================================================ */

export async function generateMetadata({

    searchParams,

}: PageProps): Promise<Metadata> {

    const resolvedSearchParams =
        await searchParams


    const seo =
        resolveCatalogIdentity(
            resolvedSearchParams
        )


    const canonical =
        buildCatalogCanonical(
            resolvedSearchParams
        )


    return toNextMetadata(

        buildPageMetadata(

            '/catalog',

            {

                title:
                    seo.title,

                description:
                    seo.description,

                keywords:
                    seo.keywords,

                canonical,

            },

        ),

    )

}


/* ============================================================================
🔥 Catalog Page
============================================================================ */

export default async function Page({

    searchParams,

}: PageProps) {

    const resolvedSearchParams =
        await searchParams


    const jsonLd =
        await generateJsonLd(
            resolvedSearchParams
        )


    return (

        <>

            <JsonLd

                id="jsonld-page"

                jsonLd={
                    jsonLd
                }

            />

            <CatalogRuntimeOrchestrator />

        </>

    )

}