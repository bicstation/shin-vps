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
import ProductImage
    from '@/app/experience/components/product/ProductImage'
import ProductTitle
    from '@/app/experience/components/product/ProductTitle'
import ProductMaker
    from '@/app/experience/components/product/ProductMaker'
import ProductPrice
    from '@/app/experience/components/product/ProductPrice'

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

        // brand,

        image_url,

        price,

        recommendation_reason,

        semantic_labels = [],

    } = product

    console.log(product)

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

                <ProductImage

                    src={image_url}

                    alt={name ?? ''}

                    width={260}

                    height={260}

                    className={styles.image}

                />

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

                <ProductPrice
                    price={price}
                    className={styles.price}
                />

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