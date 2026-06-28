// ============================================================================
// FILE:
// /app/ranking/[slug]/observatory/components/RuntimeCoverage.tsx
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
🔥 Runtime Coverage
============================================================================ */

export default function RuntimeCoverage({

    runtime,

}: Props) {

    /* =========================================================================
    🔥 Coverage
    ========================================================================= */

    const rows = [

        {

            label: 'Meaning',

            value:

                runtime.meaning

                    ? '✓'

                    : '—',

        },

        {

            label: 'Presentation',

            value:

                runtime.presentation

                    ? '✓'

                    : '—',

        },

        {

            label: 'SEO',

            value:

                runtime.seo

                    ? '✓'

                    : '—',

        },

        {

            label: 'Authority',

            value:

                runtime.semantic_authority

                    ?? '—',

        },

        {

            label: 'Ranking',

            value:

                runtime.ranking

                    ? '✓'

                    : '—',

        },

        {

            label: 'Products',

            value:

                runtime.products?.length

                    ?? 0,

        },

        {

            label: 'Semantic Labels',

            value:

                runtime.semantic_labels?.length

                    ?? 0,

        },

        {

            label: 'Breadcrumbs',

            value:

                runtime.breadcrumbs?.length

                    ?? 0,

        },

        {

            label: 'FAQ',

            value:

                runtime.faq?.length

                    ?? 0,

        },

        {

            label: 'Grouped Attributes',

            value:

                Object.keys(

                    runtime.grouped_attributes

                    ?? {}

                ).length,

        },

        {

            label: 'Adaptive Runtime',

            value:

                runtime.adaptive_runtime

                    ? '✓'

                    : '—',

        },

        {

            label: 'Semantic Runtime',

            value:

                runtime.semantic_runtime

                    ? '✓'

                    : '—',

        },

        {

            label: 'Workflow Tags',

            value:

                runtime.workflow_tags?.length

                    ?? 0,

        },

        {

            label: 'Semantic Graph',

            value:

                runtime.semantic_graph?.length

                    ?? 0,

        },

        {

            label: 'Ready',

            value:

                runtime.ready

                    ? '✓'

                    : '—',

        },

    ]

    /* =========================================================================
    🔥 Render
    ========================================================================= */

    return (

        <section
            className={styles.panel}
        >

            <h2
                className={styles.title}
            >

                Runtime Coverage

            </h2>

            <div
                className={styles.table}
            >

                {

                    rows.map(

                        (

                            row,

                            index,

                        ) => (

                            <div

                                key={index}

                                className={styles.row}

                            >

                                <div
                                    className={styles.label}
                                >

                                    {row.label}

                                </div>

                                <div
                                    className={styles.value}
                                >

                                    {row.value}

                                </div>

                            </div>

                        )

                    )

                }

            </div>

        </section>

    )

}