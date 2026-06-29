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

    title: string

    description: string

    reasons: string[]

}

/* ============================================================================
Recommendation Section
============================================================================ */

export default function RecommendationSection({

    title,

    description,

    reasons,

}: Props) {

    return (

        <section className={styles.section}>

            <div className={styles.card}>

                <span className={styles.badge}>

                    DISCOVERY RESULT

                </span>

                <h2 className={styles.title}>

                    {title}

                </h2>

                <p className={styles.description}>

                    {description}

                </p>

                {

                    (reasons ?? []).length > 0 && (

                        <div
                            className={
                                styles.reasonList
                            }
                        >

                            {

                                (reasons ?? []).map(

                                    (reason, index) => (

                                        <RecommendationReason

                                            key={

                                                `${index}-${reason}`

                                            }

                                            text={

                                                reason

                                            }

                                        />

                                    )

                                )

                            }

                        </div>

                    )

                }

            </div>

        </section>

    )

}