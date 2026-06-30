// ============================================================================
// FILE:
// /app/pc-finder/sections/summary/DiscoverySummarySection.tsx
// ============================================================================

'use client'

/* ============================================================================
Components
============================================================================ */

import DiscoverySummaryCard
    from '../../components/DiscoverySummaryCard'

/* ============================================================================
Styles
============================================================================ */

import styles
    from './DiscoverySummarySection.module.css'

/* ============================================================================
Props
============================================================================ */

type Props = {

    intent: string

    budget: number | null

}

/* ============================================================================
Journey

Current Discovery State

Communicates the user's current discovery conditions
before Runtime executes the recommendation.

Responsibilities

- Present current discovery conditions
- Increase user confidence
- Prepare for Runtime search

This section does NOT

- Execute Runtime
- Generate Semantic Meaning
- Manage Search State

============================================================================ */

export default function DiscoverySummarySection({

    intent,

    budget,

}: Props) {

    return (

        <section className={styles.section}>

            {/* ==========================================================
                Section Header
            ========================================================== */}

            <div className={styles.header}>

                <span className={styles.badge}>

                    CURRENT SELECTION

                </span>

                <h2 className={styles.title}>

                    現在の検索条件

                </h2>

                <p className={styles.description}>

                    あなたが選択した条件です。
                    この内容をもとに Semantic Reality が最適な候補を探します。

                </p>

            </div>

            {/* ==========================================================
                Summary Card
            ========================================================== */}

            <DiscoverySummaryCard

                intent={intent}

                budget={budget}

            />

        </section>

    )

}