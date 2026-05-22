// /home/maya/shin-vps/next-bicstation/app/components/home/lib/semantic.ts

type Product = {
  id?: number
  name?: string
  score?: number
  price?: number
  gpu?: string
  cpu?: string
  memory?: number
  storage?: number
  semantic_tags?: string[]
  usage_tags?: string[]
  [key: string]: any
}

/* =========================================================
🔥 SCORE TIER
========================================================= */

export function buildScoreTier(
  score = 0,
) {

  if (score >= 95) {
    return 'FLAGSHIP'
  }

  if (score >= 85) {
    return 'HIGH PERFORMANCE'
  }

  if (score >= 75) {
    return 'BALANCED'
  }

  return 'ENTRY'
}

/* =========================================================
🔥 PERFORMANCE LABEL
========================================================= */

export function buildPerformanceLabel(
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

  return '初心者向け'
}

/* =========================================================
🔥 SEMANTIC TAGS
========================================================= */

export function buildSemanticTags(
  product: Product,
) {

  const tags: string[] = []

  const gpu =
    product.gpu?.toLowerCase() || ''

  const memory =
    product.memory || 0

  const score =
    product.score || 0

  /* =======================================================
  AI
  ======================================================= */

  if (
    gpu.includes('rtx')
    || gpu.includes('5090')
    || gpu.includes('5080')
  ) {

    tags.push(
      'AI画像生成向け',
    )

  }

  /* =======================================================
  GAMING
  ======================================================= */

  if (score >= 80) {

    tags.push(
      'FPS gaming向け',
    )

  }

  /* =======================================================
  CREATOR
  ======================================================= */

  if (memory >= 32) {

    tags.push(
      '動画編集も快適',
    )

  }

  /* =======================================================
  LONG USE
  ======================================================= */

  if (score >= 90) {

    tags.push(
      '長く使いやすい',
    )

  }

  /* =======================================================
  BEGINNER
  ======================================================= */

  if (
    score >= 70
    && score <= 85
  ) {

    tags.push(
      '初心者でも選びやすい',
    )

  }

  return tags
}

/* =========================================================
🔥 SEMANTIC SUMMARY
========================================================= */

export function buildSemanticSummary(
  product: Product,
) {

  const tags =
    buildSemanticTags(product)

  if (!tags.length) {

    return (
      '用途別 recommendation に対応'
    )

  }

  return tags.join(' ・ ')
}

/* =========================================================
🔥 SEMANTIC CONFIDENCE
========================================================= */

export function buildSemanticConfidence(
  product: Product,
) {

  const score =
    product.score || 0

  if (score >= 95) {
    return 'HIGH'
  }

  if (score >= 80) {
    return 'MEDIUM'
  }

  return 'STANDARD'
}