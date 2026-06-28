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
Search Button
============================================================================ */

export default function SearchButton({

    loading = false,

    disabled = false,

    onClick,

}: Props) {

    return (

        <button

            type="button"

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

                    ? '検索中...'

                    : 'おすすめのPCを探す'

            }

        </button>

    )

}