// ============================================================================
// FILE:
// /app/ranking/components/RankingSummary.tsx
// Copyright (c) 2024 Shin Corporation.
// All rights reserved.
// ============================================================================

'use client'

/* ============================================================================
🔥 Types
============================================================================ */

import type {

    RankingItem,

} from '../types/ranking'

/* ============================================================================
🔥 Styles
============================================================================ */

import styles
    from '../styles/ranking.module.css'

/* ============================================================================
🔥 Props
============================================================================ */

type Props = {

    items:

        RankingItem[]

}

/* ============================================================================
🔥 Ranking Summary
============================================================================ */

export default function RankingSummary({

    items,

}: Props) {

    /* =========================================================================
    🔥 Summary
    ========================================================================= */

    const rankingCount =

        items.length

    const categoryCount =

        new Set(

            items.map(

                item =>

                    item.type

            )

        ).size

    const hasFeatured =

        items.some(

            item =>

                item.slug === 'all'

        )

    /* =========================================================================
    🔥 Render
    ========================================================================= */

    return (

        <section
            className={
                styles.rankingSummary
            }
        >

            {/* ==========================================================
            Ranking Count
            ========================================================== */}

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

                    公開ランキング

                </span>

                <strong
                    className={
                        styles.summaryValue
                    }
                >

                    {rankingCount}

                </strong>

            </div>

            {/* ==========================================================
            Category Count
            ========================================================== */}

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

                    ランキング種別

                </span>

                <strong
                    className={
                        styles.summaryValue
                    }
                >

                    {categoryCount}

                </strong>

            </div>

            {/* ==========================================================
            Featured
            ========================================================== */}

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

                    総合ランキング

                </span>

                <strong
                    className={
                        styles.summaryValue
                    }
                >

                    {

                        hasFeatured

                            ? '公開中'

                            : '準備中'

                    }

                </strong>

            </div>

        </section>

    )

}