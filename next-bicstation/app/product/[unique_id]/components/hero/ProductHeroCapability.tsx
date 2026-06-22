// ============================================================================
// FILE:
// app/product/[unique_id]/components/hero/ProductHeroCapability.tsx
// ============================================================================

import styles
  from './styles/ProductHeroCapability.module.css'

/* ============================================================================
🔥 Props
============================================================================ */

type Props = {

  product: any

  semanticRuntime?: {

    workflow_tags?: any[]

    semantic_labels?: any[]

  }

}

/* ============================================================================
🔥 Helpers
============================================================================ */

function getText(
  value: any
): string {

  if (
    value == null
  ) {

    return ''

  }

  if (
    typeof value === 'string'
  ) {

    return value

  }

  if (
    typeof value === 'number'
  ) {

    return String(value)

  }

  return (

    value?.title
    || value?.label
    || value?.name
    || value?.slug
    || ''

  )

}

function parseStrengths(
  strengths: any
): string[] {

  if (!strengths) {

    return []

  }

  if (
    Array.isArray(
      strengths
    )
  ) {

    return strengths

  }

  try {

    const parsed =

      JSON.parse(
        strengths
      )

    return Array.isArray(
      parsed
    )
      ? parsed
      : []

  }

  catch {

    return []

  }

}

/* ============================================================================
🔥 Component
============================================================================ */

export default function ProductHeroCapability({

  product,
  semanticRuntime,

}: Props) {

  const strengths =

    parseStrengths(
      product?.strengths
    )

  const workflowTags =

    semanticRuntime
      ?.workflow_tags

      ||

      []

  const semanticLabels =

    semanticRuntime
      ?.semantic_labels

      ||

      []

  const capabilityCards = [

    ...strengths,

    ...workflowTags.map(
      getText
    ),

    ...semanticLabels.map(
      getText
    ),

  ]
    .filter(Boolean)
    .slice(0, 12)

  if (
    capabilityCards.length === 0
  ) {

    return null

  }

  return (

    <section
      className={
        styles.heroCapabilitySection
      }
    >

      {/* ==========================================================
      HEADER
      ========================================================== */}

      <div
        className={
          styles.heroCapabilityHeader
        }
      >

        <div
          className={
            styles.heroCapabilityLabel
          }
        >
          CAPABILITIES
        </div>

        <h2
          className={
            styles.heroCapabilityTitle
          }
        >
          このPCで実現できること
        </h2>

        <p
          className={
            styles.heroCapabilityDescription
          }
        >
          Semantic Runtime が検出した
          利用シーン・ワークフロー・特徴を表示しています。
        </p>

      </div>

      {/* ==========================================================
      GRID
      ========================================================== */}

      <div
        className={
          styles.heroCapabilityGrid
        }
      >

        {

          capabilityCards.map(
            (
              card,
              index
            ) => (

              <div
                key={index}
                className={
                  styles.heroCapabilityCard
                }
              >

                <div
                  className={
                    styles.heroCapabilityText
                  }
                >
                  ✓ {card}
                </div>

              </div>

            )
          )

        }

      </div>

      {/* ==========================================================
      FOOTER
      ========================================================== */}

      <div
        className={
          styles.heroCapabilityFooter
        }
      >

        <div
          className={
            styles.heroCapabilityFooterText
          }
        >
          Backend Semantic Authority Runtime に基づく利用可能領域
        </div>

      </div>

    </section>

  )

}