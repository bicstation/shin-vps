// ============================================================================
// FILE:
// /app/ranking/components/RankingCardGrid.tsx
// Copyright (c) 2024 Shin Corporation.
// All rights reserved.
// ============================================================================

'use client'

/* ============================================================================
🔥 Components
============================================================================ */

import RankingCard
    from './RankingCard'

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
🔥 Ranking Card Grid
============================================================================ */

export default function RankingCardGrid({

    items,

}: Props) {

    return (


        <section
            className={
                styles.rankingSection
            }
        >

            <header
                className={
                    styles.rankingSectionHeader
                }
            >

                <h2
                    className={
                        styles.rankingSectionTitle
                    }
                >

                    公開中のランキング

                </h2>

                <p
                    className={
                        styles.rankingSectionDescription
                    }
                >

                    用途・価格帯・メーカーなど、
                    公開中のランキングから比較できます。

                </p>

            </header>

            <div
                className={
                    styles.rankingGrid
                }
            >

                {items.map(item => (

                    <RankingCard
                        key={item.slug}
                        item={item}
                    />

                ))}

            </div>

        </section>

    )

}