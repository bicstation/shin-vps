// ============================================================================
// FILE:
// /app/pc-finder/sections/intent/IntentSection.tsx
// ============================================================================

'use client'

/* ============================================================================
Components
============================================================================ */

import IntentCard
    from '../../components/IntentCard'

/* ============================================================================
Styles
============================================================================ */

import styles
    from './IntentSection.module.css'

/* ============================================================================
Types
============================================================================ */

type Intent = {

    id: string

    title: string

    description: string

    icon: string

}

/* ============================================================================
Props
============================================================================ */

type Props = {

    intents: Intent[]

    selected?: string

    onSelect: (id: string) => void

}

/* ============================================================================
Journey

Discovery Intent

This section presents the available discovery intentions.

Responsibilities

- Introduce the first discovery decision
- Present available Intent cards
- Forward the selected Intent

This section does NOT

- Generate Semantic Meaning
- Execute Runtime
- Manage Recommendation Logic

============================================================================ */

export default function IntentSection({

    intents,

    selected,

    onSelect,

}: Props) {

    return (

        <section className={styles.section}>

            {/* ==========================================================
                Section Header
            ========================================================== */}

            <div className={styles.header}>

                <span className={styles.eyebrow}>

                    STEP 1

                </span>

                <h2 className={styles.title}>

                    今日は何をしたいですか？

                </h2>

                <p className={styles.description}>

                    あなたの目的を選択すると、

                    Semantic Reality が
                    あなたに合ったPC探しを始めます。

                </p>

            </div>

            {/* ==========================================================
                Discovery Decisions
            ========================================================== */}

            <div className={styles.grid}>

                {(intents ?? []).map((intent) => (

                    <IntentCard

                        key={intent.id}

                        intent={intent}

                        selected={
                            selected === intent.id
                        }

                        onClick={() =>
                            onSelect(intent.id)
                        }

                    />

                ))}

            </div>

        </section>

    )

}