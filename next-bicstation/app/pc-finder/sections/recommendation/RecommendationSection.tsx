// ============================================================================
// FILE:
// /app/pc-finder/sections/recommendation/RecommendationSection.tsx
// ============================================================================

'use client'

/* ============================================================================
Components
============================================================================ */

import RecommendationReason
    from '../../components/RecommendationReason'

/* ============================================================================
Styles
============================================================================ */

import styles
    from './RecommendationSection.module.css'

/* ============================================================================
Props
============================================================================ */

type Props = {

    title?: string

    description?: string

    reasons?: string[]

}

/* ============================================================================
Discovery Result

Presents the Runtime recommendation before
the user evaluates individual products.

Responsibilities

- Present Runtime summary
- Build user confidence
- Support product evaluation

============================================================================ */

export default function RecommendationSection({

    title,

    description,

    reasons = [],

}: Props) {

    return (

        <section className={styles.section}>

            <div className={styles.card}>

                <span className={styles.badge}>

                    DISCOVERY RESULT

                </span>

                <h2 className={styles.title}>

                    {title ?? 'あなたへのおすすめ'}

                </h2>

                <p className={styles.description}>

                    {

                        description ??

                        '条件に合うおすすめをご紹介します。'

                    }

                </p>

                {reasons.length > 0 && (

                    <div className={styles.reasonList}>

                        {reasons.map((reason) => (

                            <RecommendationReason

                                key={reason}

                                text={reason}

                            />

                        ))}

                    </div>

                )}

            </div>

        </section>

    )

}