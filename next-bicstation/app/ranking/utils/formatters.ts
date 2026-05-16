// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/utils/formatters.ts

/* =========================================
🔥 Format Price
========================================= */

export function
formatPrice(

  value?: number | null

) {

  if (
    typeof value !== 'number'
    || Number.isNaN(value)
  ) {
    return '-'
  }

  return `¥${value.toLocaleString()}`
}

/* =========================================
🔥 Format Count
========================================= */

export function
formatCount(

  value?: number | null

) {

  if (
    typeof value !== 'number'
    || Number.isNaN(value)
  ) {
    return '0'
  }

  return value.toLocaleString()
}

/* =========================================
🔥 Format Percentage
========================================= */

export function
formatPercentage(

  value?: number | null,

  fractionDigits = 0

) {

  if (
    typeof value !== 'number'
    || Number.isNaN(value)
  ) {
    return '-'
  }

  return `${(
    value * 100
  ).toFixed(
    fractionDigits
  )}%`
}

/* =========================================
🔥 Format Semantic Weight
========================================= */

export function
formatSemanticWeight(

  value?: number | null

) {

  if (
    typeof value !== 'number'
    || Number.isNaN(value)
  ) {
    return '-'
  }

  return value.toFixed(2)
}

/* =========================================
🔥 Format Slug Label
========================================= */

export function
formatSlugLabel(

  slug?: string | null

) {

  if (!slug) {
    return ''
  }

  return slug

    .replaceAll(
      '-',
      ' '
    )

    .replaceAll(
      '_',
      ' '
    )

    .replace(
      /\b\w/g,
      (
        char
      ) => char.toUpperCase()
    )
}

/* =========================================
🔥 Format Group Label
========================================= */

export function
formatGroupLabel(

  value?: string | null

) {

  if (!value) {
    return ''
  }

  return value

    .replaceAll(
      '_',
      ' '
    )

    .replace(
      /\b\w/g,
      (
        char
      ) => char.toUpperCase()
    )
}

/* =========================================
🔥 Clamp Text
========================================= */

export function
clampText(

  text?: string | null,

  maxLength = 160

) {

  if (!text) {
    return ''
  }

  if (
    text.length
    <= maxLength
  ) {
    return text
  }

  return `${text.slice(
    0,
    maxLength
  )}...`
}

/* =========================================
🔥 Normalize Array
========================================= */

export function
normalizeArray<T>(

  value?: T[]

) {

  return Array.isArray(value)
    ? value
    : []
}