// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/hooks/useSemanticColor.ts

/* =========================================
🔥 Constants
========================================= */

import {
  SEMANTIC_COLOR_MAP,
} from '../constants/ui'

/* =========================================
🔥 Hook
========================================= */

export function
useSemanticColor(

  color?: string

) {

  /* ======================================
  🔥 Normalize
  ====================================== */

  if (
    !color
    || typeof color
      !== 'string'
  ) {

    return {

      base:
        '#ffffff',

      background:
        'rgba(255,255,255,0.08)',

      border:
        'rgba(255,255,255,0.12)',

      glow:
        'rgba(255,255,255,0.16)',
    }

  }

  /* ======================================
  🔥 Base Color
  ====================================== */

  const base =

    SEMANTIC_COLOR_MAP[
      color as keyof typeof
      SEMANTIC_COLOR_MAP
    ]

    || '#ffffff'

  /* ======================================
  🔥 Return
  ====================================== */

  return {

    base,

    background:
      `${base}18`,

    border:
      `${base}44`,

    glow:
      `${base}33`,
  }
}