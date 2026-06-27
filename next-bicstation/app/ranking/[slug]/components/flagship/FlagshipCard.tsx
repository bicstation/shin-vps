// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/[slug]/components/flagship/FlagshipCard.tsx
// Copyright (c) 2024 Shin Corporation.
// All rights reserved.
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
🔥 Styles
============================================================================ */

import styles
    from '../../styles/flagship/flagship.module.css'

/* ============================================================================
🔥 Props
============================================================================ */

type Props = {

    product: RankingProduct

    rank: number

}

/* ============================================================================
🔥 Flagship Card
============================================================================ */

export default function FlagshipCard({

    product,

    rank,

}: Props) {

    /* =========================================================================
    🔥 Product
    ========================================================================= */

    console.log(product)

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

    /* =========================================================================
    🔥 Render
    ========================================================================= */

    return (

        <section className={styles.flagship}>

            {/* ==========================================================
            Rank
            ========================================================== */}

            <div className={styles.rank}>

                #{rank}

            </div>

            {/* ==========================================================
            Image
            ========================================================== */}

            <div className={styles.imageArea}>

                {

                    image_url

                        ? (
                            <img

                                src={image_url}

                                alt={name ?? ''}

                                className={styles.image}

                            />
  
                        )

                        : (

                            <div className={styles.imagePlaceholder}>

                                NO IMAGE

                            </div>

                        )

                }

            </div>

            {/* ==========================================================
            Content
            ========================================================== */}

            <div className={styles.content}>

                <div className={styles.badge}>

                    FEATURED RANKING

                </div>

                <h2 className={styles.title}>

                    {name ?? 'Unknown Product'}

                </h2>

                {

                    (maker || brand) && (

                        <div className={styles.brand}>

                            {maker ?? brand}

                        </div>

                    )

                }

                {

                    recommendation_reason && (

                        <p className={styles.description}>

                            {recommendation_reason}

                        </p>

                    )

                }

                {

                    semantic_labels.length > 0 && (

                        <div className={styles.chips}>

                            {

                                semantic_labels.map(

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

                {

                    typeof price === 'number' && (

                        <div className={styles.price}>

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

                            詳細を見る

                        </Link>

                    )

                }

            </div>

        </section>

    )

}