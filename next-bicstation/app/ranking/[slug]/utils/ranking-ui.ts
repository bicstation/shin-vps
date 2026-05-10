// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/[type]/utils/ranking-ui.ts

/* =========================================
🔥 Types
========================================= */

import type {
  SemanticRole,
} from '../types/ranking'

/* =========================================
🔥 Semantic Role Class
========================================= */

export function
getSemanticRoleClass(
  role?: SemanticRole
) {

  switch (role) {

    case 'highlight':
      return 'highlight'

    case 'primary':
      return 'primary'

    case 'secondary':
      return 'secondary'

    case 'supportive':
    default:
      return 'supportive'
  }
}

/* =========================================
🔥 Price Formatter
========================================= */

export function
formatPrice(
  price?: number
) {

  if (!price) {
    return '価格未設定'
  }

  return new Intl.NumberFormat(
    'ja-JP',
    {
      style: 'currency',
      currency: 'JPY',
      maximumFractionDigits: 0,
    }
  ).format(price)
}

/* =========================================
🔥 Score Formatter
========================================= */

export function
formatScore(
  score?: number
) {

  if (
    score === undefined
    || score === null
  ) {
    return '--'
  }

  return Number(score)
    .toFixed(1)
}

/* =========================================
🔥 Count Formatter
========================================= */

export function
formatCount(
  count?: number
) {

  if (!count) {
    return '0'
  }

  return new Intl.NumberFormat(
    'ja-JP'
  ).format(count)
}

/* =========================================
🔥 Safe Image
========================================= */

export function
resolveProductImage(
  image?: string
) {

  if (!image) {
    return '/images/no-image.webp'
  }

  return image
}

/* =========================================
🔥 Rank Badge
========================================= */

export function
getRankBadge(
  rank: number
) {

  if (rank === 1) {
    return '🥇'
  }

  if (rank === 2) {
    return '🥈'
  }

  if (rank === 3) {
    return '🥉'
  }

  return `#${rank}`
}

/* =========================================
🔥 Semantic Weight
========================================= */

export function
normalizeSemanticWeight(
  weight?: number
) {

  if (!weight) {
    return 0
  }

  return Math.min(
    Math.max(weight, 0),
    100
  )
}
