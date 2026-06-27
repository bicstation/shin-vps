// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/[slug]/components/continuation/RankingContinuation.tsx
// Copyright (c) 2024 Shin Corporation.
// All rights reserved.
// ============================================================================

'use client'

/* ============================================================================
🔥 Next
============================================================================ */

import Link
    from 'next/link'

/* ============================================================================
🔥 Styles
============================================================================ */

import styles
    from '../../styles/continuation/continuation.module.css'

/* ============================================================================
🔥 Ranking Continuation
============================================================================ */

export default function RankingContinuation() {

    return (

        <section
            className={styles.section}
        >

            <div
                className={styles.card}
            >

                {/* ==========================================================
                Header
                ========================================================== */}

                <div
                    className={styles.eyebrow}
                >

                    DISCOVER MORE

                </div>

                <h2
                    className={styles.title}
                >

                    あなたに最適なPCを
                    さらに探してみませんか？

                </h2>

                <p
                    className={styles.description}
                >

                    ランキングだけではなく、
                    用途・メーカー・性能・価格帯など、
                    あなたに合った条件から製品を探すことができます。

                </p>

                {/* ==========================================================
                Actions
                ========================================================== */}

                <div
                    className={styles.actions}
                >

                    <Link

                        href="/discover"

                        className={styles.primaryButton}

                    >

                        製品を探す

                    </Link>

                    <Link

                        href="/ranking"

                        className={styles.secondaryButton}

                    >

                        他のランキングを見る

                    </Link>

                </div>

            </div>

        </section>

    )

}