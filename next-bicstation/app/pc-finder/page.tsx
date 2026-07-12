// ============================================================================
// FILE:
// /app/pc-finder/page.tsx
// Copyright (c) 2024 Shin Corporation.
// All rights reserved.
// ============================================================================

/**
 * ============================================================================
 * SHIN CORE LINX
 * Finder Page
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
 * ✗ Execute Finder Runtime
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

    buildFinderMetadata,

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

import FinderRuntimeOrchestrator
    from './orchestration/FinderRuntimeOrchestrator'

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

                name: 'PC Finder',
                path: '/pc-finder',

            },

        ],

        collectionPage: {

            name:
                'PC Finder',
            description:
                '用途・予算から最適なPCを見つけるPC Finderです。',
            url:
                'https://bicstation.com/pc-finder',

        },

    })

}

/* ============================================================================
🔥 Metadata
============================================================================ */

export const metadata: Metadata =

    toNextMetadata(

        buildFinderMetadata(

            {

                title:
                    'PC Finder｜用途・予算からおすすめPCを探す｜BIC STATION',

                description:
                    'AI・ゲーム・動画編集・ビジネスなど用途と予算から最適なPCを見つけられるPC Finderです。',

                keywords: [

                    'PC Finder',

                    'おすすめPC',

                    'PC診断',

                    'AI PC',

                    'ゲーミングPC',

                    '動画編集PC',

                    'BIC STATION',

                ],

            },

        ),

    )
/* ============================================================================
🔥 Finder Page
============================================================================ */

export default async function Page() {

    /* --------------------------------------------------------------------------
    JSON-LD
    -------------------------------------------------------------------------- */

    const jsonLd =

        await generateJsonLd()

    /* --------------------------------------------------------------------------
    Render
    -------------------------------------------------------------------------- */

    return (

        <>

            <JsonLd

                id="jsonld-page"

                jsonLd={

                    jsonLd

                }

            />

            <FinderRuntimeOrchestrator />

        </>

    )

}