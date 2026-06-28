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
Intent Card
============================================================================ */

export default function IntentCard({

    intent,

    selected = false,

    onClick,

}: Props) {

    return (

        <button

            type="button"

            onClick={onClick}

            className={

                [

                    styles.intentCard,

                    selected

                        ? styles.selected

                        : '',

                ].join(' ')

            }

        >

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