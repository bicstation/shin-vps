// /home/maya/shin-vps/next-bicstation/app/components/home/lib/recommendation.ts

type Product = {
  id?: number
  name?: string
  score?: number
  price?: number
  gpu?: string
  cpu?: string
  memory?: number
  storage?: number
  usage_tags?: string[]
  semantic_tags?: string[]
  [key: string]: any
}

/* =========================================================
🔥 AI USE CHECK
========================================================= */

export function isAIRecommended(
  product: Product,
) {

  const gpu =
    product.gpu?.toLowerCase() || ''

  return (
    gpu.includes('rtx')
    || gpu.includes('4090')
    || gpu.includes('5090')
  )
}

/* =========================================================
🔥 GAMING USE CHECK
========================================================= */

export function isGamingRecommended(
  product: Product,
) {

  const score =
    product.score || 0

  return score >= 80
}

/* =========================================================
🔥 CREATOR USE CHECK
========================================================= */

export function isCreatorRecommended(
  product: Product,
) {

  const memory =
    product.memory || 0

  return memory >= 32
}

/* =========================================================
🔥 BUILD SEMANTIC LABELS
========================================================= */

export function buildSemanticLabels(
  product: Product,
) {

  const labels: string[] = []

  /* =======================================================
  AI
  ======================================================= */

  if (isAIRecommended(product)) {
    labels.push(
      'AI画像生成向け',
    )
  }

  /* =======================================================
  GAMING
  ======================================================= */

  if (isGamingRecommended(product)) {
    labels.push(
      'FPS gaming向け',
    )
  }

  /* =======================================================
  CREATOR
  ======================================================= */

  if (isCreatorRecommended(product)) {
    labels.push(
      '動画編集も快適',
    )
  }

  /* =======================================================
  LONG USE
  ======================================================= */

  if (
    (product.score || 0) >= 90
  ) {
    labels.push(
      '長く使いやすい',
    )
  }

  return labels
}

/* =========================================================
🔥 BUILD RECOMMENDATION REASON
========================================================= */

export function buildRecommendationReason(
  product: Product,
) {

  const labels =
    buildSemanticLabels(product)

  if (!labels.length) {

    return (
      '用途別 recommendation に対応'
    )

  }

  return labels.join(' ・ ')
}

/* =========================================================
🔥 FILTER RECOMMENDED PRODUCTS
========================================================= */

export function filterRecommendedProducts(
  products: Product[] = [],
) {

  return products.filter((product) => (

    isGamingRecommended(product)
    || isAIRecommended(product)
    || isCreatorRecommended(product)

  ))
}