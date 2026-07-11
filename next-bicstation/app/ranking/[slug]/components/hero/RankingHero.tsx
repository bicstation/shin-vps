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

    const {

        meaning,

        presentation,

        seo,

        semantic_labels = [],

        semantic_authority,

        ready,

    } = runtime

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

    const heroBackground =

        '/images/ranking/ranking_hero.webp'

    const heroCore =

        '/images/ranking/ranking_ai_core.webp'

    /* =========================================================================
    🔥 Semantic Labels
    ========================================================================= */

    const chips =

        semantic_labels.filter(Boolean)

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

rgba(2,8,25,.88) 42%,

rgba(2,8,25,.58) 100%

),

url(${heroBackground})

                `,

            }}

        >

            <div className={styles.runtimeHeroOverlay} />

            <div className={styles.runtimeHeroInner}>

                {/* ======================================================
                Hero Visual
                ====================================================== */}

                <div
                    className={styles.runtimeHeroVisual}
                >

                    <img

                        src={heroCore}

                        alt="Ranking AI Core"

                        className={styles.runtimeHeroEmblem}

                    />

                </div>

                {/* ======================================================
                Hero Content
                ====================================================== */}

                <div
                    className={styles.runtimeHeroContent}
                >

                    <div
                        className={styles.runtimeHeroBadge}
                    >

                        {badge}

                    </div>

                    <h1
                        className={styles.runtimeHeroTitle}
                    >

                        {title}

                    </h1>

                    {

                        subtitle && (

                            <div
                                className={styles.runtimeHeroSubtitle}
                            >

                                {subtitle}

                            </div>

                        )

                    }

                    {

                        description && (

                            <p
                                className={styles.runtimeHeroDescription}
                            >

                                {description}

                            </p>

                        )

                    }

                    {/* ==================================================
                    Metrics
                    ================================================== */}

                    <div
                        className={styles.runtimeHeroMetrics}
                    >

                        <div
                            className={styles.runtimeHeroMetric}
                        >

                            <span>

                                掲載製品

                            </span>

                            <strong>

                                {totalProducts}

                            </strong>

                        </div>

                        <div
                            className={styles.runtimeHeroMetric}
                        >

                            <span>

                                Runtime

                            </span>

                            <strong>

                                {

                                    ready

                                        ? 'READY'

                                        : 'WAIT'

                                }

                            </strong>

                        </div>

                        <div
                            className={styles.runtimeHeroMetric}
                        >

                            <span>

                                Authority

                            </span>

                            <strong>

                                {

                                    semantic_authority
                                    ??

                                    '-'

                                }

                            </strong>

                        </div>

                    </div>

                    {/* ==================================================
                    Semantic Labels
                    ================================================== */}

                    {

                        chips.length > 0 && (

                            <div
                                className={styles.runtimeHeroChips}
                            >

                                {

                                    chips.map(

                                        (

                                            chip,

                                            index,

                                        ) => (

                                            <span

                                                key={index}

                                                className={styles.runtimeHeroChip}

                                            >

                                                {chip}

                                            </span>

                                        )

                                    )

                                }

                            </div>

                        )

                    }

                    {/* ==================================================
                    Actions
                    ================================================== */}

                    <div
                        className={styles.runtimeHeroActions}
                    >

                        <a

                            href="/discover"

                            className={styles.runtimeHeroPrimaryButton}

                        >

                            関連カテゴリを見る

                        </a>

                    </div>

                </div>

            </div>

        </section>

    )

}