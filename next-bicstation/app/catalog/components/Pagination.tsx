// ============================================================================
// FILE:
// /app/catalog/components/Pagination.tsx
// ============================================================================

'use client'

import { useRouter, useSearchParams } from 'next/navigation'

import styles from '../styles/catalog.module.css'

type Props = {

    page: number
    page_size: number
    count: number
    has_next: boolean

}

export default function Pagination({

    page,
    page_size,
    count,
    has_next,

}: Props) {

    const router = useRouter()
    const searchParams = useSearchParams()

    const totalPages = Math.max(

        1,

        Math.ceil(count / page_size),

    )

    function moveTo(nextPage: number) {

        if (

            nextPage < 1 ||

            nextPage > totalPages ||

            nextPage === page

        ) {

            return

        }

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

    const startPage = Math.max(

        1,

        Math.min(

            page - 2,

            totalPages - 4,

        ),

    )

    const endPage = Math.min(

        totalPages,

        startPage + 4,

    )

    const pages = []

    for (

        let p = startPage;

        p <= endPage;

        p++

    ) {

        pages.push(p)

    }

    return (

        <nav className={styles.pagination}>

            <button

                className={styles.paginationButton}

                disabled={page === 1}

                onClick={() => moveTo(1)}

            >

                «

            </button>

            <button

                className={styles.paginationButton}

                disabled={page === 1}

                onClick={() => moveTo(page - 1)}

            >

                ←

            </button>

            <div className={styles.paginationNumbers}>

                {

                    pages.map((p) => (

                        <button

                            key={p}

                            onClick={() => moveTo(p)}

                            className={

                                p === page

                                    ? styles.paginationNumberActive

                                    : styles.paginationNumber

                            }

                        >

                            {p}

                        </button>

                    ))

                }

            </div>

            <button

                className={styles.paginationButton}

                disabled={!has_next}

                onClick={() => moveTo(page + 1)}

            >

                →

            </button>

            <button

                className={styles.paginationButton}

                disabled={page >= totalPages}

                onClick={() => moveTo(totalPages)}

            >

                »

            </button>

        </nav>

    )

}