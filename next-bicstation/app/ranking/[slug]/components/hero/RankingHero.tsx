// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/[slug]/components/hero/RankingHero.tsx
// Copyright (c) 2024 Shin Corporation.
// All rights reserved.
// ============================================================================

'use client'

/* ============================================================================
🔥 Contracts
============================================================================ */

import type {

    SemanticRankingRuntime,

} from '../../types/contracts'

/* ============================================================================
🔥 Styles
============================================================================ */

import styles
    from '../../styles/hero/hero.module.css'

/* ============================================================================
🔥 Props
============================================================================ */

type Props = {

    runtime: SemanticRankingRuntime

    totalProducts?: number

}

/* ============================================================================
🔥 Ranking Hero
============================================================================ */

export default function RankingHero({

    runtime,

    totalProducts = 0,

}: Props) {

    /* =========================================================================
    🔥 Meaning Layer
    ========================================================================= */

    const meaning =

        runtime.meaning

    const presentation =

        runtime.presentation

    const seo =

        runtime.seo

    /* =========================================================================
    🔥 Presentation
    ========================================================================= */

    const title =

        presentation?.title

        ??

        seo?.title

        ??

        'PCランキング'

    const subtitle =

        presentation?.subtitle

        ??

        ''

    const description =

        presentation?.description

        ??

        seo?.description

        ??

        ''

    /* =========================================================================
    🔥 Hero
    ========================================================================= */

    const badge =

        meaning?.identity

        ??

        'FEATURED RANKING'

    const heroImage =

         '/images/ranking/ranking_hero.png'

    /* =========================================================================
    🔥 Semantic Chips
    ========================================================================= */

    const chips =

        runtime.semantic_labels

        ??

        []

    /* =========================================================================
    🔥 Render
    ========================================================================= */

    return (

        <section

            className={styles.runtimeHero}

            style={{

                backgroundImage: `

linear-gradient(
rgba(5,15,40,.82),
rgba(5,15,40,.72)
),

url(${heroImage})

                `,

            }}

        >

            <div className={styles.runtimeHeroOverlay} />

            <div className={styles.runtimeHeroInner}>

                {/* ======================================================
                Badge
                ====================================================== */}

                <div className={styles.runtimeHeroBadge}>

                    {badge}

                </div>

                {/* ======================================================
                Title
                ====================================================== */}

                <h1 className={styles.runtimeHeroTitle}>

                    {title}

                </h1>

                {/* ======================================================
                Subtitle
                ====================================================== */}

                {

                    subtitle && (

                        <div className={styles.runtimeHeroSubtitle}>

                            {subtitle}

                        </div>

                    )

                }

                {/* ======================================================
                Description
                ====================================================== */}

                {

                    description && (

                        <p className={styles.runtimeHeroDescription}>

                            {description}

                        </p>

                    )

                }

                {/* ======================================================
                Metrics
                ====================================================== */}

                <div className={styles.runtimeHeroMetrics}>

                    <div className={styles.runtimeHeroMetric}>

                        <span>

                            掲載製品

                        </span>

                        <strong>

                            {totalProducts}

                        </strong>

                    </div>

                    <div className={styles.runtimeHeroMetric}>

                        <span>

                            ランキング

                        </span>

                        <strong>

                            公開中

                        </strong>

                    </div>

                    <div className={styles.runtimeHeroMetric}>

                        <span>

                            Experience

                        </span>

                        <strong>

                            V2

                        </strong>

                    </div>

                </div>

                {/* ======================================================
                Semantic Chips
                ====================================================== */}

                {

                    chips.length > 0 && (

                        <div className={styles.runtimeHeroChips}>

                            {

                                chips.map(

                                    (

                                        chip,

                                        index,

                                    ) => (

                                        <div

                                            key={index}

                                            className={styles.runtimeHeroChip}

                                        >

                                            {chip}

                                        </div>

                                    )

                                )

                            }

                        </div>

                    )

                }

            </div>

        </section>

    )

}