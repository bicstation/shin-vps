'use client'

/* =========================================
🔥 Styles
========================================= */

import styles
  from '../styles/pcFinder.module.css'

/* =========================================
🔥 Semantic
========================================= */

import {
  BUDGET_PRESETS,
} from '../semantic/finderSemantic'

/* =========================================
🔥 Props
========================================= */

type Props = {

  value: number

  onChange:
    (value: number) => void
}

/* =========================================
🔥 Budget Labels
========================================= */

function getBudgetLabel(
  value: number
) {

  if (
    value <= 150000
  ) {

    return 'ENTRY'
  }

  if (
    value <= 250000
  ) {

    return 'BALANCED'
  }

  if (
    value <= 350000
  ) {

    return 'HIGH-END'
  }

  return 'ULTRA'
}

/* =========================================
🔥 Budget Selector
========================================= */

export default function
BudgetSelector({

  value,

  onChange,

}: Props) {

  // ======================================
  // Debug
  // ======================================

  console.log(
    '🔥 BudgetSelector',
    {
      value,
    }
  )

  // ======================================
  // Render
  // ======================================

  return (

    <div
      className={
        styles.block
      }
    >

      {/* ==================================
      Header
      ================================== */}

      <div
        className={
          styles.blockHeader
        }
      >

        <h2
          className={
            styles.blockTitle
          }
        >

          予算

        </h2>

        <div
          className={
            styles.blockBadge
          }
        >

          {getBudgetLabel(
            value
          )}

        </div>

      </div>

      {/* ==================================
      Description
      ================================== */}

      <p
        className={
          styles.blockDescription
        }
      >

        budget optimization /
        semantic recommendation
        に利用されます。

      </p>

      {/* ==================================
      Options
      ================================== */}

      <div
        className={
          styles.optionGrid
        }
      >

        {BUDGET_PRESETS.map(
          budget => {

            const active =

              budget
              === value

            return (

              <button

                key={
                  budget
                }

                type="button"

                onClick={() =>
                  onChange(
                    budget
                  )
                }

                className={

                  active

                    ? styles.optionActive

                    : styles.option

                }

              >

                {/* ======================= */}
                {/* Price */}
                {/* ======================= */}

                <div
                  className={
                    styles.optionPrice
                  }
                >

                  ¥{
                    budget.toLocaleString()
                  }

                </div>

                {/* ======================= */}
                {/* Label */}
                {/* ======================= */}

                <div
                  className={
                    styles.optionLabel
                  }
                >

                  {getBudgetLabel(
                    budget
                  )}

                </div>

              </button>

            )
          }
        )}

      </div>

    </div>
  )
}