// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/hooks/useSemanticRole.ts

/* =========================================
🔥 Constants
========================================= */

import {
  SEMANTIC_ROLE_COLORS,
} from '../constants/ui'

/* =========================================
🔥 Types
========================================= */

type SemanticRole =

  | 'primary'
  | 'secondary'
  | 'highlight'
  | 'related'
  | 'ranking'
  | string

/* =========================================
🔥 Labels
========================================= */

const ROLE_LABELS = {

  primary:
    'Primary',

  secondary:
    'Secondary',

  highlight:
    'Highlight',

  related:
    'Related',

  ranking:
    'Ranking',
}

/* =========================================
🔥 Hook
========================================= */

export function
useSemanticRole(

  role?: SemanticRole

) {

  /* ======================================
  🔥 Normalize
  ====================================== */

  const normalizedRole =

    typeof role === 'string'
      ? role
      : 'secondary'

  /* ======================================
  🔥 Theme
  ====================================== */

  const theme =

    SEMANTIC_ROLE_COLORS[
      normalizedRole as keyof typeof
      SEMANTIC_ROLE_COLORS
    ]

    || {

      background:
        'rgba(255,255,255,0.08)',

      border:
        'rgba(255,255,255,0.12)',

      color:
        '#ffffff',
    }

  /* ======================================
  🔥 Label
  ====================================== */

  const label =

    ROLE_LABELS[
      normalizedRole as keyof typeof
      ROLE_LABELS
    ]

    || 'Semantic'

  /* ======================================
  🔥 Return
  ====================================== */

  return {

    role:
      normalizedRole,

    label,

    background:
      theme.background,

    border:
      theme.border,

    color:
      theme.color,
  }
}