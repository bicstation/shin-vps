// /semantic/finderSemantic.ts

/* =========================================
🔥 Types
========================================= */

export type FinderPurpose =

  | 'gaming'
  | 'creator'
  | 'business'
  | 'ai'

/* =========================================
🔥 Semantic Mapping
========================================= */

export const PURPOSE_TO_SEMANTIC = {

  gaming:
    'usage-gaming',

  creator:
    'usage-creator',

  business:
    'usage-business',

  ai:
    'usage-ai',

} as const

/* =========================================
🔥 Semantic Labels
========================================= */

export const PURPOSE_LABELS = {

  gaming:
    'Gaming Semantic',

  creator:
    'Creator Workflow',

  business:
    'Business Productivity',

  ai:
    'AI Workload',

} as const

/* =========================================
🔥 Semantic Descriptions
========================================= */

export const PURPOSE_DESCRIPTIONS = {

  gaming:
    `
FPS・重量級ゲーム・
高リフレッシュレート gaming
に最適化された semantic。
`,

  creator:
    `
動画編集・配信・
creative workflow
向け semantic recommendation。
`,

  business:
    `
長期運用・安定性・
コストバランスを重視した
business semantic。
`,

  ai:
    `
AI画像生成・LLM・
GPU workload
向け semantic recommendation。
`,

} as const

/* =========================================
🔥 Budget Presets
========================================= */

export const BUDGET_PRESETS = [

  120000,

  180000,

  250000,

  350000,

  500000,

]

/* =========================================
🔥 Purpose Options
========================================= */

export const PURPOSE_OPTIONS = [

  {
    value:
      'gaming',

    label:
      'Gaming',

    description:
      'FPS・重量級ゲーム向け',

    semantic:
      'usage-gaming',
  },

  {
    value:
      'creator',

    label:
      'Creator',

    description:
      '動画編集・配信・制作向け',

    semantic:
      'usage-creator',
  },

  {
    value:
      'business',

    label:
      'Business',

    description:
      '業務・法人利用向け',

    semantic:
      'usage-business',
  },

  {
    value:
      'ai',

    label:
      'AI',

    description:
      'AI画像生成・LLM向け',

    semantic:
      'usage-ai',
  },

]

/* =========================================
🔥 Resolve Semantic Usage
========================================= */

export function
resolveSemanticUsage(
  purpose?: string
) {

  return PURPOSE_TO_SEMANTIC[
    purpose as FinderPurpose
  ]

  || 'usage-gaming'
}

/* =========================================
🔥 Resolve Semantic Label
========================================= */

export function
resolveSemanticLabel(
  purpose?: string
) {

  return PURPOSE_LABELS[
    purpose as FinderPurpose
  ]

  || 'Semantic Recommendation'
}

/* =========================================
🔥 Resolve Semantic Description
========================================= */

export function
resolveSemanticDescription(
  purpose?: string
) {

  return PURPOSE_DESCRIPTIONS[
    purpose as FinderPurpose
  ]

  || `
semantic recommendation
system
`
}

/* =========================================
🔥 Normalize Finder Results
========================================= */

export function
normalizeFinderResults(
  response: any
) {

  console.log(
    '🔥 FINDER NORMALIZE INPUT',
    response
  )

  if (
    Array.isArray(
      response
    )
  ) {

    return response
  }

  if (

    Array.isArray(
      response?.data?.products
    )

  ) {

    return response.data.products
  }

  if (

    Array.isArray(
      response?.results
    )

  ) {

    return response.results
  }

  return []
}

/* =========================================
🔥 Semantic Group Count
========================================= */

export function
countSemanticGroups(
  product: any
) {

  return Object.keys(

    product
      ?.grouped_attributes
      || {}

  ).length
}

/* =========================================
🔥 Semantic Match Check
========================================= */

export function
hasSemanticUsage(
  product: any,
  semanticUsage: string
) {

  const usages =

    product
      ?.grouped_attributes
      ?.usage

  if (
    !Array.isArray(
      usages
    )
  ) {

    return false
  }

  return usages.some(
    item => (

      item?.slug
      === semanticUsage

    )
  )
}

/* =========================================
🔥 Semantic Tags
========================================= */

export function
extractSemanticTags(
  product: any
) {

  const grouped =

    product
      ?.grouped_attributes
      || {}

  return Object.values(
    grouped
  )

    .flat()

    .slice(0, 8)

    .map(
      (item: any) => ({

        name:
          item?.name,

        slug:
          item?.slug,

      })
    )
}

/* =========================================
🔥 Semantic Confidence
========================================= */

export function
calculateSemanticConfidence(
  product: any
) {

  const semanticGroups =

    countSemanticGroups(
      product
    )

  const weight =

    product
      ?.semantic_score
      || 0

  const confidence =

    (
      semanticGroups
      * 10
    )

    +

    weight

  return Math.min(
    Math.round(
      confidence
    ),
    98
  )
}

/* =========================================
🔥 Semantic Debug
========================================= */

export function
debugFinderSemantic(
  payload: any
) {

  console.log(
    '\n🔥 ====================================='
  )

  console.log(
    '🔥 FINDER SEMANTIC DEBUG'
  )

  console.log(
    JSON.stringify(
      payload,
      null,
      2
    )
  )

  console.log(
    '🔥 =====================================\n'
  )
}