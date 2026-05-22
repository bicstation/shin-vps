// /home/maya/shin-vps/next-bicstation/app/components/home/lib/comparison.ts

type Product = {
  id?: number
  name?: string
  price?: number
  score?: number
  memory?: number
  storage?: number
  gpu?: string
  cpu?: string
  [key: string]: any
}

/* =========================================================
🔥 SORT BY SCORE
========================================================= */

export function sortProductsByScore(
  products: Product[] = [],
) {

  return [...products].sort(
    (
      a,
      b,
    ) => (
      (b.score || 0)
      - (a.score || 0)
    ),
  )
}

/* =========================================================
🔥 FILTER HIGH SCORE
========================================================= */

export function filterHighScoreProducts(
  products: Product[] = [],
  minScore = 80,
) {

  return products.filter(
    (product) => (
      (product.score || 0)
      >= minScore
    ),
  )
}

/* =========================================================
🔥 FORMAT PRICE
========================================================= */

export function formatPrice(
  price?: number,
) {

  if (!price) {
    return '価格未定'
  }

  return `¥${price.toLocaleString()}`
}

/* =========================================================
🔥 EXTRACT COMPARISON TAGS
========================================================= */

export function extractComparisonTags(
  product: Product,
) {

  const tags: string[] = []

  /* =======================================================
  GPU
  ======================================================= */

  if (product.gpu) {
    tags.push(product.gpu)
  }

  /* =======================================================
  MEMORY
  ======================================================= */

  if (product.memory) {
    tags.push(
      `${product.memory}GB メモリ`,
    )
  }

  /* =======================================================
  STORAGE
  ======================================================= */

  if (product.storage) {
    tags.push(
      `${product.storage}GB SSD`,
    )
  }

  /* =======================================================
  SCORE
  ======================================================= */

  if (product.score) {
    tags.push(
      `Score ${product.score}`,
    )
  }

  return tags
}

/* =========================================================
🔥 COMPARISON LABEL
========================================================= */

export function buildComparisonLabel(
  product: Product,
) {

  const score =
    product.score || 0

  if (score >= 95) {
    return '最高性能クラス'
  }

  if (score >= 85) {
    return '高性能バランス'
  }

  if (score >= 75) {
    return 'コスパ重視'
  }

  return 'エントリー向け'
}