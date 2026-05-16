// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/selectors/ranking/selectSemanticInsights.ts

/* =========================================
🔥 Selector
========================================= */

export function
selectSemanticInsights(

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
  🔥 Product Metrics
  ====================================== */

  const prices =

    products

      .map(
        (
          product: any
        ) => (

          product?.price
          || 0

        )
      )

      .filter(Boolean)

  const averagePrice =

    prices.length

      ? Math.round(

          prices.reduce(
            (
              total,
              price
            ) => (

              total + price

            ),
            0
          )

          / prices.length

        )

      : 0

  const highestPrice =

    prices.length

      ? Math.max(...prices)

      : 0

  const lowestPrice =

    prices.length

      ? Math.min(...prices)

      : 0

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

  /* ======================================
  🔥 Insights
  ====================================== */

  const insights = [

    {

      title:
        'Semantic Runtime Density',

      description: `
semantic runtime 内に
${products.length} 件の product が存在します。

attribute ranking density が
高い runtime です。
      `.trim(),

      icon:
        '🧠',
    },

    {

      title:
        'Maker Diversity',

      description: `
${makers.size} 種類の maker が
ranking runtime に含まれています。

semantic ontology 上で
多様な product 構成を持っています。
      `.trim(),

      icon:
        '🏭',
    },

    {

      title:
        'Price Distribution',

      description: `
最低価格 ¥${lowestPrice.toLocaleString()}
〜
最高価格 ¥${highestPrice.toLocaleString()}
までの
価格帯を含みます。

平均価格は
¥${averagePrice.toLocaleString()}
です。
      `.trim(),

      icon:
        '💴',
    },

  ]

  /* ======================================
  🔥 Semantic Role
  ====================================== */

  if (
    semantic?.semantic_role
  ) {

    insights.push({

      title:
        'Semantic Role',

      description: `
backend semantic ontology runtime により、
この attribute は
「${semantic.semantic_role}」
role として定義されています。
      `.trim(),

      icon:
        '✨',
    })

  }

  /* ======================================
  🔥 Semantic Weight
  ====================================== */

  if (
    typeof
      semantic?.semantic_weight
    === 'number'
  ) {

    insights.push({

      title:
        'Semantic Weight',

      description: `
semantic weight は
${semantic.semantic_weight}
です。

ontology runtime 上での
重要度・密度を示しています。
      `.trim(),

      icon:
        '⚡',
    })

  }

  /* ======================================
  🔥 Return
  ====================================== */

  return insights
}