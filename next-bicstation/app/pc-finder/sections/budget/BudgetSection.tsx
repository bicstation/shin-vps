// ============================================================================
// FILE:
// /app/pc-finder/sections/budget/BudgetSection.tsx
// ============================================================================

'use client'

/* ============================================================================
Components
============================================================================ */

import BudgetButton
    from '../../components/BudgetButton'

/* ============================================================================
Styles
============================================================================ */

import styles
    from './BudgetSection.module.css'

/* ============================================================================
Types
============================================================================ */

type Budget = {

    label: string

    value: number | null

}

/* ============================================================================
Props
============================================================================ */

type Props = {

    budgets: Budget[]

    selected: number | null

    onSelect: (value: number | null) => void

}

/* ============================================================================
Journey

Discovery Refinement

Allows the user to optionally refine
their discovery experience by budget.

Responsibilities

- Present optional budget refinements
- Provide clear selection feedback
- Forward the selected budget

This section does NOT

- Execute Runtime
- Generate Semantic Meaning
- Manage Recommendation Logic

============================================================================ */

export default function BudgetSection({

    budgets,

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

                    OPTIONAL

                </span>

                <h2 className={styles.title}>

                    必要に応じて、ご予算でも絞り込めます

                </h2>

                <p className={styles.description}>

                    ご予算を指定すると、
                    おすすめ候補をさらに絞り込めます。

                    <br />

                    指定しなくても、そのままおすすめをご覧いただけます。

                </p>

            </div>

            {/* ==========================================================
                Budget Options
            ========================================================== */}

            <div className={styles.grid}>

                {(budgets ?? []).map((budget) => (

                    <BudgetButton

                        key={budget.label}

                        budget={budget}

                        selected={selected === budget.value}

                        onClick={() => onSelect(budget.value)}

                    />

                ))}

            </div>

        </section>

    )

}