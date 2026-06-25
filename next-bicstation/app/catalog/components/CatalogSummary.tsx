// ============================================================================
// FILE:
// /app/catalog/components/CatalogSummary.tsx
// Copyright (c) 2024 Shin Corporation.
// All rights reserved.
// ============================================================================

'use client'

/* ============================================================================
🔥 Styles
============================================================================ */

import styles
    from '../styles/catalog.module.css'

/* ============================================================================
🔥 Props
============================================================================ */

type Props = {

    count: number

    page: number

    page_size: number

}

/* ============================================================================
🔥 Catalog Summary
============================================================================ */

export default function CatalogSummary({

    count,

    page,

    page_size,

}: Props) {

    return (

        <section
            className={
                styles.catalogSummary
            }
        >

            <div
                className={
                    styles.summaryItem
                }
            >

                <span
                    className={
                        styles.summaryLabel
                    }
                >

                    総商品数

                </span>

                <strong
                    className={
                        styles.summaryValue
                    }
                >

                    {count.toLocaleString()}

                </strong>

            </div>

            <div
                className={
                    styles.summaryItem
                }
            >

                <span
                    className={
                        styles.summaryLabel
                    }
                >

                    現在のページ

                </span>

                <strong
                    className={
                        styles.summaryValue
                    }
                >

                    {page}

                </strong>

            </div>

            <div
                className={
                    styles.summaryItem
                }
            >

                <span
                    className={
                        styles.summaryLabel
                    }
                >

                    表示件数

                </span>

                <strong
                    className={
                        styles.summaryValue
                    }
                >

                    {page_size}

                </strong>

            </div>

        </section>

    )

}