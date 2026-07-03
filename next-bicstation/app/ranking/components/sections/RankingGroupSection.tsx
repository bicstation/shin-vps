// ============================================================================
// FILE:
// /app/ranking/components/sections/RankingGroupSection.tsx
// Copyright (c) 2024 Shin Corporation.
// All rights reserved.
// ============================================================================

'use client'

/* ============================================================================
🔥 Components
============================================================================ */

import RankingCardGrid
    from '../RankingCardGrid'

/* ============================================================================
🔥 Types
============================================================================ */

import type {

    RankingItem,

} from '../../types/ranking'

/* ============================================================================
🔥 Styles
============================================================================ */

import styles
    from '../../styles/sections/group-section.module.css'

/* ============================================================================
🔥 Props
============================================================================ */

type Props = {

    title: string

    description?: string

    items: RankingItem[]

    actionLabel?: string

}

/* ============================================================================
🔥 Ranking Group Section
============================================================================ */

export default function RankingGroupSection({

    title,

    description,

    items,

    actionLabel = 'すべて見る',

}: Props) {

    if (

        items.length === 0

    ) {

        return null

    }

    return (

        <section
            className={
                styles.section
            }
        >

            {/* ==========================================================
            Header
            ========================================================== */}

            <header
                className={
                    styles.header
                }
            >

                <div>

                    <h2
                        className={
                            styles.title
                        }
                    >
                        {title}
                    </h2>

                    {

                        description && (

                            <p
                                className={
                                    styles.description
                                }
                            >
                                {description}
                            </p>

                        )

                    }

                </div>

                <button
                    type="button"
                    className={
                        styles.more
                    }
                >

                    {actionLabel}

                    →

                </button>

            </header>

            {/* ==========================================================
            Grid
            ========================================================== */}

            <RankingCardGrid

                items={
                    items
                }

            />

        </section>

    )

}