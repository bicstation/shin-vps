// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/components/badges/SemanticWeightBadge.tsx

/* eslint-disable @next/next/no-img-element */
// @ts-nocheck

/* =========================================
🔥 Utils
========================================= */

import {
  formatSemanticWeight,
} from '../../utils/formatters'

import {
  getSemanticWeightLabel,
} from '../../utils/semantic-ui'

/* =========================================
🔥 Types
========================================= */

type Props = {

  weight?: number
}

/* =========================================
🔥 Component
========================================= */

export default function
SemanticWeightBadge({

  weight,

}: Props) {

  /* ======================================
  🔥 Empty
  ====================================== */

  if (
    typeof weight !== 'number'
  ) {
    return null
  }

  /* ======================================
  🔥 Label
  ====================================== */

  const label =

    getSemanticWeightLabel(
      weight
    )

  /* ======================================
  🔥 Render
  ====================================== */

  return (

    <div
      style={{
        display: 'inline-flex',

        alignItems: 'center',

        gap: '10px',

        minHeight: '36px',

        padding:
          '0 14px',

        borderRadius:
          '999px',

        background:
          'rgba(168,85,247,0.18)',

        border:
          '1px solid rgba(168,85,247,0.28)',

        color:
          '#e9d5ff',

        fontSize: '12px',

        fontWeight: 800,

        letterSpacing:
          '0.04em',
      }}
    >

      {/* ==================================
      DOT
      ================================== */}

      <div
        style={{
          width: '8px',

          height: '8px',

          borderRadius: '999px',

          background:
            '#c084fc',
        }}
      />

      {/* ==================================
      CONTENT
      ================================== */}

      <span>

        {label}

        {' · '}

        {formatSemanticWeight(
          weight
        )}

      </span>

    </div>

  )
}