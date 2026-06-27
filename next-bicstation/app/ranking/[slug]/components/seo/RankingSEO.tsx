// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/[slug]/components/seo/RankingSEO.tsx
// Copyright (c) 2024 Shin Corporation.
// All rights reserved.
// ============================================================================

'use client'

/* ============================================================================
🔥 Contracts
============================================================================ */

import type {

    SemanticRankingRuntime,

} from '../../types/contracts'

/* ============================================================================
🔥 Props
============================================================================ */

type Props = {

    runtime: SemanticRankingRuntime

}

/* ============================================================================
🔥 Ranking SEO
============================================================================ */

export default function RankingSEO({

    runtime,

}: Props) {

    const schemas =

        runtime.schemas ?? {}

    const jsonld =

        [

            schemas.itemSchema,

            schemas.collectionSchema,

            schemas.breadcrumbSchema,

            schemas.faqSchema,

        ].filter(Boolean)

    if (

        jsonld.length === 0

    ) {

        return null

    }

    return (

        <>

            {

                jsonld.map(

                    (

                        schema,

                        index,

                    ) => (

                        <script

                            key={index}

                            type="application/ld+json"

                            dangerouslySetInnerHTML={{

                                __html: JSON.stringify(schema),

                            }}

                        />

                    )

                )

            }

        </>

    )

}