// ============================================================================
// FILE:
// app/product/[unique_id]/components/hero/ProductHeroCapability.tsx
// Semantic Experience V3
// ============================================================================

import styles
  from './hero.module.css'

/* =========================================
🔥 Props
========================================= */

type Props = {

  product: any

  semanticRuntime?: {

    semantic_summary?: string

    workflow_tags?: any[]

    semantic_labels?: any[]

  }

}

/* =========================================
🔥 Helpers
========================================= */

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
    || value?.name
    || value?.label
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
    Array.isArray(strengths)
  ) {

    return strengths

  }

  try {

    const parsed =
      JSON.parse(
        strengths
      )

    return Array.isArray(parsed)
      ? parsed
      : []

  }

  catch {

    return []

  }

}

/* =========================================
🔥 COMPONENT
========================================= */

export default function ProductHeroCapability({

  product,
  semanticRuntime,

}: Props) {

  const summary =

    semanticRuntime
      ?.semantic_summary

  const targetUser =

    product?.target_user

  const strengths =

    parseStrengths(
      product?.strengths
    )

  const workflowTags =

    (semanticRuntime?.workflow_tags || [])
      .map(getText)
      .filter(Boolean)
      .slice(0, 6)

  return (

    <section
      className={
        styles.heroCapabilitySection
      }
    >

      {/* ==================================
      HEADER
      ================================== */}

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
          SEMANTIC EXPERIENCE
        </div>

        <h2
          className={
            styles.heroCapabilityTitle
          }
        >
          このPCで実現できること
        </h2>

      </div>

      {/* ==================================
      SUMMARY
      ================================== */}

      {summary && (

        <div
          className={
            styles.heroCapabilitySummary
          }
        >

          <div
            className={
              styles.heroCapabilityBlockLabel
            }
          >
            PRODUCT IDENTITY
          </div>

          <p
            className={
              styles.heroCapabilityDescription
            }
          >
            {summary}
          </p>

        </div>

      )}

      {/* ==================================
      TARGET USER
      ================================== */}

      {targetUser && (

        <div
          className={
            styles.heroCapabilitySummary
          }
        >

          <div
            className={
              styles.heroCapabilityBlockLabel
            }
          >
            TARGET USER
          </div>

          <p
            className={
              styles.heroCapabilityDescription
            }
          >
            {targetUser}
          </p>

        </div>

      )}

      {/* ==================================
      STRENGTHS
      ================================== */}

      {strengths.length > 0 && (

        <>

          <div
            className={
              styles.heroCapabilityBlockLabel
            }
          >
            KEY STRENGTHS
          </div>

          <div
            className={
              styles.heroCapabilityGrid
            }
          >

            {strengths.map(
              (
                strength,
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
                    ✓ {strength}
                  </div>

                </div>

              )
            )}

          </div>

        </>

      )}

      {/* ==================================
      WORKFLOWS
      ================================== */}

      {workflowTags.length > 0 && (

        <>

          <div
            className={
              styles.heroCapabilityBlockLabel
            }
          >
            RECOMMENDED WORKFLOWS
          </div>

          <div
            className={
              styles.heroCapabilityTags
            }
          >

            {workflowTags.map(
              (
                tag,
                index
              ) => (

                <div
                  key={index}
                  className={
                    styles.heroCapabilityTag
                  }
                >
                  {tag}
                </div>

              )
            )}

          </div>

        </>

      )}

      {/* ==================================
      FOOTER
      ================================== */}

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
          Semantic Authority Runtime に基づいて構築された製品体験サマリー
        </div>

      </div>

    </section>

  )

}