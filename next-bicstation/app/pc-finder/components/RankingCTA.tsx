// ============================================================================
// FILE:
// /app/pc-finder/components/RankingCTA.tsx
// Copyright (c) 2026 Shin Corporation.
// ============================================================================

'use client'

/* ============================================================================
Next
============================================================================ */

import Link
    from 'next/link'

/* ============================================================================
Styles
============================================================================ */

import styles
    from '../styles/pcFinder.module.css'

/* ============================================================================
Ranking CTA
============================================================================ */

export default function RankingCTA() {

    return (

        <div
            className={
                styles.rankingCTA
            }
        >

            <div
                className={
                    styles.rankingCTAContent
                }
            >

                <span
                    className={
                        styles.rankingCTALabel
                    }
                >

                    NEXT STEP

                </span>

                <h2
                    className={
                        styles.rankingCTATitle
                    }
                >

                    さらに比較して、
                    あなたに最適な一台を見つけましょう。

                </h2>

                <p
                    className={
                        styles.rankingCTADescription
                    }
                >

                    Finderで見つけた候補を、
                    ランキングページで詳しく比較できます。

                </p>

            </div>

            <Link

                href="/ranking/all"

                className={
                    styles.rankingCTAButton
                }

            >

                総合ランキングを見る →

            </Link>

        </div>

    )

}