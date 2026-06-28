// ============================================================================
// FILE:
// /app/ranking/[slug]/observatory/components/RuntimeConsumption.tsx
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
🔥 Styles
============================================================================ */

import styles
    from '../styles/inspector.module.css'

/* ============================================================================
🔥 Props
============================================================================ */

type Props = {

    runtime: SemanticRankingRuntime

}

/* ============================================================================
🔥 Runtime Consumption
============================================================================ */

export default function RuntimeConsumption({

    runtime,

}: Props) {

    /* =========================================================================
    🔥 Consumption Map
    ========================================================================= */

    const sections = [

        {

            runtime: 'Meaning',

            available:

                !!runtime.meaning,

            consumers: [

                'RankingHero',

            ],

        },

        {

            runtime: 'Presentation',

            available:

                !!runtime.presentation,

            consumers: [

                'RankingHero',

            ],

        },

        {

            runtime: 'SEO',

            available:

                !!runtime.seo,

            consumers: [

                'RankingSEO',

            ],

        },

        {

            runtime: 'Products',

            available:

                (runtime.products?.length ?? 0) > 0,

            consumers: [

                'FlagshipCard',

                'ComparisonGrid',

                'RankingList',

            ],

        },

        {

            runtime: 'Semantic Labels',

            available:

                (runtime.semantic_labels?.length ?? 0) > 0,

            consumers: [

                'RankingHero',

            ],

        },

        {

            runtime: 'Breadcrumbs',

            available:

                (runtime.breadcrumbs?.length ?? 0) > 0,

            consumers: [

                'RankingBreadcrumbs',

            ],

        },

        {

            runtime: 'FAQ',

            available:

                (runtime.faq?.length ?? 0) > 0,

            consumers: [

                'RankingFAQ',

            ],

        },

        {

            runtime: 'Adaptive Runtime',

            available:

                !!runtime.adaptive_runtime,

            consumers: [

                '(Reserved)',

            ],

        },

        {

            runtime: 'Semantic Runtime',

            available:

                !!runtime.semantic_runtime,

            consumers: [

                '(Reserved)',

            ],

        },

        {

            runtime: 'Grouped Attributes',

            available:

                Object.keys(

                    runtime.grouped_attributes ?? {}

                ).length > 0,

            consumers: [

                'RankingContinuation',

            ],

        },

    ]

    /* =========================================================================
    🔥 Render
    ========================================================================= */

    return (

        <section className={styles.panel}>

            <h2 className={styles.title}>

                Runtime Consumption

            </h2>

            <div className={styles.table}>

                {

                    sections.map(

                        (

                            section,

                            index,

                        ) => (

                            <div

                                key={index}

                                className={styles.row}

                            >

                                <div className={styles.label}>

                                    {section.runtime}

                                </div>

                                <div className={styles.value}>

                                    {

                                        section.available

                                            ? '✓'

                                            : '—'

                                    }

                                </div>

                                <div className={styles.consumers}>

                                    {

                                        section.consumers.join(

                                            '  •  '

                                        )

                                    }

                                </div>

                            </div>

                        )

                    )

                }

            </div>

        </section>

    )

}