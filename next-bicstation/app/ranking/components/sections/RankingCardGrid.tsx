// ============================================================================
// FILE:
// /app/ranking/components/sections/RankingCardGrid.tsx
// Copyright (c) 2026 Shin Corporation.
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

    RankingCategoryGroup,

} from '@/shared/lib/api/django/pc/ranking/contracts'

/* ============================================================================
🔥 Styles
============================================================================ */

import styles
    from '../../styles/sections/grid-section.module.css'

/* ============================================================================
🔥 Props
============================================================================ */

type Props = {

    items: RankingCategoryGroup[]

}

/* ============================================================================
🔥 Ranking Card Grid
============================================================================ */

export default function RankingCardGrid({

    items,

}: Props) {

    if (!items.length) {

        return null

    }

    return (

        <div
            className={styles.rankingGrid}
        >

            {items.map(

                item => (

                    <RankingCard

                        key={item.group_slug}

                        item={item}

                    />

                )

            )}

        </div>

    )

}