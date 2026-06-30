// ============================================================================
// FILE:
// /app/catalog/components/Pagination.tsx
// ============================================================================

'use client'

/* ============================================================================
Next
============================================================================ */

import {

    useRouter,

    useSearchParams,

} from 'next/navigation'

/* ============================================================================
Styles
============================================================================ */

import styles
    from '../styles/catalog.module.css'

/* ============================================================================
Props
============================================================================ */

type Props = {

    page: number

    page_size: number

    has_next: boolean

}

/* ============================================================================
Experience

Pagination Navigation

Supports product browsing by navigating
between Runtime pages.

Responsibilities

- Navigate between pages
- Preserve search parameters
- Present current page information

This component does NOT

- Generate Runtime
- Generate Semantic Meaning
- Interpret Semantic Reality

============================================================================ */

export default function Pagination({

    page,

    page_size,

    has_next,

}: Props) {

    const router = useRouter()

    const searchParams = useSearchParams()

    function moveTo(

        nextPage: number,

    ) {

        const params = new URLSearchParams(

            searchParams.toString()

        )

        params.set(

            'page',

            String(nextPage)

        )

        router.push(

            `/catalog?${params.toString()}`

        )

    }

    return (

        <nav className={styles.pagination}>

            <button

                className={styles.paginationButton}

                disabled={page <= 1}

                onClick={() => moveTo(page - 1)}

            >

                ← 前へ

            </button>

            <div className={styles.paginationInfo}>

                Page {page}

                <span>

                    {' '}·{' '}

                    {page_size}件表示

                </span>

            </div>

            <button

                className={styles.paginationButton}

                disabled={!has_next}

                onClick={() => moveTo(page + 1)}

            >

                次へ →

            </button>

        </nav>

    )

}