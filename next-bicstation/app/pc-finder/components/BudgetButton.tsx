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
Budget Button
============================================================================ */

export default function BudgetButton({

    budget,

    selected = false,

    onClick,

}: Props) {

    return (

        <button

            type="button"

            onClick={onClick}

            className={

                [

                    styles.budgetButton,

                    selected

                        ? styles.selected

                        : '',

                ].join(' ')

            }

        >

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

                        ¥

                        {budget.value.toLocaleString()}

                    </span>

                )

            }

        </button>

    )

}