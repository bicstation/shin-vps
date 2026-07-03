// ============================================================================
// FILE:
// /app/ranking/components/RankingCard.tsx
// Copyright (c) 2024 Shin Corporation.
// All rights reserved.
// ============================================================================

'use client'

/* ============================================================================
🔥 Next
============================================================================ */

import Link
    from 'next/link'

/* ============================================================================
🔥 Semantic Icon
============================================================================ */

import SemanticIcon
    from '@/shared/lib/ui/semantic/SemanticIcon'

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

    item: RankingItem

}

/* ============================================================================
🔥 Ranking Card
============================================================================ */

export default function RankingCard({

    item,

}: Props) {

    /* =========================================================================
    🔥 Presentation Assets
    ========================================================================= */

    const backgroundImage =

        `/images/discover/${item.slug}.png`

    const title =

        item.title

        ||

        item.name

    const description =

        item.description

        ||

        'おすすめランキングをご覧いただけます。'

    /* =========================================================================
    🔥 Render
    ========================================================================= */

    return (

        <Link

            href={`/ranking/${item.slug}`}

            className={
                styles.rankingCard
            }

            style={{

                backgroundImage:

                    `url(${backgroundImage})`,

                backgroundSize:

                    'cover',

                backgroundPosition:

                    'center',

            }}

        >

            {/* ==========================================================
            Overlay
            ========================================================== */}

            <div
                className={
                    styles.rankingCardOverlay
                }
            />

            {/* ==========================================================
            Icon
            ========================================================== */}

            <div
                className={
                    styles.rankingCardIcon
                }
            >

                <SemanticIcon

                    icon={
                        item.icon
                    }

                    color={
                        item.color
                    }

                    size={28}

                />

            </div>

            {/* ==========================================================
            Content
            ========================================================== */}

            <div
                className={
                    styles.rankingCardContent
                }
            >

                {/* ======================================================
                Title
                ====================================================== */}

                <h3
                    className={
                        styles.rankingCardTitle
                    }
                >

                    {title}

                </h3>

                {/* ======================================================
                Description
                ====================================================== */}

                <p
                    className={
                        styles.rankingCardDescription
                    }
                >

                    {description}

                </p>

                {/* ======================================================
                Meta
                ====================================================== */}

                <div
                    className={
                        styles.rankingCardMeta
                    }
                >

                    {

                        item.product_count !== undefined && (

                            <span>

                                {item.product_count.toLocaleString()}

                                件の商品

                            </span>

                        )

                    }

                    {

                        item.attribute_count !== undefined && (

                            <span>

                                {item.attribute_count}

                                カテゴリ

                            </span>

                        )

                    }

                </div>

            </div>

            {/* ==========================================================
            Footer
            ========================================================== */}

            <div
                className={
                    styles.rankingCardFooter
                }
            >

                <span
                    className={
                        styles.rankingCardLink
                    }
                >

                    ランキングを見る →

                </span>

            </div>

        </Link>

    )

}