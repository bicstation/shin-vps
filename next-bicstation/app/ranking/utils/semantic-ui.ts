// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/utils/semantic-ui.ts

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
🔥 Semantic Role Tone
========================================= */

export function
getSemanticRoleTone(

  role?: SemanticRole

) {

  switch (role) {

    case 'primary':

      return {

        background:
          'rgba(59,130,246,0.16)',

        border:
          '1px solid rgba(59,130,246,0.28)',

        color:
          '#bfdbfe',
      }

    case 'secondary':

      return {

        background:
          'rgba(255,255,255,0.08)',

        border:
          '1px solid rgba(255,255,255,0.10)',

        color:
          '#e5e7eb',
      }

    case 'highlight':

      return {

        background:
          'rgba(168,85,247,0.18)',

        border:
          '1px solid rgba(168,85,247,0.32)',

        color:
          '#e9d5ff',
      }

    case 'related':

      return {

        background:
          'rgba(16,185,129,0.16)',

        border:
          '1px solid rgba(16,185,129,0.28)',

        color:
          '#bbf7d0',
      }

    case 'ranking':

      return {

        background:
          'rgba(245,158,11,0.16)',

        border:
          '1px solid rgba(245,158,11,0.28)',

        color:
          '#fde68a',
      }

    default:

      return {

        background:
          'rgba(255,255,255,0.08)',

        border:
          '1px solid rgba(255,255,255,0.10)',

        color:
          '#ffffff',
      }
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
          rgba(59,130,246,0.24),
          rgba(37,99,235,0.04)
        )
      `

    case 'cyan':

      return `
        linear-gradient(
          135deg,
          rgba(34,211,238,0.24),
          rgba(8,145,178,0.04)
        )
      `

    case 'purple':

      return `
        linear-gradient(
          135deg,
          rgba(168,85,247,0.24),
          rgba(126,34,206,0.04)
        )
      `

    case 'orange':

      return `
        linear-gradient(
          135deg,
          rgba(251,146,60,0.24),
          rgba(234,88,12,0.04)
        )
      `

    case 'yellow':

      return `
        linear-gradient(
          135deg,
          rgba(250,204,21,0.24),
          rgba(202,138,4,0.04)
        )
      `

    case 'red':

      return `
        linear-gradient(
          135deg,
          rgba(248,113,113,0.24),
          rgba(185,28,28,0.04)
        )
      `

    case 'green':

      return `
        linear-gradient(
          135deg,
          rgba(74,222,128,0.24),
          rgba(22,163,74,0.04)
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
🔥 Semantic Weight Label
========================================= */

export function
getSemanticWeightLabel(

  weight?: number

) {

  if (
    typeof weight !== 'number'
  ) {
    return 'Unknown'
  }

  if (weight >= 0.9) {
    return 'Ultra High'
  }

  if (weight >= 0.75) {
    return 'High'
  }

  if (weight >= 0.5) {
    return 'Medium'
  }

  return 'Low'
}

/* =========================================
🔥 Semantic Weight Percentage
========================================= */

export function
getSemanticWeightPercentage(

  weight?: number

) {

  if (
    typeof weight !== 'number'
  ) {
    return '0%'
  }

  return `${Math.round(
    weight * 100
  )}%`
}

/* =========================================
🔥 Attribute Tone
========================================= */

export function
getAttributeTone(

  attribute?: any

) {

  return {

    color:
      getSemanticColor(
        attribute?.color
      ),

    gradient:
      getSemanticGradient(
        attribute?.color
      ),

    role:
      getSemanticRoleTone(
        attribute?.semantic_role
      ),
  }
}