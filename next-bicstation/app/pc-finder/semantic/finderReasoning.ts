// /semantic/finderReasoning.ts

/* =========================================
🔥 Purpose
========================================= */

type Purpose =

  | 'gaming'
  | 'creator'
  | 'business'
  | 'ai'

/* =========================================
🔥 Product
========================================= */

type Product = {

  name?: string

  maker?: string

  price?: number

  grouped_attributes?: Record<
    string,
    any[]
  >
}

/* =========================================
🔥 Semantic Match
========================================= */

function hasSemanticMatch(
  product: Product,
  group: string,
  keyword: string
) {

  const items =

    product
      ?.grouped_attributes
      ?.[group]

  if (
    !Array.isArray(
      items
    )
  ) {

    return false
  }

  return items.some(
    item => (

      item?.slug
        ?.includes(
          keyword
        )

      ||

      item?.name
        ?.includes(
          keyword
        )

    )
  )
}

/* =========================================
🔥 Purpose Reasoning
========================================= */

export function
buildPurposeReasoning(
  purpose: Purpose
) {

  switch (
    purpose
  ) {

    case 'gaming':

      return [

        '高FPSゲーム向け semantic 構成',

        'GPU workload を重視',

        '長時間 gaming stability',

      ]

    case 'creator':

      return [

        '動画編集 workload に最適化',

        'creator semantic 構成',

        '高メモリ workload を考慮',

      ]

    case 'business':

      return [

        '安定性とコスパを重視',

        '長期運用 workload に対応',

        'business semantic optimization',

      ]

    case 'ai':

      return [

        'AI生成 workload に最適化',

        'GPU memory capacity を考慮',

        'LLM semantic workload 対応',

      ]

    default:

      return [

        'semantic recommendation',

      ]
  }
}

/* =========================================
🔥 Product Reasoning
========================================= */

export function
buildProductReasoning(
  purpose: Purpose,
  product: Product
) {

  const reasons: string[] = []

  // ======================================
  // Purpose
  // ======================================

  reasons.push(

    ...buildPurposeReasoning(
      purpose
    )

  )

  // ======================================
  // Gaming
  // ======================================

  if (

    hasSemanticMatch(
      product,
      'gpu',
      'rtx'
    )

  ) {

    reasons.push(
      'RTX GPU semantic 一致'
    )
  }

  // ======================================
  // AI
  // ======================================

  if (

    hasSemanticMatch(
      product,
      'usage',
      'ai'
    )

  ) {

    reasons.push(
      'AI semantic workload 対応'
    )
  }

  // ======================================
  // Creator
  // ======================================

  if (

    hasSemanticMatch(
      product,
      'usage',
      'creator'
    )

  ) {

    reasons.push(
      'creator workflow semantic'
    )
  }

  // ======================================
  // High Memory
  // ======================================

  if (

    hasSemanticMatch(
      product,
      'memory',
      '32'
    )

  ) {

    reasons.push(
      '高メモリ workload 向け'
    )
  }

  // ======================================
  // Price
  // ======================================

  if (
    typeof product?.price
    === 'number'
  ) {

    if (
      product.price <=
      200000
    ) {

      reasons.push(
        'コストパフォーマンス重視'
      )
    }

    if (
      product.price >=
      350000
    ) {

      reasons.push(
        'ハイエンド semantic 構成'
      )
    }
  }

  // ======================================
  // Unique
  // ======================================

  return Array.from(
    new Set(
      reasons
    )
  )
}

/* =========================================
🔥 Recommendation Summary
========================================= */

export function
buildRecommendationSummary(
  purpose: Purpose,
  product: Product
) {

  const maker =

    product?.maker
    || 'Recommended'

  const productName =

    product?.name
    || 'PC'

  switch (
    purpose
  ) {

    case 'gaming':

      return `
${maker} の ${productName} は、
高FPS gaming workload と
GPU semantic balance を重視した
おすすめ構成です。
`

    case 'creator':

      return `
${maker} の ${productName} は、
creator workflow /
動画編集 /
配信 workload に適した
semantic recommendation です。
`

    case 'business':

      return `
${maker} の ${productName} は、
business workload /
安定運用 /
長期利用を重視した
semantic recommendation です。
`

    case 'ai':

      return `
${maker} の ${productName} は、
AI生成 /
LLM /
GPU workload を重視した
semantic AI recommendation です。
`

    default:

      return `
${maker} の ${productName} は、
semantic recommendation に
基づく推奨構成です。
`
  }
}