// BudgetSection.tsx
'use client'

/* =========================================
🔥 Components
========================================= */

import BudgetSelector
  from '../../components/BudgetSelector'

/* =========================================
🔥 Styles
========================================= */

import styles
  from './BudgetSection.module.css'

/* =========================================
🔥 Props
========================================= */

type Props = {

  value: number

  onChange:
    (value: number) => void
}

/* =========================================
🔥 Budget Section
========================================= */

export default function
BudgetSection({

  value,

  onChange,

}: Props) {

  // ======================================
  // Debug
  // ======================================

  console.log(
    '🔥 BudgetSection',
    {
      value,
    }
  )

  // ======================================
  // Render
  // ======================================

  return (

    <section
      className={
        styles.section
      }
    >

      {/* ==================================
      Header
      ================================== */}

      <div
        className={
          styles.header
        }
      >

        <div
          className={
            styles.label
          }
        >

          BUDGET

        </div>

        <h2
          className={
            styles.title
          }
        >

          予算を選択

        </h2>

        <p
          className={
            styles.description
          }
        >

          価格帯から
          semantic recommendation
          を最適化します。

        </p>

      </div>

      {/* ==================================
      Selector
      ================================== */}

      <div
        className={
          styles.selector
        }
      >

        <BudgetSelector

          value={
            value
          }

          onChange={
            onChange
          }

        />

      </div>

      {/* ==================================
      Active Budget
      ================================== */}

      <div
        className={
          styles.activeBudget
        }
      >

        <div
          className={
            styles.activeLabel
          }
        >

          CURRENT BUDGET

        </div>

        <div
          className={
            styles.activeValue
          }
        >

          ¥{value.toLocaleString()}

        </div>

      </div>

    </section>

  )
}