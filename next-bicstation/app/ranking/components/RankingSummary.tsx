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
    🔥 Dashboard Cards
    ========================================================================= */

    const cards = [

        {

            label:

                '公開ランキング',

            value:

                rankingCount,

            description:

                '現在公開中のランキング',

            image:

                '/images/ranking/stats-ranking.png',

        },

        {

            label:

                'ランキング種別',

            value:

                categoryCount,

            description:

                '用途・デバイス・モニター',

            image:

                '/images/ranking/stats-category.png',

        },

        {

            label:

                'Featured Ranking',

            value:

                hasFeatured

                    ? '公開中'

                    : '準備中',

            description:

                '総合ランキング',

            image:

                '/images/ranking/stats-featured.png',

        },

    ]

    /* =========================================================================
    🔥 Render
    ========================================================================= */

    return (

        <section
            className={
                styles.rankingSummary
            }
        >

            {

                cards.map((

                    card,

                    index

                ) => (

                    <div

                        key={index}

                        className={
                            styles.summaryItem
                        }

                    >

                        {/* ======================================================
                        Background
                        ====================================================== */}

                        <div

                            className={
                                styles.summaryBackground
                            }

                            style={{

                                backgroundImage:

                                    `url(${card.image})`,

                            }}

                        />

                        {/* ======================================================
                        Overlay
                        ====================================================== */}

                        <div
                            className={
                                styles.summaryOverlay
                            }
                        />

                        {/* ======================================================
                        Content
                        ====================================================== */}

                        <div
                            className={
                                styles.summaryContent
                            }
                        >

                            <span
                                className={
                                    styles.summaryLabel
                                }
                            >

                                {card.label}

                            </span>

                            <strong
                                className={
                                    styles.summaryValue
                                }
                            >

                                {card.value}

                            </strong>

                            <p
                                className={
                                    styles.summaryDescription
                                }
                            >

                                {card.description}

                            </p>

                        </div>

                    </div>

                ))

            }

        </section>

    )

}