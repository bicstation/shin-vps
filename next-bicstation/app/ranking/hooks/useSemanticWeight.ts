// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/hooks/useSemanticWeight.ts

/* =========================================
🔥 Hook
========================================= */

export function
useSemanticWeight(

  weight?: number

) {

  /* ======================================
  🔥 Empty
  ====================================== */

  if (
    typeof weight !== 'number'
    || Number.isNaN(weight)
  ) {

    return {

      value: 0,

      percentage: '0%',

      label: 'Unknown',

      tone: {

        background:
          'rgba(255,255,255,0.08)',

        border:
          'rgba(255,255,255,0.12)',

        color:
          '#ffffff',
      },
    }

  }

  /* ======================================
  🔥 Percentage
  ====================================== */

  const percentage =

    `${Math.round(
      weight * 100
    )}%`

  /* ======================================
  🔥 High
  ====================================== */

  if (weight >= 0.9) {

    return {

      value:
        weight,

      percentage,

      label:
        'Ultra High',

      tone: {

        background:
          'rgba(239,68,68,0.16)',

        border:
          'rgba(239,68,68,0.28)',

        color:
          '#fecaca',
      },
    }

  }

  /* ======================================
  🔥 Medium High
  ====================================== */

  if (weight >= 0.75) {

    return {

      value:
        weight,

      percentage,

      label:
        'High',

      tone: {

        background:
          'rgba(168,85,247,0.18)',

        border:
          'rgba(168,85,247,0.28)',

        color:
          '#f3e8ff',
      },
    }

  }

  /* ======================================
  🔥 Medium
  ====================================== */

  if (weight >= 0.5) {

    return {

      value:
        weight,

      percentage,

      label:
        'Medium',

      tone: {

        background:
          'rgba(59,130,246,0.16)',

        border:
          'rgba(59,130,246,0.28)',

        color:
          '#dbeafe',
      },
    }

  }

  /* ======================================
  🔥 Low
  ====================================== */

  return {

    value:
      weight,

    percentage,

    label:
      'Low',

    tone: {

      background:
        'rgba(255,255,255,0.08)',

      border:
        'rgba(255,255,255,0.12)',

      color:
        '#ffffff',
    },
  }
}