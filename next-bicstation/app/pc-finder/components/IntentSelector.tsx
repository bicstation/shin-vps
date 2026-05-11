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
  PURPOSE_OPTIONS,
} from '../semantic/finderSemantic'

/* =========================================
🔥 Types
========================================= */

import type {
  FinderPurpose,
} from '../types/finder'

/* =========================================
🔥 Props
========================================= */

type Props = {

  value: FinderPurpose

  onChange:
    (
      value: FinderPurpose
    ) => void
}

/* =========================================
🔥 Intent Selector
========================================= */

export default function
IntentSelector({

  value,

  onChange,

}: Props) {

  // ======================================
  // Debug
  // ======================================

  console.log(
    '🔥 IntentSelector',
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

          用途

        </h2>

        <div
          className={
            styles.blockBadge
          }
        >

          SEMANTIC

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

        workload /
        usage semantic /
        recommendation graph
        を解析します。

      </p>

      {/* ==================================
      Options
      ================================== */}

      <div
        className={
          styles.optionGrid
        }
      >

        {PURPOSE_OPTIONS.map(
          item => {

            const active =

              item.value
              === value

            return (

              <button

                key={
                  item.value
                }

                type="button"

                onClick={() =>

                  onChange(
                    item.value as FinderPurpose
                  )

                }

                className={

                  active

                    ? styles.optionActive

                    : styles.option

                }

              >

                {/* ======================= */}
                {/* Label */}
                {/* ======================= */}

                <div
                  className={
                    styles.optionTitle
                  }
                >

                  {item.label}

                </div>

                {/* ======================= */}
                {/* Description */}
                {/* ======================= */}

                <div
                  className={
                    styles.optionDescription
                  }
                >

                  {
                    item.description
                  }

                </div>

                {/* ======================= */}
                {/* Semantic */}
                {/* ======================= */}

                <div
                  className={
                    styles.optionSemantic
                  }
                >

                  {
                    item.semantic
                  }

                </div>

              </button>

            )
          }
        )}

      </div>

    </div>
  )
}