// ============================================================================
// FILE:
// /home/maya/shin-vps/next-bicstation/app/product/[unique_id]/components/recommendation/ProductSimilarUsage.tsx
// ============================================================================

'use client'

/* ============================================================================
🔥 Styles
============================================================================ */

import styles
from './recommendation.module.css'

/* ============================================================================
🔥 Props
============================================================================ */

type Props = {

product: any

related: any[]
}

/* ============================================================================
🔥 Helpers
============================================================================ */

function buildUsageNarratives(
product: any,
related: any[]
) {

const usages: string[] = []

// ==========================================================================
// RELATED RUNTIME
// ==========================================================================

if (
Array.isArray(
related
)
) {


related.forEach(
  (
    item: any
  ) => {

    const text =
      JSON.stringify(item)
        .toLowerCase()

    // ================================================================
    // AI
    // ================================================================

    if (
      text.includes('ai')
      || text.includes('llm')
      || text.includes('stable diffusion')
    ) {

      usages.push(
        'AI画像生成・ローカルLLM・生成AI workflow に近い構成です'
      )

    }

    // ================================================================
    // VIDEO EDIT
    // ================================================================

    if (
      text.includes('premiere')
      || text.includes('davinci')
      || text.includes('creator')
      || text.includes('video')
    ) {

      usages.push(
        '動画編集・配信・制作workflowとの相性が高い構成です'
      )

    }

    // ================================================================
    // GAMING
    // ================================================================

    if (
      text.includes('gaming')
      || text.includes('rtx')
      || text.includes('geforce')
    ) {

      usages.push(
        '高fps gaming・GPU活用・配信向けworkflowに近い構成です'
      )

    }

    // ================================================================
    // BUSINESS
    // ================================================================

    if (
      text.includes('business')
      || text.includes('office')
    ) {

      usages.push(
        '日常業務・business workflow に適したsemantic runtimeです'
      )

    }

    // ================================================================
    // CREATIVE
    // ================================================================

    if (
      text.includes('creator')
      || text.includes('creative')
    ) {

      usages.push(
        'クリエイティブ制作やGPU acceleration用途に近いruntimeです'
      )

    }

  }
)


}

// ==========================================================================
// PRODUCT FALLBACK
// ==========================================================================

if (
usages.length === 0
) {


const text =
  JSON.stringify(product)
    .toLowerCase()

if (
  text.includes('ai')
) {

  usages.push(
    'AI・生成AI workflow に適したGPU runtime構成です'
  )

}

if (
  text.includes('gaming')
) {

  usages.push(
    'gaming用途や高fps環境に向いたsemantic runtimeです'
  )

}

if (
  text.includes('creator')
) {

  usages.push(
    '制作・動画編集workflowとの親和性が高い構成です'
  )

}

if (
  text.includes('rtx')
) {

  usages.push(
    'RTX GPUを活かした高性能workflowに近い構成です'
  )

}


}

// ==========================================================================
// FINAL FALLBACK
// ==========================================================================

if (
usages.length === 0
) {


usages.push(
  'workflow・用途・semantic runtime が近いPCです'
)


}

// ==========================================================================
// UNIQUE
// ==========================================================================

return Array.from(
new Set(usages)
).slice(0, 4)

}

/* ============================================================================
🔥 COMPONENT
============================================================================ */

export default function ProductSimilarUsage({

product,

related,

}: Props) {

// ==========================================================================
// Runtime Narratives
// ==========================================================================

const usages =


buildUsageNarratives(
  product,
  related
)


// ==========================================================================
// EMPTY
// ==========================================================================

if (
usages.length === 0
) {


return null


}

// ==========================================================================
// RENDER
// ==========================================================================

return (


<section
  className={
    styles.similarUsageSection
  }
>

  {/* ================================================================
  HEADER
  ================================================================ */}

  <div
    className={
      styles.similarUsageHeader
    }
  >

    <div
      className={
        styles.similarUsageLabel
      }
    >

      SIMILAR WORKFLOW

    </div>

    <h2
      className={
        styles.similarUsageTitle
      }
    >

      近いworkflow・用途

    </h2>

    <p
      className={
        styles.similarUsageDescription
      }
    >

      semantic runtime・GPU構成・
      workflow分析をもとに、
      近い用途を持つ構成を整理しています。

    </p>

  </div>

  {/* ================================================================
  GRID
  ================================================================ */}

  <div
    className={
      styles.similarUsageGrid
    }
  >

    {
      usages.map(
        (
          usage,
          index
        ) => (

          <div
            key={index}

            className={
              styles.similarUsageCard
            }
          >

            {usage}

          </div>

        )
      )
    }

  </div>

</section>


)
}
