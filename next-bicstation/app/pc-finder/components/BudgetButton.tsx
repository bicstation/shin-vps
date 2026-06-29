// ============================================================================
// FILE:
// /app/pc-finder/components/BudgetButton.tsx
// Copyright (c) 2026 Shin Corporation.
// ============================================================================

'use client'

/* ============================================================================
Styles
============================================================================ */

import styles
    from '../styles/pcFinder.module.css'

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

    budget: Budget

    selected?: boolean

    onClick: () => void

}

/* ============================================================================
Discovery Refinement Unit

Represents one optional budget refinement.

Responsibilities

- Present one budget option
- Provide clear selection feedback
- Support optional refinement

This component does NOT

- Execute Runtime
- Manage Search State
- Generate Semantic Meaning

============================================================================ */

export default function BudgetButton({

    budget,

    selected = false,

    onClick,

}: Props) {

    const className = [

        styles.budgetButton,

        selected && styles.selected,

    ]

        .filter(Boolean)

        .join(' ')

    return (

        <button

            type="button"

            aria-label={`予算 ${budget.label}`}

            aria-pressed={selected}

            onClick={onClick}

            className={className}

        >

            {selected && (

                <div
                    className={styles.selectedBadge}
                >

                    ✓ 選択済み

                </div>

            )}

            <span
                className={
                    styles.budgetLabel
                }
            >

                {budget.label}

            </span>

            {

                budget.value !== null && (

                    <span
                        className={
                            styles.budgetValue
                        }
                    >

                        ¥{budget.value.toLocaleString()}

                    </span>

                )

            }

        </button>

    )

}