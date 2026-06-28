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
Budget Section
============================================================================ */

export default function BudgetSection({

    budgets,

    selected,

    onSelect,

}: Props) {

    return (

        <section className={styles.section}>

            <div className={styles.header}>

                <span className={styles.eyebrow}>

                    STEP 2

                </span>

                <h2 className={styles.title}>

                    ご予算を教えてください

                </h2>

                <p className={styles.description}>

                    ご予算に合わせて候補を絞り込みます。
                    後からいつでも変更できます。

                </p>

            </div>

            <div className={styles.grid}>

                {

                    budgets.map(budget => (

                        <BudgetButton

                            key={

                                budget.label

                            }

                            budget={budget}

                            selected={

                                selected === budget.value

                            }

                            onClick={() =>

                                onSelect(

                                    budget.value

                                )

                            }

                        />

                    ))

                }

            </div>

        </section>

    )

}