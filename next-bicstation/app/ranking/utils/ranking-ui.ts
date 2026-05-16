// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/utils/ranking-ui.ts

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
🔥 Semantic Role Color
========================================= */

export function
getSemanticRoleColor(

  role?: SemanticRole

) {

  switch (role) {

    case 'primary':

      return (
        'rgba(59,130,246,0.16)'
      )

    case 'secondary':

      return (
        'rgba(255,255,255,0.10)'
      )

    case 'highlight':

      return (
        'rgba(168,85,247,0.18)'
      )

    case 'related':

      return (
        'rgba(16,185,129,0.16)'
      )

    case 'ranking':

      return (
        'rgba(245,158,11,0.16)'
      )

    default:

      return (
        'rgba(255,255,255,0.08)'
      )
  }
}

/* =========================================
🔥 Semantic Role Label
========================================= */

export function
getSemanticRoleLabel(

  role?: SemanticRole

) {

  switch (role) {

    case 'primary':
      return 'Primary'

    case 'secondary':
      return 'Secondary'

    case 'highlight':
      return 'Highlight'

    case 'related':
      return 'Related'

    case 'ranking':
      return 'Ranking'

    default:
      return 'Semantic'
  }
}

/* =========================================
🔥 Semantic Color
========================================= */

export function
getSemanticColor(

  color?: string

) {

  switch (color) {

    case 'blue':
      return '#60a5fa'

    case 'cyan':
      return '#22d3ee'

    case 'purple':
      return '#c084fc'

    case 'orange':
      return '#fb923c'

    case 'yellow':
      return '#facc15'

    case 'red':
      return '#f87171'

    case 'green':
      return '#4ade80'

    case 'pink':
      return '#f472b6'

    default:
      return '#ffffff'
  }
}

/* =========================================
🔥 Semantic Gradient
========================================= */

export function
getSemanticGradient(

  color?: string

) {

  switch (color) {

    case 'blue':

      return `
        linear-gradient(
          135deg,
          rgba(59,130,246,0.28),
          rgba(37,99,235,0.08)
        )
      `

    case 'purple':

      return `
        linear-gradient(
          135deg,
          rgba(168,85,247,0.28),
          rgba(126,34,206,0.08)
        )
      `

    case 'orange':

      return `
        linear-gradient(
          135deg,
          rgba(251,146,60,0.28),
          rgba(234,88,12,0.08)
        )
      `

    case 'red':

      return `
        linear-gradient(
          135deg,
          rgba(248,113,113,0.28),
          rgba(185,28,28,0.08)
        )
      `

    case 'green':

      return `
        linear-gradient(
          135deg,
          rgba(74,222,128,0.28),
          rgba(22,163,74,0.08)
        )
      `

    default:

      return `
        linear-gradient(
          135deg,
          rgba(255,255,255,0.08),
          rgba(255,255,255,0.02)
        )
      `
  }
}

/* =========================================
🔥 Rank Label
========================================= */

export function
getRankLabel(

  index: number

) {

  const rank =

    index + 1

  switch (rank) {

    case 1:
      return '🥇 #1'

    case 2:
      return '🥈 #2'

    case 3:
      return '🥉 #3'

    default:
      return `#${rank}`
  }
}

/* =========================================
🔥 Price Tone
========================================= */

export function
getPriceTone(

  price?: number

) {

  if (
    typeof price !== 'number'
  ) {
    return 'neutral'
  }

  if (price >= 400000) {
    return 'ultra-premium'
  }

  if (price >= 250000) {
    return 'premium'
  }

  if (price >= 150000) {
    return 'mid-range'
  }

  return 'entry'
}