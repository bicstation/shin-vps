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

import RecommendationReason
    from '@/app/experience/components/product/RecommendationReason'
import ProductTitle
    from '@/app/experience/components/product/ProductTitle'
import ProductMaker
    from '@/app/experience/components/product/ProductMaker'
import ProductImage
    from '@/app/experience/components/product/ProductImage'
import ProductPrice
    from '@/app/experience/components/product/ProductPrice'

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

        // brand,

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
                        TOP {rank}
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
                <ProductTitle
                    title={name}
                    className={styles.title}
                />

                <ProductMaker
                    maker={maker}
                    className={styles.brand}
                />

                <RecommendationReason
                    reason={recommendation_reason}
                    className={styles.description}
                />


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
                                            <span
                                                key={index}
                                                className={styles.chip}
                                            >
                                                {label}
                                            </span>
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
                    <ProductPrice
                        price={price}
                        className={styles.price}
                    />

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