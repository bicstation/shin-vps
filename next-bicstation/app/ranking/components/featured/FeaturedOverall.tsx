// ============================================================================
// FILE:
// /app/ranking/components/featured/FeaturedOverall.tsx
// Copyright (c) 2024 Shin Corporation.
// All rights reserved.
// ============================================================================

'use client'

/**
 * ============================================================================
 * SHIN CORE LINX
 * Featured Overall Experience
 * ============================================================================
 *
 * Responsibilities
 *
 * - Compose Featured Overall Experience
 * - Pass Runtime to child components
 *
 * This component SHALL NOT:
 *
 * - fetch Runtime
 * - modify Runtime
 * - calculate rankings
 * - perform sorting
 *
 * Runtime Authority:
 *
 * useRanking()
 *
 * ============================================================================
 */

/* ============================================================================
🔥 Components
============================================================================ */

import FeaturedHero
    from './FeaturedHero'

import FeaturedRankingGrid
    from './FeaturedRankingGrid'

/* ============================================================================
🔥 Types
============================================================================ */

import type {

    SemanticRankingRuntime,

} from '@/shared/lib/api/django/pc/ranking/contracts'

/* ============================================================================
🔥 Styles
============================================================================ */

import styles
    from '../../styles/featured/featured-overall.module.css'

/* ============================================================================
🔥 Props
============================================================================ */

type Props = {

    runtime: SemanticRankingRuntime

}

/* ============================================================================
🔥 Featured Overall Experience
============================================================================ */

export default function FeaturedOverall({

    runtime,

}: Props) {

    /* =========================================================================
    🔥 Products
    ========================================================================= */

    const products =

        runtime.data.products ?? []

    /* =========================================================================
    🔥 Render
    ========================================================================= */

    return (

        <section
            className={styles.featuredOverall}
        >

            {/* ==========================================================
            Featured Hero
            ========================================================== */}

            <FeaturedHero />

            {/* ==========================================================
            Featured Top 3
            ========================================================== */}

            <FeaturedRankingGrid

                items={products}

            />

        </section>

    )

}