// ============================================================================
// FILE:
// /home/maya/shin-vps/next-bicstation/app/product/[unique_id]/components/recommendation/ProductRelated.tsx
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
🔥 HELPERS
============================================================================ */

function buildRelatedNarratives(
product: any,
related: any[]
) {

const narratives: string[] = []

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

    // ================================================================
    // recommendation_reason
    // ================================================================

    if (
      item?.recommendation_reason
    ) {

      narratives.push(
        item.recommendation_reason
      )

    }

    // ================================================================
    // matched_attributes
    // ================================================================

    if (
      Array.isArray(
        item?.matched_attributes
      )
    ) {

      const matchedText =

        item.matched_attributes
          .map(
            (
              attr: any
            ) => {

              if (
                typeof attr === 'string'
              ) {

                return attr
              }

              return (
                attr?.label
                || attr?.name
                || ''
              )

            }
          )
          .filter(Boolean)
          .slice(0, 3)
          .join('・')

      if (
        matchedText
      ) {

        narratives.push(

          `${matchedText} の semantic runtime が近い構成です。`

        )

      }

    }

    // ================================================================
    // grouped_attributes
    // ================================================================

    if (
      item?.grouped_attributes
    ) {

      const groupedText =
        JSON.stringify(
          item.grouped_attributes
        ).toLowerCase()

      // ==============================================================
      // AI
      // ==============================================================

      if (
        groupedText.includes('ai')
      ) {

        narratives.push(
          'AI画像生成やローカルLLM用途で近いworkflowを持っています。'
        )

      }

      // ==============================================================
      // GAMING
      // ==============================================================

      if (
        groupedText.includes('gaming')
      ) {

        narratives.push(
          '高fps gaming やGPU活用用途に近い構成です。'
        )

      }

      // ==============================================================
      // CREATOR
      // ==============================================================

      if (
        groupedText.includes('creator')
        || groupedText.includes('video')
      ) {

        narratives.push(
          '動画編集・配信・制作workflowで近いsemantic構成です。'
        )

      }

    }

  }
)


}

// ==========================================================================
// PRODUCT FALLBACK
// ==========================================================================

if (
narratives.length === 0
) {


const text =
  JSON.stringify(product)
    .toLowerCase()

if (
  text.includes('rtx')
) {

  narratives.push(
    'RTX GPU を活かした高性能workflowに近い構成です。'
  )

}

if (
  text.includes('gaming')
) {

  narratives.push(
    'gaming用途や高fps環境に近いruntimeを持っています。'
  )

}

if (
  text.includes('creator')
) {

  narratives.push(
    '制作・編集workflowとの相性が高いsemantic構成です。'
  )

}

if (
  text.includes('ai')
) {

  narratives.push(
    'AI画像生成や生成AI用途に適したruntime構成です。'
  )

}


}

// ==========================================================================
// FINAL FALLBACK
// ==========================================================================

if (
narratives.length === 0
) {


narratives.push(
  '利用用途・workflow・semantic runtime が近いPCです。'
)


}

// ==========================================================================
// UNIQUE
// ==========================================================================

return Array.from(
new Set(narratives)
).slice(0, 4)

}

/* ============================================================================
🔥 COMPONENT
============================================================================ */

export default function ProductRelated({

product,

related,

}: Props) {

// ==========================================================================
// Narrative Runtime
// ==========================================================================

const narratives =


buildRelatedNarratives(
  product,
  related
)


// ==========================================================================
// EMPTY
// ==========================================================================

if (
narratives.length === 0
) {


return null


}

// ==========================================================================
// RENDER
// ==========================================================================

return (


<section
  className={
    styles.relatedSection
  }
>

  {/* ================================================================
  HEADER
  ================================================================ */}

  <div
    className={
      styles.relatedHeader
    }
  >

    <div
      className={
        styles.relatedLabel
      }
    >

      SEMANTIC RELATION

    </div>

    <h2
      className={
        styles.relatedTitle
      }
    >

      このPCと近い構成

    </h2>

    <p
      className={
        styles.relatedDescription
      }
    >

      semantic runtime・workflow・
      GPU構成・用途分析をもとに、
      近い方向性を持つPCを整理しています。

    </p>

  </div>

  {/* ================================================================
  GRID
  ================================================================ */}

  <div
    className={
      styles.relatedNarratives
    }
  >

    {
      narratives.map(
        (
          narrative,
          index
        ) => (

          <div
            key={index}

            className={
              styles.relatedNarrativeCard
            }
          >

            {narrative}

          </div>

        )
      )
    }

  </div>

</section>


)
}
