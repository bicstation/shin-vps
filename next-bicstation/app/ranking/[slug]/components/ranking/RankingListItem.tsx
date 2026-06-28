// ============================================================================
// FILE:
// /app/ranking/[slug]/components/ranking/RankingListItem.tsx
// ============================================================================

'use client'

/* ============================================================================
🔥 Next
============================================================================ */

import Image from 'next/image'
import Link from 'next/link'

/* ============================================================================
🔥 Contracts
============================================================================ */

import type {
    RankingProduct,
} from '../../types/contracts'

/* ============================================================================
🔥 Badge
============================================================================ */

import getRankingBadge
    from '../../lib/getRankingBadge'

/* ============================================================================
🔥 Styles
============================================================================ */

import styles
    from '../../styles/ranking/ranking-list-item.module.css'

/* ============================================================================
🔥 Props
============================================================================ */

type Props = {

    product: RankingProduct

    rank: number

}

/* ============================================================================
🔥 Ranking List Item
============================================================================ */

export default function RankingListItem({

    product,

    rank,

}: Props) {

    /* =========================================================================
    🔥 Product
    ========================================================================= */

    const {

        unique_id,

        name,

        maker,

        brand,

        image_url,

        price,

        recommendation_reason,

        semantic_labels = [],

    } = product

    const href =

        unique_id
            ? `/product/${unique_id}`
            : '#'

    const badgeImage =

        getRankingBadge(rank)

    /* =========================================================================
    🔥 Render
    ========================================================================= */

    return (

        <article
            className={styles.item}
        >

            {/* ==========================================================
            Header
            ========================================================== */}

            <header
                className={styles.header}
            >

                <div
                    className={styles.badge}
                >

                    <Image

                        src={badgeImage}

                        alt={`Ranking Core ${rank}`}

                        width={26}

                        height={26}

                        className={styles.badgeIcon}

                    />

                    <span>

                        RANKING CORE #{rank}

                    </span>

                </div>

                <div
                    className={styles.rank}
                >

                    #{rank}

                </div>

            </header>

            {/* ==========================================================
            Image
            ========================================================== */}

            <div
                className={styles.imageArea}
            >

                {

                    image_url ? (

                        <Image

                            src={image_url}

                            alt={name ?? ''}

                            width={260}

                            height={260}

                            className={styles.image}

                            unoptimized

                        />

                    ) : (

                        <div
                            className={
                                styles.imagePlaceholder
                            }
                        >

                            NO IMAGE

                        </div>

                    )

                }

            </div>

            {/* ==========================================================
            Content
            ========================================================== */}

            <div
                className={styles.content}
            >

                <h3
                    className={styles.title}
                >

                    {name}

                </h3>

                {

                    (maker || brand) && (

                        <div
                            className={styles.brand}
                        >

                            {maker ?? brand}

                        </div>

                    )

                }

                {

                    recommendation_reason && (

                        <p
                            className={
                                styles.description
                            }
                        >

                            {

                                recommendation_reason.length > 140

                                    ? `${recommendation_reason.slice(0, 140)}…`

                                    : recommendation_reason

                            }

                        </p>

                    )

                }

                {

                    semantic_labels.length > 0 && (

                        <div
                            className={styles.chips}
                        >

                            {

                                semantic_labels

                                    .slice(0, 4)

                                    .map(

                                        (

                                            label,

                                            index,

                                        ) => (

                                            <Link

                                                key={index}

                                                href={`/discover/${encodeURIComponent(label)}`}

                                                className={
                                                    styles.chip
                                                }

                                            >

                                                {label}

                                            </Link>

                                        )

                                    )

                            }

                        </div>

                    )

                }

            </div>

            {/* ==========================================================
            Footer
            ========================================================== */}

            <div
                className={styles.side}
            >

                {

                    typeof price === 'number' && (

                        <div
                            className={styles.price}
                        >

                            ¥{price.toLocaleString()}

                        </div>

                    )

                }

                {

                    unique_id && (

                        <Link

                            href={href}

                            className={styles.button}

                        >

                            製品の詳細を見る

                        </Link>

                    )

                }

            </div>

        </article>

    )

}