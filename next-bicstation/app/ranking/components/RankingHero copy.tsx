// ============================================================================
// FILE:
// /app/ranking/components/RankingHero.tsx
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
    🔥 Runtime (Canonical Runtime V2)
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

            <div
                className={
                    styles.rankingHeroContent
                }
            >

                <div
                    className={
                        styles.rankingHeroLabel
                    }
                >
                    RANKING EXPERIENCE
                </div>

                <h1
                    className={
                        styles.rankingHeroTitle
                    }
                >
                    {title}
                </h1>

                <p
                    className={
                        styles.rankingHeroSubtitle
                    }
                >
                    {subtitle}
                </p>

                <p
                    className={
                        styles.rankingHeroDescription
                    }
                >
                    {description}
                </p>

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

            <div
                className={
                    styles.rankingHeroVisual
                }
            />

        </section>

    )

}