// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/[slug]/page.tsx
// Copyright (c) 2024 Shin Corporation.
// All rights reserved.
// ============================================================================

import type {

    Metadata,

} from 'next'

import {
    getRankingRuntime,
} from '@/shared/lib/api/django/pc/ranking'


import {

    RankingRuntime,

    RankingDebug,

    // RankingSchema,

} from './components'

import styles from './RankingSlugPage.module.css'

/* ============================================================================
🔥 Types
============================================================================ */

type PageProps = {

    params: Promise<{

        slug: string

    }>

    searchParams: Promise<{

        debug?: string

    }>

}

/* ============================================================================
🔥 Metadata
============================================================================ */

export async function generateMetadata({

    params,

}: {

    params: Promise<{

        slug: string

    }>

}): Promise<Metadata> {

    const {

        slug,

    } = await params

    const ranking =

        await getRankingRuntime(
            slug,
        )

    const seo =

        ranking.runtime.seo ?? {}

    return {

        title:

            seo.title

            ||

            'PCランキング',

        description:

            seo.description

            ||

            'おすすめPCランキング',

        alternates: {

            canonical:

                seo.canonical

                ||

                `/ranking/${slug}/`,

        },

        openGraph: {

            title:

                seo.openGraph?.title

                ||

                seo.title,

            description:

                seo.openGraph?.description

                ||

                seo.description,

            url:

                seo.canonical

                ||

                `/ranking/${slug}/`,

            siteName:

                'SHIN CORE LINX',

            images:

                Array.isArray(

                    seo.openGraph?.images,

                )

                    ? seo.openGraph.images

                    : [],

            locale:

                'ja_JP',

            type:

                'website',

        },

        twitter: {

            card:

                'summary_large_image',

            title:

                seo.twitter?.title

                ||

                seo.title,

            description:

                seo.twitter?.description

                ||

                seo.description,

            images:

                Array.isArray(

                    seo.twitter?.images,

                )

                    ? seo.twitter.images

                    : [],

        },

        keywords:

            Array.isArray(

                seo.keywords,

            )

                ? seo.keywords

                : [],

    }

}

/* ============================================================================
🔥 Ranking Slug Page
============================================================================ */

export default async function RankingSlugPage({

    params,

    searchParams,

}: PageProps) {

    const {

        slug,

    } = await params

    const {

        debug,

    } = await searchParams


    const ranking =

        await getRankingRuntime(
            slug,
        )

    if (!ranking) {

        return (

            <main
                className={styles.page}
            >

                Ranking Runtime Not Found

            </main>

        )

    }

    return (

        <main
            className={
                styles.page
            }
        >

            {/* ==========================================================
            Schema
            ========================================================== */}

            {/* <RankingSchema
                schemas={
                    runtime?.schemas
                }
            /> */}

            {/* ==========================================================
            Ranking Experience
            ========================================================== */}

            <RankingRuntime
                runtime={
                    ranking.runtime
                }
            />

            {/* ==========================================================
            Debug
            ========================================================== */}

            {

                debug === '1' && (

                    <RankingDebug
                        runtime={
                            ranking.runtime
                        }
                    />

                )

            }

        </main>

    )

}