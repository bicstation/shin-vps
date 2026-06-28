// ============================================================================
// FILE:
// app/ranking/[slug]/components/comparison/ComparisonCard.tsx
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

import type { RankingProduct,} from '../../types/contracts'
import getRankingBadge from '../../lib/getRankingBadge'

/* ============================================================================
🔥 Styles
============================================================================ */

import styles
    from '../../styles/comparison/comparison-card.module.css'

/* ============================================================================
🔥 Props
============================================================================ */

type Props = {

    product: RankingProduct

    rank: number

}

/* ============================================================================
🔥 Comparison Card
============================================================================ */

export default function ComparisonCard({

    product,

    rank,

}: Props) {

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
    
    const badge =
        getRankingBadge(rank)

    return (

        <article
            className={styles.card}
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

                        src={badge}

                        alt={`Ranking Core ${rank}`}

                        width={44}

                        height={44}

                        className={styles.badgeIcon}

                    />

                    <span>
                        TOP ${rank}
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

                    image_url

                        ? (

                            <Image

                                src={image_url}

                                alt={name ?? ''}

                                width={420}

                                height={420}

                                className={styles.image}

                                unoptimized

                            />

                        )

                        : (

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

                            {recommendation_reason}

                        </p>

                    )

                }

                {

                    semantic_labels.length > 0 && (

                        <div
                            className={
                                styles.chips
                            }
                        >

                            {

                                semantic_labels
                                    .slice(0, 4)
                                    .map(

                                        (

                                            label,

                                            index,

                                            slug,

                                        ) => (

                                            <Link

                                                key={index}

                                                href={`/discover/${encodeURIComponent(slug)}`}

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

                {/* ======================================================
                Footer
                ====================================================== */}

                <div
                    className={styles.footer}
                >

                    {

                        typeof price === 'number' && (

                            <div
                                className={
                                    styles.price
                                }
                            >

                                ¥{price.toLocaleString()}

                            </div>

                        )

                    }

                    {

                        unique_id && (

                            <Link

                                href={href}

                                className={
                                    styles.button
                                }

                            >

                                詳細を見る

                            </Link>

                        )

                    }

                </div>

            </div>

        </article>

    )

}