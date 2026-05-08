export function formatPrice(
  value?: number | string | null
) {

  // ======================================
  // invalid
  // ======================================

  if (
    value === null
    || value === undefined
    || value === ''
  ) {
    return '0'
  }

  // ======================================
  // normalize
  // ======================================

  const numericValue =
    Number(value)

  // ======================================
  // NaN safe
  // ======================================

  if (
    Number.isNaN(
      numericValue
    )
  ) {
    return '0'
  }

  // ======================================
  // locale
  // ======================================

  return numericValue
    .toLocaleString(
      'ja-JP'
    )
}