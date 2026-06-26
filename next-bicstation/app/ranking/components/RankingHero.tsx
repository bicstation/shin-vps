// ============================================================================
// FILE:
// /app/ranking/components/RankingHero.tsx
// Copyright (c) 2024 Shin Corporation.
// All rights reserved.
// ============================================================================

'use client'

/* ============================================================================
🔥 Types
============================================================================ */

import type {

    RankingRuntime,

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

    runtime:
        RankingRuntime

}

/* ============================================================================
🔥 Ranking Hero
============================================================================ */

export default function RankingHero({

    runtime,

}: Props) {

    /* =========================================================================
    🔥 Runtime
    ========================================================================= */

    const totalRankings =

        runtime.navigation.length

    /* =========================================================================
    🔥 Presentation
    =========================================================================
    TODO:
    Replace with Presentation Runtime after Backend V2 adoption.

    presentation.title
    presentation.subtitle
    presentation.description
    ========================================================================= */

    const title =

        'PCランキングから探す'

    const subtitle =

        '用途・性能・価格・メーカーなど、あなたに合ったランキングから最適なPCを見つけましょう。'

    const description =

        '総合ランキングをはじめ、AI・ゲーミング・クリエイター・ビジネスなど、目的別ランキングからおすすめ製品を比較できます。'

    /* =========================================================================
    🔥 Render
    ========================================================================= */

    return (

        <section
            className={
                styles.rankingHero
            }
        >

            {/* ==========================================================
            LEFT
            ========================================================== */}

            <div
                className={
                    styles.rankingHeroContent
                }
            >

                {/* ======================================================
                LABEL
                ====================================================== */}

                <div
                    className={
                        styles.rankingHeroLabel
                    }
                >

                    RANKING EXPERIENCE

                </div>

                {/* ======================================================
                TITLE
                ====================================================== */}

                <h1
                    className={
                        styles.rankingHeroTitle
                    }
                >

                    {title}

                </h1>

                {/* ======================================================
                SUBTITLE
                ====================================================== */}

                <p
                    className={
                        styles.rankingHeroSubtitle
                    }
                >

                    {subtitle}

                </p>

                {/* ======================================================
                DESCRIPTION
                ====================================================== */}

                <p
                    className={
                        styles.rankingHeroDescription
                    }
                >

                    {description}

                </p>

                {/* ======================================================
                STATS
                ====================================================== */}

                <div
                    className={
                        styles.rankingHeroStats
                    }
                >

                    <div
                        className={
                            styles.rankingHeroStat
                        }
                    >

                        <span
                            className={
                                styles.rankingHeroStatLabel
                            }
                        >

                            公開ランキング

                        </span>

                        <strong
                            className={
                                styles.rankingHeroStatValue
                            }
                        >

                            {totalRankings}

                        </strong>

                    </div>

                    <div
                        className={
                            styles.rankingHeroStat
                        }
                    >

                        <span
                            className={
                                styles.rankingHeroStatLabel
                            }
                        >

                            Featured

                        </span>

                        <strong
                            className={
                                styles.rankingHeroStatValue
                            }
                        >

                            ALL

                        </strong>

                    </div>

                </div>

            </div>

            {/* ==========================================================
            RIGHT
            ========================================================== */}

            <div
                className={
                    styles.rankingHeroVisual
                }
            />

        </section>

    )

}