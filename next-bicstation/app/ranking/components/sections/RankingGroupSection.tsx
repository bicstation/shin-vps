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
    from './RankingCardGrid'

/* ============================================================================
🔥 Types
============================================================================ */

import type {

    NavigationRuntimeItem,

} from '@/shared/lib/api/django/pc/navigation/contracts'

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

    items: NavigationRuntimeItem[]

    actionLabel?: string

    icon?: string

}

/* ============================================================================
🔥 Ranking Group Section
============================================================================ */

export default function RankingGroupSection({

    title,

    description,

    items,

    actionLabel = 'すべて見る',

    icon = '✨',

}: Props) {

    /* =========================================================================
    🔥 Empty
    ========================================================================= */

    if (

        items.length === 0

    ) {

        return null

    }

    /* =========================================================================
    🔥 Render
    ========================================================================= */

    return (

        <section
            className={styles.section}
        >

            {/* ==========================================================
            Background Layer
            ========================================================== */}

            <div
                className={styles.background}
            />

            {/* ==========================================================
            Content
            ========================================================== */}

            <div
                className={styles.content}
            >

                {/* ======================================================
                Header
                ====================================================== */}

                <header
                    className={styles.header}
                >

                    <div
                        className={styles.heading}
                    >

                        <div
                            className={styles.badge}
                        >

                            <span
                                className={styles.icon}
                            >

                                {icon}

                            </span>

                            <span
                                className={styles.badgeLabel}
                            >

                                CATEGORY

                            </span>

                        </div>

                        <h2
                            className={styles.title}
                        >

                            {title}

                        </h2>

                        {

                            description && (

                                <p
                                    className={styles.description}
                                >

                                    {description}

                                </p>

                            )

                        }

                    </div>

                    <button
                        type="button"
                        className={styles.more}
                    >

                        {actionLabel}

                        →

                    </button>

                </header>

                {/* ======================================================
                Ranking Cards
                ====================================================== */}

                <RankingCardGrid

                    items={items}

                />

            </div>

        </section>

    )

}