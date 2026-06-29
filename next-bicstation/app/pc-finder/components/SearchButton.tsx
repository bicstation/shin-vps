// ============================================================================
// FILE:
// /app/pc-finder/components/SearchButton.tsx
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

    loading?: boolean

    disabled?: boolean

    onClick: () => void

}

/* ============================================================================
Discovery Trigger

Represents the action that begins the Semantic Discovery journey.

Responsibilities

- Present the primary Discovery CTA
- Reflect loading state
- Prevent duplicate execution

This component does NOT

- Execute Runtime
- Manage Search Logic
- Generate Semantic Meaning

============================================================================ */

export default function SearchButton({

    loading = false,

    disabled = false,

    onClick,

}: Props) {

    return (

        <button

            type="button"

            aria-label="おすすめのPCを探す"

            aria-busy={loading}

            onClick={onClick}

            disabled={

                disabled ||

                loading

            }

            className={

                styles.searchButton

            }

        >

            {

                loading

                    ? 'おすすめを探しています…'

                    : 'おすすめのPCを探す'

            }

        </button>

    )

}