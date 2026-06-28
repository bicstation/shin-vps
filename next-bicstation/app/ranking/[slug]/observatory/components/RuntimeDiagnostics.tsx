// ============================================================================
// FILE:
// /app/ranking/[slug]/observatory/components/RuntimeDiagnostics.tsx
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
🔥 Runtime Diagnostics
============================================================================ */

export default function RuntimeDiagnostics({

    runtime,

}: Props) {

    /* =========================================================================
    🔥 Diagnostics
    ========================================================================= */

    const diagnostics = [

        {

            level:

                runtime.meaning
                    ? 'OK'
                    : 'ERROR',

            title:

                'Meaning',

            message:

                runtime.meaning
                    ? 'Meaning Runtime is available.'
                    : 'Meaning Runtime is missing.',

        },

        {

            level:

                runtime.presentation
                    ? 'OK'
                    : 'ERROR',

            title:

                'Presentation',

            message:

                runtime.presentation
                    ? 'Presentation Runtime is available.'
                    : 'Presentation Runtime is missing.',

        },

        {

            level:

                runtime.products?.length
                    ? 'OK'
                    : 'WARNING',

            title:

                'Products',

            message:

                runtime.products?.length
                    ? `${runtime.products.length} products available.`
                    : 'No products were returned.',

        },

        {

            level:

                runtime.semantic_labels?.length
                    ? 'OK'
                    : 'INFO',

            title:

                'Semantic Labels',

            message:

                runtime.semantic_labels?.length
                    ? `${runtime.semantic_labels.length} semantic labels loaded.`
                    : 'Semantic labels are empty.',

        },

        {

            level:

                runtime.breadcrumbs?.length
                    ? 'OK'
                    : 'INFO',

            title:

                'Breadcrumbs',

            message:

                runtime.breadcrumbs?.length
                    ? `${runtime.breadcrumbs.length} breadcrumbs available.`
                    : 'Breadcrumb Runtime is empty.',

        },

        {

            level:

                runtime.faq?.length
                    ? 'OK'
                    : 'INFO',

            title:

                'FAQ',

            message:

                runtime.faq?.length
                    ? `${runtime.faq.length} FAQ entries available.`
                    : 'FAQ Runtime is empty.',

        },

        {

            level:

                runtime.ready
                    ? 'OK'
                    : 'WARNING',

            title:

                'Runtime Ready',

            message:

                runtime.ready
                    ? 'Runtime is ready.'
                    : 'Runtime is not marked as ready.',

        },

        {

            level:

                runtime.semantic_authority
                    ? 'OK'
                    : 'ERROR',

            title:

                'Semantic Authority',

            message:

                runtime.semantic_authority
                    ? runtime.semantic_authority
                    : 'Semantic authority is missing.',

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

                Runtime Diagnostics

            </h2>

            <div
                className={styles.table}
            >

                {

                    diagnostics.map(

                        (

                            item,

                            index,

                        ) => (

                            <div

                                key={index}

                                className={styles.row}

                            >

                                <div
                                    className={styles.level}
                                >

                                    {item.level}

                                </div>

                                <div
                                    className={styles.label}
                                >

                                    {item.title}

                                </div>

                                <div
                                    className={styles.message}
                                >

                                    {item.message}

                                </div>

                            </div>

                        )

                    )

                }

            </div>

        </section>

    )

}