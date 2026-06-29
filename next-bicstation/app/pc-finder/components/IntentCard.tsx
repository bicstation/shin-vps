// ============================================================================
// FILE:
// /app/pc-finder/components/IntentCard.tsx
// Copyright (c) 2026 Shin Corporation.
// ============================================================================

'use client'

/* ============================================================================
Styles
============================================================================ */

import styles
    from '../styles/pcFinder.module.css'

/* ============================================================================
Types
============================================================================ */

type Intent = {

    id: string

    title: string

    description: string

    icon: string

}

/* ============================================================================
Props
============================================================================ */

type Props = {

    intent: Intent

    selected?: boolean

    onClick: () => void

}

/* ============================================================================
Discovery Decision

Represents a single user intention.

This component is the smallest unit of the Discovery Experience.

Responsibilities

- Display one Intent
- Provide clear selection feedback
- Encourage the user's first discovery decision

This component does NOT

- Manage State
- Execute Runtime
- Generate Semantic Meaning

============================================================================ */

export default function IntentCard({

    intent,

    selected = false,

    onClick,

}: Props) {

    const className = [

        styles.intentCard,

        selected && styles.selected,

    ]

        .filter(Boolean)

        .join(' ')

    return (

        <button

            type="button"

            aria-label={intent.title}

            aria-pressed={selected}

            onClick={onClick}

            className={className}

        >

            {selected && (

                <div
                    className={styles.selectedBadge}
                >

                    ✓ 選択済み

                </div>

            )}

            <div
                className={
                    styles.intentIcon
                }
            >

                {intent.icon}

            </div>

            <h3
                className={
                    styles.intentTitle
                }
            >

                {intent.title}

            </h3>

            <p
                className={
                    styles.intentDescription
                }
            >

                {intent.description}

            </p>

        </button>

    )

}