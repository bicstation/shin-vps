// /semantic/finderRecommendation.ts

/* =========================================
🔥 Types
========================================= */

type Product = {

  unique_id?: string

  name?: string

  maker?: string

  price?: number

  spec_score?: number

  semantic_score?: number

  grouped_attributes?: Record<
    string,
    any[]
  >
}

/* =========================================
🔥 Semantic Weight
========================================= */

const SEMANTIC_WEIGHT = {

  usage: 0.30,

  gpu: 0.25,

  cpu: 0.15,

  memory: 0.10,

  maker: 0.08,

  storage: 0.07,

  price: 0.05,
}

/* =========================================
🔥 Safe Array
========================================= */

function safeArray(
  value: any
) {

  return Array.isArray(
    value
  )

    ? value

    : []
}

/* =========================================
🔥 Semantic Count
========================================= */

function getSemanticCount(
  product: Product,
  group: string
) {

  return safeArray(

    product
      ?.grouped_attributes
      ?.[group]

  ).length
}

/* =========================================
🔥 Usage Score
========================================= */

function getUsageScore(
  product: Product,
  semanticUsage: string
) {

  const usages =

    safeArray(

      product
        ?.grouped_attributes
        ?.usage

    )

  const matched =

    usages.some(
      item => (

        item?.slug
        === semanticUsage

      )
    )

  return matched
    ? 100
    : 0
}

/* =========================================
🔥 GPU Score
========================================= */

function getGPUScore(
  product: Product
) {

  const gpuCount =

    getSemanticCount(
      product,
      'gpu'
    )

  return Math.min(
    gpuCount * 25,
    100
  )
}

/* =========================================
🔥 CPU Score
========================================= */

function getCPUScore(
  product: Product
) {

  const cpuCount =

    getSemanticCount(
      product,
      'cpu'
    )

  return Math.min(
    cpuCount * 20,
    100
  )
}

/* =========================================
🔥 Memory Score
========================================= */

function getMemoryScore(
  product: Product
) {

  const memoryItems =

    safeArray(

      product
        ?.grouped_attributes
        ?.memory

    )

  const has32GB =

    memoryItems.some(
      item => (

        item?.slug
          ?.includes(
            '32'
          )

      )
    )

  return has32GB
    ? 100
    : 60
}

/* =========================================
🔥 Maker Score
========================================= */

function getMakerScore(
  product: Product
) {

  return product?.maker
    ? 85
    : 40
}

/* =========================================
🔥 Storage Score
========================================= */

function getStorageScore(
  product: Product
) {

  const storageCount =

    getSemanticCount(
      product,
      'storage'
    )

  return Math.min(
    storageCount * 20,
    100
  )
}

/* =========================================
🔥 Price Score
========================================= */

function getPriceScore(
  product: Product,
  maxPrice?: number
) {

  if (
    !maxPrice
    ||
    typeof product?.price
      !== 'number'
  ) {

    return 50
  }

  if (
    product.price
    <= maxPrice
  ) {

    return 100
  }

  const diff =

    product.price
    - maxPrice

  if (
    diff <= 30000
  ) {

    return 70
  }

  if (
    diff <= 80000
  ) {

    return 45
  }

  return 20
}

/* =========================================
🔥 Total Score
========================================= */

export function
calculateRecommendationScore({

  product,

  semanticUsage,

  maxPrice,

}: {

  product: Product

  semanticUsage: string

  maxPrice?: number
}) {

  const usageScore =

    getUsageScore(
      product,
      semanticUsage
    )

  const gpuScore =

    getGPUScore(
      product
    )

  const cpuScore =

    getCPUScore(
      product
    )

  const memoryScore =

    getMemoryScore(
      product
    )

  const makerScore =

    getMakerScore(
      product
    )

  const storageScore =

    getStorageScore(
      product
    )

  const priceScore =

    getPriceScore(
      product,
      maxPrice
    )

  const total =

    (
      usageScore
      * SEMANTIC_WEIGHT.usage
    )

    +

    (
      gpuScore
      * SEMANTIC_WEIGHT.gpu
    )

    +

    (
      cpuScore
      * SEMANTIC_WEIGHT.cpu
    )

    +

    (
      memoryScore
      * SEMANTIC_WEIGHT.memory
    )

    +

    (
      makerScore
      * SEMANTIC_WEIGHT.maker
    )

    +

    (
      storageScore
      * SEMANTIC_WEIGHT.storage
    )

    +

    (
      priceScore
      * SEMANTIC_WEIGHT.price
    )

  return Math.round(
    total
  )
}

/* =========================================
🔥 Sort Recommendations
========================================= */

export function
sortFinderRecommendations({

  products,

  semanticUsage,

  maxPrice,

}: {

  products: Product[]

  semanticUsage: string

  maxPrice?: number
}) {

  return [...products]

    .map(
      product => ({

        ...product,

        recommendation_score:

          calculateRecommendationScore({

            product,

            semanticUsage,

            maxPrice,

          }),

      })
    )

    .sort(
      (a, b) => (

        (b.recommendation_score || 0)

        -

        (a.recommendation_score || 0)

      )
    )
}

/* =========================================
🔥 Featured Recommendation
========================================= */

export function
pickFeaturedRecommendation(
  products: Product[]
) {

  if (
    !Array.isArray(
      products
    )
    ||
    !products.length
  ) {

    return null
  }

  return [...products]

    .sort(
      (a, b) => (

        (b.recommendation_score || 0)

        -

        (a.recommendation_score || 0)

      )
    )

    [0]
}

/* =========================================
🔥 Recommendation Confidence
========================================= */

export function
calculateRecommendationConfidence(
  product: Product
) {

  const semanticGroups =

    Object.keys(

      product
        ?.grouped_attributes
        || {}

    ).length

  const score =

    (
      semanticGroups
      * 12
    )

    +

    (
      product?.semantic_score
      || 0
    )

  return Math.min(
    Math.round(score),
    98
  )
}