// ============================================================================
// FILE:
// /home/maya/shin-vps/next-bicstation/app/product/[unique_id]/components/recommendation/ProductExplorationCard.tsx
// ============================================================================

'use client'

/* ============================================================================
🔥 Next
============================================================================ */

import Link
from 'next/link'

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
}

/* ============================================================================
🔥 Helpers
============================================================================ */

function buildSemanticChips(
product: any
) {

const chips: string[] = []

// ==========================================================================
// matched_attributes
// ==========================================================================

if (
Array.isArray(
product?.matched_attributes
)
) {


product.matched_attributes
  .slice(0, 4)
  .forEach(
    (
      item: any
    ) => {

      if (
        typeof item === 'string'
      ) {

        chips.push(item)

        return
      }

      if (
        item?.label
      ) {

        chips.push(
          item.label
        )

        return
      }

      if (
        item?.name
      ) {

        chips.push(
          item.name
        )
      }

    }
  )


}

// ==========================================================================
// fallback
// ==========================================================================

if (
chips.length === 0
) {


const text = JSON.stringify(
  product
).toLowerCase()

if (
  text.includes('rtx')
) {

  chips.push(
    'RTX'
  )
}

if (
  text.includes('ai')
) {

  chips.push(
    'AI'
  )
}

if (
  text.includes('gaming')
) {

  chips.push(
    'Gaming'
  )
}

if (
  text.includes('creator')
) {

  chips.push(
    'Creator'
  )
}


}

return chips.slice(0, 4)

}

/* ============================================================================
🔥 Recommendation Reason
============================================================================ */

function buildRecommendationReason(
product: any
) {

if (
product?.recommendation_reason
) {


return product
  .recommendation_reason


}

const text =
JSON.stringify(
product
).toLowerCase()

if (
text.includes('rtx')
&&
text.includes('ai')
) {


return (
  'AI画像生成やGPU活用ワークフローが近い構成です。'
)


}

if (
text.includes('gaming')
) {


return (
  '高fps gaming用途に近いsemantic構成です。'
)


}

if (
text.includes('creator')
) {


return (
  '動画編集や制作系workflowに近い構成です。'
)


}

return (
'利用用途やworkflowが近いPCです。'
)

}

/* ============================================================================
🔥 Confidence
============================================================================ */

function buildConfidence(
product: any
) {

if (
typeof product?.confidence
=== 'number'
) {


return Math.round(
  product.confidence * 100
)


}

return 82

}

/* ============================================================================
🔥 Component
============================================================================ */

export default function
ProductExplorationCard({
product,
}: Props) {

// ==========================================================================
// Values
// ==========================================================================

const title =


product?.name
|| 'UNKNOWN PRODUCT'


const image =


product?.image_url


const maker =


product?.maker_name
|| product?.maker
|| 'UNKNOWN'


const price =


product?.price


const uniqueId =


product?.unique_id


const recommendationReason =


buildRecommendationReason(
  product
)


const chips =


buildSemanticChips(
  product
)


const confidence =


buildConfidence(
  product
)


// ==========================================================================
// Render
// ==========================================================================

return (


<Link

  href={`/product/${uniqueId}`}

  className={
    styles.explorationCard
  }
>

  {/* ================================================================
  IMAGE
  ================================================================ */}

  <div
    className={
      styles.explorationImageArea
    }
  >

    {
      image && (

        <img
          src={image}
          alt={title}
          className={
            styles.explorationImage
          }
        />

      )
    }

  </div>

  {/* ================================================================
  BODY
  ================================================================ */}

  <div
    className={
      styles.explorationBody
    }
  >

    {/* ============================================================
    MAKER
    ============================================================ */}

    <div
      className={
        styles.explorationMaker
      }
    >

      {maker}

    </div>

    {/* ============================================================
    TITLE
    ============================================================ */}

    <h3
      className={
        styles.explorationTitle
      }
    >

      {title}

    </h3>

    {/* ============================================================
    RECOMMENDATION REASON
    ============================================================ */}

    <p
      className={
        styles.explorationReason
      }
    >

      {recommendationReason}

    </p>

    {/* ============================================================
    SEMANTIC CHIPS
    ============================================================ */}

    {
      chips.length > 0 && (

        <div
          className={
            styles.explorationChips
          }
        >

          {
            chips.map(
              (
                chip,
                index
              ) => (

                <span
                  key={index}
                  className={
                    styles.explorationChip
                  }
                >

                  {chip}

                </span>

              )
            )
          }

        </div>

      )
    }

    {/* ============================================================
    CONFIDENCE
    ============================================================ */}

    <div
      className={
        styles.explorationConfidence
      }
    >

      semantic match
      {' '}
      {confidence}
      %

    </div>

  </div>

  {/* ================================================================
  FOOTER
  ================================================================ */}

  <div
    className={
      styles.explorationFooter
    }
  >

    {
      price && (

        <div
          className={
            styles.explorationPrice
          }
        >

          ¥
          {Number(price)
            .toLocaleString()}

        </div>

      )
    }

  </div>

</Link>


)
}
