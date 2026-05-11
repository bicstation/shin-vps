// IntentSection.tsx
'use client'

/* =========================================
🔥 Components
========================================= */

import IntentSelector
  from '../../components/IntentSelector'

/* =========================================
🔥 Styles
========================================= */

import styles
  from './IntentSection.module.css'

/* =========================================
🔥 Props
========================================= */

type Props = {

  value: string

  onChange:
    (value: string) => void
}

/* =========================================
🔥 Intent Label
========================================= */

function getIntentLabel(
  value: string
) {

  switch (
    value
  ) {

    case 'gaming':
      return 'FPS・重量級ゲーム'

    case 'creator':
      return '動画編集・配信'

    case 'business':
      return '業務・法人利用'

    case 'ai':
      return 'AI画像生成・LLM'

    default:
      return 'semantic recommendation'
  }
}

/* =========================================
🔥 Intent Section
========================================= */

export default function
IntentSection({

  value,

  onChange,

}: Props) {

  // ======================================
  // Current Label
  // ======================================

  const currentLabel =

    getIntentLabel(
      value
    )

  // ======================================
  // Debug
  // ======================================

  console.log(
    '🔥 IntentSection',
    {
      value,
      currentLabel,
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

          WORKLOAD INTENT

        </div>

        <h2
          className={
            styles.title
          }
        >

          用途を選択

        </h2>

        <p
          className={
            styles.description
          }
        >

          semantic intent /
          workload /
          recommendation
          をもとに
          最適なPC構成を分析します。

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

        <IntentSelector

          value={
            value
          }

          onChange={
            onChange
          }

        />

      </div>

      {/* ==================================
      Current Intent
      ================================== */}

      <div
        className={
          styles.activeIntent
        }
      >

        <div
          className={
            styles.activeLabel
          }
        >

          CURRENT INTENT

        </div>

        <div
          className={
            styles.activeValue
          }
        >

          {currentLabel}

        </div>

      </div>

    </section>

  )
}