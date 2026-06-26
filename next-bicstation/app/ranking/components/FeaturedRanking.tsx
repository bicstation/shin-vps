// ============================================================================
// FILE:
// /app/ranking/components/FeaturedRanking.tsx
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
🔥 Featured Ranking
============================================================================ */

export default function FeaturedRanking({

    items,

}: Props) {

    /* =========================================================================
    🔥 Find "all"
    ========================================================================= */

    const featured =

        items.find(

            item =>

                item.slug === 'all'

        )

    if (

        !featured

    ) {

        return null

    }

    /* =========================================================================
    🔥 Render
    ========================================================================= */

    return (

        <section
            className={
                styles.featuredRanking
            }
        >

            {/* ==========================================================
            LABEL
            ========================================================== */}

            <div
                className={
                    styles.featuredLabel
                }
            >

                ★ FEATURED RANKING

            </div>

            {/* ==========================================================
            CONTENT
            ========================================================== */}

            <div
                className={
                    styles.featuredCard
                }
            >

                <div
                    className={
                        styles.featuredContent
                    }
                >

                    <h2
                        className={
                            styles.featuredTitle
                        }
                    >

                        {

                            featured.title

                            ||

                            featured.name

                        }

                    </h2>

                    <p
                        className={
                            styles.featuredDescription
                        }
                    >

                        {

                            featured.description

                            ||

                            '公開中のすべてのランキングから代表的なおすすめ製品をご紹介します。'

                        }

                    </p>

                    <div
                        className={
                            styles.featuredMeta
                        }
                    >

                        <span>

                            {featured.product_count ?? 0}

                            製品

                        </span>

                        <span>

                            {featured.attribute_count ?? 0}

                            属性

                        </span>

                    </div>

                    <Link

                        href={`/ranking/${featured.slug}`}

                        className={
                            styles.featuredButton
                        }
                    >

                        総合ランキングを見る →

                    </Link>

                </div>

            </div>

        </section>

    )

}