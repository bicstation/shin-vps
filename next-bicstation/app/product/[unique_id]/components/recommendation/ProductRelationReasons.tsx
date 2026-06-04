// ============================================================================
// FILE:
// /home/maya/shin-vps/next-bicstation/app/product/[unique_id]/components/recommendation/ProductRelationReasons.tsx
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

related?: any[]
}

/* ============================================================================
🔥 HELPERS
============================================================================ */

function normalizeReason(
value: string
) {

return value


.replace(
  /^usage-/,
  ''
)

.replace(
  /^gpu-/,
  ''
)

.replace(
  /^cpu-/,
  ''
)

.replace(
  /^maker-/,
  ''
)

.replace(
  /^semantic-/,
  ''
)

.replace(
  /-/g,
  ' '
)

.trim()


}

/* ============================================================================
🔥 PUSH SAFE
============================================================================ */

function pushReason(
reasons: string[],
value?: string
) {

if (
!value
) {


return


}

const normalized =
normalizeReason(
value
)

if (
!normalized
) {


return


}

reasons.push(
normalized
)

}

/* ============================================================================
🔥 BUILD REASONS
============================================================================ */

function buildReasons(
product: any,
related?: any[]
) {

const reasons: string[] = []

// ==========================================================================
// PRODUCT MATCHED ATTRIBUTES
// ==========================================================================

const matched =
product?.matched_attributes
|| []

matched.forEach(
(
item: any
) => {


  if (
    typeof item === 'string'
  ) {

    pushReason(
      reasons,
      item
    )

    return
  }

  pushReason(
    reasons,
    item?.label
    || item?.name
  )

}


)

// ==========================================================================
// PRODUCT GROUPED ATTRIBUTES
// ==========================================================================

const grouped =
product?.grouped_attributes
|| {}

// ==========================================================================
// USAGE
// ==========================================================================

const usage =
grouped?.usage
|| []

usage.forEach(
(
item: any
) => {


  pushReason(

    reasons,

    item?.label
    || item?.name
    || item

  )

}


)

// ==========================================================================
// GPU
// ==========================================================================

const gpu =
grouped?.gpu
|| []

gpu.forEach(
(
item: any
) => {


  pushReason(

    reasons,

    item?.label
    || item?.name
    || item

  )

}


)

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

      pushReason(
        reasons,
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

      item.matched_attributes
        .forEach(
          (
            attr: any
          ) => {

            if (
              typeof attr === 'string'
            ) {

              pushReason(
                reasons,
                attr
              )

              return
            }

            pushReason(

              reasons,

              attr?.label
              || attr?.name

            )

          }
        )

    }

  }
)


}

// ==========================================================================
// SEMANTIC FALLBACK
// ==========================================================================

if (
reasons.length === 0
) {


const text =
  JSON.stringify(product)
    .toLowerCase()

if (
  text.includes('ai')
) {

  reasons.push(
    'AI workflow'
  )

}

if (
  text.includes('gaming')
) {

  reasons.push(
    'gaming performance'
  )

}

if (
  text.includes('creator')
) {

  reasons.push(
    'creator workflow'
  )

}

if (
  text.includes('rtx')
) {

  reasons.push(
    'RTX GPU'
  )

}


}

// ==========================================================================
// FINAL FALLBACK
// ==========================================================================

if (
reasons.length === 0
) {


reasons.push(
  'semantic runtime'
)


}

// ==========================================================================
// UNIQUE
// ==========================================================================

return Array.from(
new Set(reasons)
).slice(0, 8)

}

/* ============================================================================
🔥 COMPONENT
============================================================================ */

export default function ProductRelationReasons({

product,

related,

}: Props) {

// ==========================================================================
// Runtime Reasons
// ==========================================================================

const reasons =


buildReasons(
  product,
  related
)


// ==========================================================================
// EMPTY
// ==========================================================================

if (
reasons.length === 0
) {


return null


}

// ==========================================================================
// RENDER
// ==========================================================================

return (


<div
  className={
    styles.relationReasons
  }
>

  {
    reasons.map(
      (
        reason,
        index
      ) => (

        <div
          key={index}

          className={
            styles.relationReason
          }
        >

          ✓ {reason}

        </div>

      )
    )
  }

</div>


)
}
