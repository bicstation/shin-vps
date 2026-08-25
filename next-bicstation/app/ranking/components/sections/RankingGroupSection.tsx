// ============================================================================
// FILE:
// /app/ranking/components/sections/RankingGroupSection.tsx
// Copyright (c) 2026 Shin Corporation.
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
    ProjectedRankingCategory,
} from '@/shared/lib/api/django/pc/ranking/projection'

/* ============================================================================
🔥 Styles
============================================================================ */

import styles
    from '../../styles/sections/group-section.module.css'

/* ============================================================================
🔥 Props
============================================================================ */

type Props = {

    category: ProjectedRankingCategory

    actionLabel?: string

    icon?: string

}

/* ============================================================================
🔥 Ranking Group Section
============================================================================ */

export default function RankingGroupSection({

    category,

    actionLabel = 'すべて見る',

    icon = '✨',

}: Props) {

    /* =========================================================================
    🔥 Category Groups
    ========================================================================= */

    const items =
        category.groups ?? []

    /* =========================================================================
    🔥 Empty
    ========================================================================= */

    if (!items.length) {

        return null

    }

    /* =========================================================================
    🔥 Presentation
    ========================================================================= */

    const title =
        category.presentationName
        ||
        category.parentGroup

    /* =========================================================================
    🔥 Render
    ========================================================================= */

    return (

        <section
            className={styles.section}
        >

            {/* ==========================================================
            Background
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