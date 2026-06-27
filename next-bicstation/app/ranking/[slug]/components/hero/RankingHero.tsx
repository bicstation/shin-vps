// ============================================================================
// FILE:
// /home/maya/shin-vps/next-bicstation/app/ranking/[slug]/components/hero/RankingHero.tsx
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
    🔥 Runtime
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

    const badge =

        meaning?.identity
        ??

        'FEATURED RANKING'

    /* =========================================================================
    🔥 Assets
    ========================================================================= */

    const heroImage =

        '/images/ranking/ranking_hero.png'

    const heroCore =

        '/images/ranking/ranking_ai_core.png'

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

90deg,

rgba(2,8,25,.96) 0%,

rgba(2,8,25,.88) 45%,

rgba(2,8,25,.55) 100%

),

url(${heroImage})

                `,

            }}

        >

            <div className={styles.runtimeHeroOverlay} />

            <div className={styles.runtimeHeroInner}>

                {/* ======================================================
                Left
                ====================================================== */}

                <div
                    className={
                        styles.runtimeHeroVisual
                    }
                >

                    <img

                        src={heroCore}

                        alt="Ranking AI Core"

                        className={
                            styles.runtimeHeroEmblem
                        }

                    />

                </div>

                {/* ======================================================
                Right
                ====================================================== */}

                <div
                    className={
                        styles.runtimeHeroContent
                    }
                >

                    <div
                        className={
                            styles.runtimeHeroBadge
                        }
                    >

                        {badge}

                    </div>

                    <h1
                        className={
                            styles.runtimeHeroTitle
                        }
                    >

                        {title}

                    </h1>

                    {

                        subtitle && (

                            <div
                                className={
                                    styles.runtimeHeroSubtitle
                                }
                            >

                                {subtitle}

                            </div>

                        )

                    }

                    {

                        description && (

                            <p
                                className={
                                    styles.runtimeHeroDescription
                                }
                            >

                                {description}

                            </p>

                        )

                    }

                    {/* ==================================================
                    Metrics
                    ================================================== */}

                    <div
                        className={
                            styles.runtimeHeroMetrics
                        }
                    >

                        <div
                            className={
                                styles.runtimeHeroMetric
                            }
                        >

                            <span>

                                掲載製品

                            </span>

                            <strong>

                                {totalProducts}

                            </strong>

                        </div>

                        <div
                            className={
                                styles.runtimeHeroMetric
                            }
                        >

                            <span>

                                ランキング

                            </span>

                            <strong>

                                公開中

                            </strong>

                        </div>

                        <div
                            className={
                                styles.runtimeHeroMetric
                            }
                        >

                            <span>

                                EXPERIENCE

                            </span>

                            <strong>

                                V2

                            </strong>

                        </div>

                    </div>

                    {/* ==================================================
                    Semantic Labels
                    ================================================== */}

                    {

                        chips.length > 0 && (

                            <div
                                className={
                                    styles.runtimeHeroChips
                                }
                            >

                                {

                                    chips.map(

                                        (

                                            chip,

                                            index,

                                        ) => (

                                            <span

                                                key={index}

                                                className={
                                                    styles.runtimeHeroChip
                                                }

                                            >

                                                {chip}

                                            </span>

                                        )

                                    )

                                }

                            </div>

                        )

                    }

                </div>

            </div>

        </section>

    )

}