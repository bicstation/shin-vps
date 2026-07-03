// ============================================================================
// FILE:
// /app/ranking/components/hero/RankingHero.tsx
// Copyright (c) 2024 Shin Corporation.
// All rights reserved.
// ============================================================================

'use client'

/* ============================================================================
🔥 Types
============================================================================ */

import type {

    RankingRuntime,

} from '../../types/ranking'

/* ============================================================================
🔥 Styles
============================================================================ */

import styles
    from '../../styles/hero/hero.module.css'

/* ============================================================================
🔥 Props
============================================================================ */

type Props = {

    runtime: RankingRuntime

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

        runtime.intents.length

    /* =========================================================================
    🔥 Presentation
    ========================================================================= */

    const title =

        'PCランキングから探す'

    const subtitle =

        '用途・性能・価格・メーカーなど、あなたに合ったランキングから最適なPCを見つけましょう。'

    const description =

        '総合ランキングから用途別・デバイス別・パーツ別ランキングまで、目的に応じた比較をサポートします。'

    /* =========================================================================
    🔥 Render
    ========================================================================= */

    return (

        <section
            className={
                styles.rankingHero
            }
        >

            <div
                className={
                    styles.rankingHeroContent
                }
            >

                {/* ==========================================================
                Label
                ========================================================== */}

                <div
                    className={
                        styles.rankingHeroLabel
                    }
                >

                    RANKING EXPERIENCE

                </div>

                {/* ==========================================================
                Title
                ========================================================== */}

                <h1
                    className={
                        styles.rankingHeroTitle
                    }
                >

                    {title}

                </h1>

                {/* ==========================================================
                Subtitle
                ========================================================== */}

                <p
                    className={
                        styles.rankingHeroSubtitle
                    }
                >

                    {subtitle}

                </p>

                {/* ==========================================================
                Description
                ========================================================== */}

                <p
                    className={
                        styles.rankingHeroDescription
                    }
                >

                    {description}

                </p>

                {/* ==========================================================
                Statistics
                ========================================================== */}

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

                            総合ランキング

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

        </section>

    )

}