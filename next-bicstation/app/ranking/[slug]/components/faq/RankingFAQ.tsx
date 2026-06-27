// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/[slug]/components/faq/RankingFAQ.tsx
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
    from '../../styles/faq/faq.module.css'

/* ============================================================================
🔥 Types
============================================================================ */

type FAQItem = {

    question?: string

    answer?: string

}

/* ============================================================================
🔥 Props
============================================================================ */

type Props = {

    runtime: SemanticRankingRuntime

}

/* ============================================================================
🔥 Ranking FAQ
============================================================================ */

export default function RankingFAQ({

    runtime,

}: Props) {

    /* =========================================================================
    🔥 Runtime
    ========================================================================= */

    const faq =

        runtime.faq ?? []

    if (

        faq.length === 0

    ) {

        return null

    }

    /* =========================================================================
    🔥 Render
    ========================================================================= */

    return (

        <section
            className={styles.section}
        >

            {/* ==========================================================
            Header
            ========================================================== */}

            <header
                className={styles.header}
            >

                <div
                    className={styles.eyebrow}
                >

                    FAQ

                </div>

                <h2
                    className={styles.title}
                >

                    よくある質問

                </h2>

                <p
                    className={styles.description}
                >

                    ランキングに関するよくある質問をまとめました。

                </p>

            </header>

            {/* ==========================================================
            FAQ
            ========================================================== */}

            <div
                className={styles.list}
            >

                {

                    faq.map(

                        (

                            item: FAQItem,

                            index,

                        ) => (

                            <details

                                key={index}

                                className={styles.item}

                            >

                                <summary
                                    className={styles.question}
                                >

                                    {

                                        item.question

                                    }

                                </summary>

                                <div
                                    className={styles.answer}
                                >

                                    {

                                        item.answer

                                    }

                                </div>

                            </details>

                        )

                    )

                }

            </div>

        </section>

    )

}