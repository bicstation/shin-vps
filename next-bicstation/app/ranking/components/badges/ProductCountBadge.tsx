// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/components/badges/ProductCountBadge.tsx

/* eslint-disable @next/next/no-img-element */
// @ts-nocheck

/* =========================================
🔥 Utils
========================================= */

import {
  formatCount,
} from '../../utils/formatters'

/* =========================================
🔥 Types
========================================= */

type Props = {

  count?: number

  label?: string
}

/* =========================================
🔥 Component
========================================= */

export default function
ProductCountBadge({

  count = 0,

  label = 'products',

}: Props) {

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
          'rgba(59,130,246,0.16)',

        border:
          '1px solid rgba(59,130,246,0.24)',

        color:
          '#dbeafe',

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
            '#60a5fa',
        }}
      />

      {/* ==================================
      LABEL
      ================================== */}

      <span>

        {formatCount(count)}

        {' '}

        {label}

      </span>

    </div>

  )
}