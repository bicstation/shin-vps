// ============================================================================
// FILE:
// /app/pc-finder/components/RecommendationReason.tsx
// Copyright (c) 2026 Shin Corporation.
// ============================================================================

'use client'

/* ============================================================================
Styles
============================================================================ */

import styles
    from '../styles/pcFinder.module.css'

/* ============================================================================
Props
============================================================================ */

type Props = {

    text: string

}

/* ============================================================================
Recommendation Reason
============================================================================ */

export default function RecommendationReason({

    text,

}: Props) {

    return (

        <div
            className={
                styles.reasonCard
            }
        >

            <div
                className={
                    styles.reasonIcon
                }
            >

                ✓

            </div>

            <span
                className={
                    styles.reasonText
                }
            >

                {text}

            </span>

        </div>

    )

}