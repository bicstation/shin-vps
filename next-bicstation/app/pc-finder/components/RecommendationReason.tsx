// ============================================================================
// FILE:
// /app/pc-finder/components/RecommendationReason.tsx
// Copyright (c) 2026 Shin Corporation.
// ============================================================================

'use client'

/* ============================================================================
Discovery Confidence Unit

Represents one piece of Runtime Reality that helps
the user understand the recommendation.

Responsibilities

- Present one Runtime Reality
- Improve user confidence
- Support the Recommendation Experience

This component does NOT

- Interpret Semantic Meaning
- Generate Runtime
- Generate Recommendation Logic
- Select Products

============================================================================ */

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
Recommendation Reality
============================================================================ */

export default function RecommendationReason({

    text,

}: Props) {

    return (

        <div
            className={styles.reasonCard}
        >

            <div
                className={styles.reasonIcon}
                aria-hidden="true"
            >

                ✓

            </div>

            <span
                className={styles.reasonText}
            >

                {text}

            </span>

        </div>

    )

}