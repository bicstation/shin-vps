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
 * ✓ Enter Platform Runtime
 * ✓ Delegate Experience to Orchestrator
 *
 * This module SHALL NOT:
 *
 * ✗ Render UI
 * ✗ Manage State
 * ✗ Generate Meaning
 * ✗ Fetch Runtime (Current Phase)
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
🔥 JSON-LD
============================================================================ */

export async function generateJsonLd() {

    return createJsonLdGraph({

        breadcrumb: [

            {

                name: 'ホーム',

                path: '/',

            },

            {

                name: '商品一覧',

                path: '/catalog',

            },

        ],

        collectionPage: {

            name:
                'PC商品一覧',

            description:
                '掲載中のPC商品を一覧で比較できます。',

            url:
                'https://bicstation.com/catalog',

        },

    })

}

/* ============================================================================
🔥 Metadata
============================================================================ */

export const metadata: Metadata =

    toNextMetadata(

        buildPageMetadata(

            '/catalog',

            {

                title:
                    'PC商品一覧｜BIC STATION',

                description:
                    '掲載中のPC商品を一覧で比較・検索できます。',

                keywords: [

                    'PC',

                    'ノートパソコン',

                    'デスクトップ',

                    '商品一覧',

                    'BIC STATION',

                ],

            },

        ),

    )

/* ============================================================================
🔥 Catalog Page
============================================================================ */

export default async function Page() {

    const jsonLd =

        await generateJsonLd()

    return (

        <>

            <JsonLd
                id="jsonld-page"
                jsonLd={jsonLd}
            />

            <CatalogRuntimeOrchestrator />

        </>

    )

}