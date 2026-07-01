// ============================================================================
// FILE:
// /app/experience/components/product/RecommendationReason.tsx
// Copyright (c) 2026 Shin Corporation.
// ============================================================================

'use client'

/* ============================================================================
Props
============================================================================ */

type Props = {

    reason?: string | null

    className?: string

    maxLength?: number

}

/* ============================================================================
Experience

Recommendation Reason

Responsibilities

- Present Backend Recommendation
- Preserve Runtime Meaning
- Support Experience Composition

This component does NOT

- Generate Recommendation
- Interpret Semantic Meaning
- Modify Runtime

============================================================================ */

export default function RecommendationReason({

    reason,

    className,

    maxLength = 140,

}: Props) {

    if (!reason) {

        return null

    }

    const text =

        reason.length > maxLength

            ? `${reason.slice(0, maxLength)}…`

            : reason

    return (

        <p
            className={className}
        >

            {text}

        </p>

    )

}