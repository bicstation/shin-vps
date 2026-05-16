// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/[slug]/selectors/selectAttributeInsights.ts

/* =========================================
🔥 Types
========================================= */

type Insight = {

  title: string

  description: string

  icon?: string
}

/* =========================================
🔥 Selector
========================================= */

export function
selectAttributeInsights(

  runtime?: any

): Insight[] {

  /* ======================================
  🔥 Empty
  ====================================== */

  if (
    !runtime
    || typeof runtime !== 'object'
  ) {
    return []
  }

  /* ======================================
  🔥 Runtime
  ====================================== */

  const semantic =

    runtime?.semantic
    || {}

  const products =

    Array.isArray(
      runtime?.products
    )

      ? runtime.products

      : []

  const productCount =
    products.length

  const metadata = {

    name:
      semantic?.name
      || semantic?.title
      || 'Semantic Attribute',

    role:
      semantic?.semantic_role
      || 'primary',

    weight:
      semantic?.semantic_weight
      || 0,

    count:
      semantic?.count
      || productCount,
  }

  /* ======================================
  🔥 Insights
  ====================================== */

  const insights: Insight[] = []

  /* ======================================
  🔥 Product Scale
  ====================================== */

  insights.push({

    title:
      'Product Scale Analysis',

    icon:
      '📊',

    description:
      `
${metadata.name}
semantic attribute は
${metadata.count} 件の product runtime と関連しています。

semantic ranking runtime 上で
高い visibility を持つ attribute group と判断されています。
`.trim(),
  })

  /* ======================================
  🔥 Semantic Role
  ====================================== */

  insights.push({

    title:
      'Semantic Role Interpretation',

    icon:
      '🧠',

    description:
      `
runtime semantic role は
「${metadata.role}」として定義されています。

frontend rendering layer では
ranking priority / visibility / emphasis の
制御に利用できます。
`.trim(),
  })

  /* ======================================
  🔥 Semantic Weight
  ====================================== */

  insights.push({

    title:
      'Semantic Weight Evaluation',

    icon:
      '⚡',

    description:
      `
semantic weight は
${Math.round(
  metadata.weight * 100
)}% です。

backend semantic ontology authority によって
importance score が管理されています。
`.trim(),
  })

  /* ======================================
  🔥 Product Runtime
  ====================================== */

  if (products.length) {

    const topProduct =
      products[0]

    insights.push({

      title:
        'Top Runtime Product',

      icon:
        '🏆',

      description:
        `
現在の ranking runtime における
top product は
「${topProduct?.name || 'Unknown'}」です。

semantic ranking orchestration により
順位が生成されています。
`.trim(),
    })

  }

  /* ======================================
  🔥 Return
  ====================================== */

  return insights
}