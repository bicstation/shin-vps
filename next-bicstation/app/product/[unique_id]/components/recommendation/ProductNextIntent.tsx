// ============================================================================
// FILE:
// /home/maya/shin-vps/next-bicstation/app/product/[unique_id]/components/recommendation/ProductNextIntent.tsx
// ============================================================================

'use client'

/* ============================================================================
🔥 Styles
============================================================================ */

import styles
  from './recommendation.module.css'

/* ============================================================================
🔥 Projection
============================================================================ */

import type {
  ProjectedProduct,
  ProjectedSemanticRuntime,
} from '@/shared/lib/api/django/pc/product-detail'

/* ============================================================================
🔥 Props
============================================================================ */

type Props = {

  product: ProjectedProduct

  related: any[]

  semanticRuntime?: ProjectedSemanticRuntime

}

/* ============================================================================
🔥 Helpers
============================================================================ */

/* ============================================================================
🔥 Build Observation
============================================================================ */

function buildNextIntentObservation(
  semanticRuntime?: ProjectedSemanticRuntime,
) {

  const summary =
    semanticRuntime?.semanticSummary
    || ''

  const workflowTags =
    Array.isArray(
      semanticRuntime?.workflowTags
    )
      ? semanticRuntime.workflowTags
      : []

  const semanticLabels =
    Array.isArray(
      semanticRuntime?.semanticLabels
    )
      ? semanticRuntime.semanticLabels
      : []

  return {

    summary,

    workflowTags:
      Array.from(
        new Set(
          workflowTags
            .filter(
              (
                value
              ) =>
                typeof value === 'string'
                && value.trim()
            )
        )
      ),

    semanticLabels:
      Array.from(
        new Set(
          semanticLabels
            .filter(
              (
                value
              ) =>
                typeof value === 'string'
                && value.trim()
            )
        )
      ),

  }

}

/* ============================================================================
🔥 Component
============================================================================ */

export default function ProductNextIntent({

  product,

  related,

  semanticRuntime,

}: Props) {

  /* ==========================================================================
  Observation
  ========================================================================== */

  const observation =
    buildNextIntentObservation(
      semanticRuntime
    )

  /* ==========================================================================
  Debug
  ========================================================================== */

  console.log(
    '🔥 PRODUCT NEXT INTENT OBSERVATION',
    {

      uniqueId:
        product?.uniqueId,

      productName:
        product?.name,

      relatedCount:
        Array.isArray(related)
          ? related.length
          : 0,

      semanticSummary:
        observation.summary,

      workflowTags:
        observation.workflowTags,

      semanticLabels:
        observation.semanticLabels,

    }
  )

  /* ==========================================================================
  Empty Guard
  ========================================================================== */

  const hasSummary =
    Boolean(
      observation.summary
    )

  const hasWorkflowTags =
    observation.workflowTags.length > 0

  const hasSemanticLabels =
    observation.semanticLabels.length > 0

  if (
    !hasSummary
    && !hasWorkflowTags
    && !hasSemanticLabels
  ) {

    return null

  }

  /* ==========================================================================
  Render
  ========================================================================== */

  return (

    <section
      className={
        styles.nextIntentSection
      }
    >

      {/* ==========================================================
      HEADER
      ========================================================== */}

      <div
        className={
          styles.nextIntentHeader
        }
      >

        <div
          className={
            styles.nextIntentLabel
          }
        >
          NEXT EXPLORATION
        </div>

        <h2
          className={
            styles.nextIntentTitle
          }
        >
          次に探索したい方向
        </h2>

        <p
          className={
            styles.nextIntentDescription
          }
        >
          この製品に対してBackend Runtimeで
          観測・整理されている探索情報を表示しています。
        </p>

      </div>

      {/* ==========================================================
      SUMMARY
      ========================================================== */}

      {
        hasSummary
        && (

          <div
            className={
              styles.nextIntentCard
            }
          >

            <div
              className={
                styles.nextIntentCardLabel
              }
            >
              SEMANTIC SUMMARY
            </div>

            <div
              className={
                styles.nextIntentCardValue
              }
            >
              {
                observation.summary
              }
            </div>

          </div>

        )
      }

      {/* ==========================================================
      WORKFLOW TAGS
      ========================================================== */}

      {
        hasWorkflowTags
        && (

          <div
            className={
              styles.nextIntentCard
            }
          >

            <div
              className={
                styles.nextIntentCardLabel
              }
            >
              WORKFLOW TAGS
            </div>

            <div
              className={
                styles.nextIntentTags
              }
            >

              {
                observation.workflowTags.map(
                  (
                    tag,
                    index
                  ) => (

                    <span
                      key={
                        `${tag}-${index}`
                      }

                      className={
                        styles.nextIntentTag
                      }
                    >
                      {
                        tag
                      }
                    </span>

                  )
                )
              }

            </div>

          </div>

        )
      }

      {/* ==========================================================
      SEMANTIC LABELS
      ========================================================== */}

      {
        hasSemanticLabels
        && (

          <div
            className={
              styles.nextIntentCard
            }
          >

            <div
              className={
                styles.nextIntentCardLabel
              }
            >
              SEMANTIC LABELS
            </div>

            <div
              className={
                styles.nextIntentTags
              }
            >

              {
                observation.semanticLabels.map(
                  (
                    label,
                    index
                  ) => (

                    <span
                      key={
                        `${label}-${index}`
                      }

                      className={
                        styles.nextIntentTag
                      }
                    >
                      {
                        label
                      }
                    </span>

                  )
                )
              }

            </div>

          </div>

        )
      }

      {/* ==========================================================
      FOOTER
      ========================================================== */}

      <div
        className={
          styles.nextIntentFooter
        }
      >

        Backend Product Semantic Runtimeから
        取得した情報を表示しています。

      </div>

    </section>

  )

}