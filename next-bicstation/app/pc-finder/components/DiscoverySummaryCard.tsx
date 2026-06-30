// ============================================================================
// FILE:
// /app/pc-finder/components/DiscoverySummaryCard.tsx
// Copyright (c) 2026 Shin Corporation.
// ============================================================================

'use client'

/* ============================================================================
Styles
============================================================================ */

import styles
    from '../styles/pcFinder.module.css'

/* ============================================================================
Props
============================================================================ */

type Props = {

    intent: string

    budget: number | null

}

/* ============================================================================
Discovery Summary Card

Represents the user's current discovery conditions.

Responsibilities

- Display selected intent
- Display selected budget
- Improve discovery confidence

This component does NOT

- Execute Runtime
- Generate Semantic Meaning
- Manage Search State

============================================================================ */

export default function DiscoverySummaryCard({

    intent,

    budget,

}: Props) {

    return (

        <div className={styles.summaryCard}>

            {/* ==========================================================
                Intent
            ========================================================== */}

            <div className={styles.summaryItem}>

                <div className={styles.summaryIcon}>

                    🎯

                </div>

                <div className={styles.summaryContent}>

                    <span className={styles.summaryLabel}>

                        用途

                    </span>

                    <strong className={styles.summaryValue}>

                        {intent || '未選択'}

                    </strong>

                    <p className={styles.summaryDescription}>

                        {intent
                            ? 'この用途を優先しておすすめを表示します。'
                            : '用途を選択すると精度が向上します。'
                        }

                    </p>

                </div>

            </div>

            {/* ==========================================================
                Budget
            ========================================================== */}

            <div className={styles.summaryItem}>

                <div className={styles.summaryIcon}>

                    💰

                </div>

                <div className={styles.summaryContent}>

                    <span className={styles.summaryLabel}>

                        ご予算

                    </span>

                    <strong className={styles.summaryValue}>

                        {budget !== null
                            ? `¥${budget.toLocaleString()} 以下`
                            : '指定なし'
                        }

                    </strong>

                    <p className={styles.summaryDescription}>

                        {budget !== null
                            ? 'この価格帯を考慮して候補を表示します。'
                            : '価格を指定せず幅広くおすすめします。'
                        }

                    </p>

                </div>

            </div>

        </div>

    )

}