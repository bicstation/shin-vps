// ============================================================================
// FILE:
// /app/ranking/[slug]/components/continuation/RankingContinuation.tsx
// ============================================================================

'use client'

/* ============================================================================
🔥 Next
============================================================================ */

import Link from 'next/link'

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

        <section className={styles.section}>

            <div className={styles.card}>

                {/* ==========================================================
                Header
                ========================================================== */}

                <div className={styles.eyebrow}>

                    NEXT DISCOVERY

                </div>

                <h2 className={styles.title}>

                    次の発見へ進みましょう

                </h2>

                <p className={styles.description}>

                    ランキングは代表的なおすすめです。

                    用途・予算・メーカー・性能など、
                    あなたに合った条件から、
                    さらに最適なPCを見つけることができます。

                </p>

                {/* ==========================================================
                Actions
                ========================================================== */}

                <div className={styles.actions}>

                    <Link

                        href="/pc-finder"

                        className={styles.primaryCard}

                    >

                        <span className={styles.actionIcon}>🔍</span>

                        <strong>

                            Finder

                        </strong>

                        <small>

                            条件から探す

                        </small>

                    </Link>

                    <Link

                        href="/discover"

                        className={styles.actionCard}

                    >

                        <span className={styles.actionIcon}>🌎</span>

                        <strong>

                            Discover

                        </strong>

                        <small>

                            Semantic World

                        </small>

                    </Link>

                    <Link

                        href="/ranking"

                        className={styles.actionCard}

                    >

                        <span className={styles.actionIcon}>🏆</span>

                        <strong>

                            Ranking

                        </strong>

                        <small>

                            他のランキング

                        </small>

                    </Link>

                </div>

            </div>

        </section>

    )

}