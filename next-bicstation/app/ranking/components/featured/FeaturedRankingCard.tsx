// ============================================================================
// FILE:
// /app/ranking/components/featured/FeaturedRankingCard.tsx
// Copyright (c) 2026 Shin Corporation.
// All rights reserved.
// ============================================================================

'use client'

/**
 * ============================================================================
 * SHIN CORE LINX
 * Featured Ranking Card
 * ============================================================================
 *
 * Responsibilities
 *
 * - Display one Featured Ranking Product
 * - Create lightweight Hero presentation title
 *
 * This component SHALL NOT:
 *
 * - fetch Runtime
 * - modify Backend Reality
 * - calculate rankings
 * - filter products
 *
 * Runtime Authority:
 *
 * FeaturedRankingGrid
 *
 * ============================================================================
 */

/* ============================================================================
🔥 Next
============================================================================ */

import Link
    from 'next/link'

/* ============================================================================
🔥 Types
============================================================================ */

import type {

    RankingProduct,

} from '@/shared/lib/api/django/pc/ranking/contracts'

/* ============================================================================
🔥 Styles
============================================================================ */

import styles
    from '../../styles/featured/featured-card.module.css'

/* ============================================================================
🔥 Props
============================================================================ */

type Props = {

    product: RankingProduct

    rank: number

}

/* ============================================================================
🔥 Medal
============================================================================ */

function getMedal(

    rank: number,

) {

    switch (rank) {

        case 1:
            return '🥇'

        case 2:
            return '🥈'

        case 3:
            return '🥉'

        default:
            return `#${rank}`

    }

}

/* ============================================================================
🔥 Hero Title
============================================================================ */

function getFeaturedTitle(

    name: string,

) {

    let title = name

        /* --------------------------------------------------------------------
        Remove specification blocks
        -------------------------------------------------------------------- */

        .replace(
            /\s*[\[【（(].*$/,
            ''
        )

        .trim()

        /* --------------------------------------------------------------------
        Remove leading model / SKU code
        -------------------------------------------------------------------- */

        .replace(
            /^[A-Z0-9][A-Z0-9._-]{5,}\s+(?=[A-Za-z])/,
            ''
        )

        .trim()

    /* ------------------------------------------------------------------------
    Safety
    ------------------------------------------------------------------------ */

    if (!title) {

        title = name

    }

    /* ------------------------------------------------------------------------
    Final length limit
    ------------------------------------------------------------------------ */

    if (title.length > 48) {

        return `${title.slice(0, 48).trim()}…`

    }

    return title

}

/* ============================================================================
🔥 Featured Ranking Card
============================================================================ */

export default function FeaturedRankingCard({

    product,

    rank,

}: Props) {

    /* =========================================================================
    🔥 Presentation
    ========================================================================= */

    const medal =
        getMedal(rank)

    const title =
        getFeaturedTitle(product.name)

    const image =
        product.image_url

    const href =
        `/product/${product.unique_id}`

    const price =
        product.price

    /* =========================================================================
    🔥 Render
    ========================================================================= */

    return (

        <article
            className={styles.card}
        >

            {/* ==========================================================
            Medal
            ========================================================== */}

            <div
                className={styles.medal}
            >

                {medal}

            </div>

            {/* ==========================================================
            Thumbnail
            ========================================================== */}

            <div
                className={styles.thumbnail}
            >

                {

                    image

                        ? (

                            <img

                                src={image}

                                alt={title}

                                className={styles.image}

                            />

                        )

                        : (

                            <div
                                className={styles.placeholder}
                            />

                        )

                }

            </div>

            {/* ==========================================================
            Body
            ========================================================== */}

            <div
                className={styles.body}
            >

                <h3
                    className={styles.title}
                >

                    {title}

                </h3>

                {

                    typeof price === 'number' && (

                        <p
                            className={styles.price}
                        >

                            ¥{price.toLocaleString()}

                        </p>

                    )

                }

            </div>

            {/* ==========================================================
            Action
            ========================================================== */}

            <Link

                href={href}

                className={styles.button}

            >

                製品を見る →

            </Link>

        </article>

    )

}