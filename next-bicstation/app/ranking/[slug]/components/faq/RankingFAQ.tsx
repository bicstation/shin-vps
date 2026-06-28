// ============================================================================
// FILE:
// /app/ranking/[slug]/components/faq/RankingFAQ.tsx
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

    const faq =

        runtime.faq ?? []

    if (faq.length === 0) {

        return null

    }

    return (

        <section className={styles.section}>

            {/* ==========================================================
            Header
            ========================================================== */}

            <header className={styles.header}>

                <div className={styles.eyebrow}>

                    RUNTIME FAQ

                </div>

                <h2 className={styles.title}>

                    よくある質問

                </h2>

                <p className={styles.description}>

                    ランキングの選定基準や評価方法など、
                    よくいただく質問をまとめています。

                </p>

                <div className={styles.summary}>

                    <span>

                        FAQ

                    </span>

                    <strong>

                        {faq.length}

                    </strong>

                </div>

            </header>

            {/* ==========================================================
            FAQ
            ========================================================== */}

            <div className={styles.list}>

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

                                    <div
                                        className={styles.questionLeft}
                                    >

                                        <span
                                            className={styles.q}
                                        >

                                            Q

                                        </span>

                                        <span>

                                            {item.question}

                                        </span>

                                    </div>

                                    <span
                                        className={styles.icon}
                                    >

                                        +

                                    </span>

                                </summary>

                                <div
                                    className={styles.answer}
                                >

                                    <span
                                        className={styles.a}
                                    >

                                        A

                                    </span>

                                    <div>

                                        {item.answer}

                                    </div>

                                </div>

                            </details>

                        )

                    )

                }

            </div>

        </section>

    )

}