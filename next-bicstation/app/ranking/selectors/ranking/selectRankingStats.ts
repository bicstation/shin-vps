// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/selectors/ranking/selectRankingStats.ts

/* =========================================
🔥 Selector
========================================= */

export function
selectRankingStats(

  runtime?: any

) {

  /* ======================================
  🔥 Runtime
  ====================================== */

  const products =

    Array.isArray(
      runtime?.products
    )

      ? runtime.products

      : []

  const semantic =

    runtime?.semantic
    || {}

  /* ======================================
  🔥 Empty
  ====================================== */

  if (!products.length) {
    return []
  }

  /* ======================================
  🔥 Stats
  ====================================== */

  const totalProducts =

    products.length

  const makers =

    new Set(

      products.map(
        (
          product: any
        ) => (

          product?.maker
          || 'unknown'

        )
      )

    )

  const averagePrice =

    Math.round(

      products.reduce(

        (
          total: number,
          product: any
        ) => (

          total
          + (
            product?.price
            || 0
          )

        ),

        0

      )

      / totalProducts

    )

  const highestPrice =

    Math.max(

      ...products.map(
        (
          product: any
        ) => (

          product?.price
          || 0

        )
      )

    )

  /* ======================================
  🔥 Return
  ====================================== */

  return [

    {

      label:
        'products',

      value:
        totalProducts,

      description:
        'semantic ranking runtime に含まれる product 数です。',
    },

    {

      label:
        'makers',

      value:
        makers.size,

      description:
        'ranking runtime に登場する maker 数です。',
    },

    {

      label:
        'average price',

      value:

        `¥${averagePrice.toLocaleString()}`,

      description:
        'ranking runtime 内 product の平均価格です。',
    },

    {

      label:
        'highest price',

      value:

        `¥${highestPrice.toLocaleString()}`,

      description:
        'runtime 内の最高価格 product です。',
    },

    {

      label:
        'semantic role',

      value:

        semantic?.semantic_role
        || 'ranking',

      description:
        'backend semantic ontology runtime に定義された role です。',
    },

    {

      label:
        'semantic weight',

      value:

        semantic?.semantic_weight
        || '-',

      description:
        'semantic density を示す ontology weight です。',
    },

  ]
}