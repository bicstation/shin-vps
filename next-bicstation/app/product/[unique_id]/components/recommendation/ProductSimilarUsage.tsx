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

/**
 * ============================================================================
 * Build Workflow Observation
 * ============================================================================
 *
 * Backend / Adapterから既に提供されている
 * Semantic Runtimeをそのまま観測する。
 *
 * ここでは意味を生成しない。
 *
 * ✓ Runtime Observation
 * ✓ Null Safety
 * ✓ Duplicate Removal
 *
 * ✗ Meaning Generation
 * ✗ Semantic Generation
 * ✗ Keyword Classification
 * ✗ Product Inference
 *
 * ============================================================================
 */

function buildWorkflowObservation(
  semanticRuntime?: ProjectedSemanticRuntime,
) {

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

    workflowTags:
      Array.from(
        new Set(
          workflowTags.filter(
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
          semanticLabels.filter(
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

export default function ProductSimilarUsage({

  product,

  related,

  semanticRuntime,

}: Props) {

  /* ==========================================================================
  Observation
  ========================================================================== */

  const observation =
    buildWorkflowObservation(
      semanticRuntime
    )

  /* ==========================================================================
  Debug
  ========================================================================== */

  console.log(
    '🔥 PRODUCT SIMILAR USAGE OBSERVATION',
    {

      uniqueId:
        product?.uniqueId,

      productName:
        product?.name,

      relatedCount:
        Array.isArray(
          related
        )
          ? related.length
          : 0,

      workflowTags:
        observation.workflowTags,

      semanticLabels:
        observation.semanticLabels,

      semanticRuntime,

    }
  )

  /* ==========================================================================
  Empty
  ========================================================================== */

  const hasWorkflowTags =
    observation.workflowTags.length > 0

  const hasSemanticLabels =
    observation.semanticLabels.length > 0

  if (
    !hasWorkflowTags
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
        styles.similarUsageSection
      }
    >

      {/* ==========================================================
      HEADER
      ========================================================== */}

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
          Product Semantic Runtimeから
          取得されたworkflow・semantic情報を
          そのまま表示しています。
        </p>

      </div>

      {/* ==========================================================
      WORKFLOW TAGS
      ========================================================== */}

      {
        hasWorkflowTags
        && (

          <div
            className={
              styles.similarUsageGrid
            }
          >

            <div
              className={
                styles.similarUsageCard
              }
            >

              <div
                className={
                  styles.similarUsageCardLabel
                }
              >
                WORKFLOW TAGS
              </div>

              <div
                className={
                  styles.similarUsageTags
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
                          styles.similarUsageTag
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
              styles.similarUsageGrid
            }
          >

            <div
              className={
                styles.similarUsageCard
              }
            >

              <div
                className={
                  styles.similarUsageCardLabel
                }
              >
                SEMANTIC LABELS
              </div>

              <div
                className={
                  styles.similarUsageTags
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
                          styles.similarUsageTag
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

          </div>

        )
      }

      {/* ==========================================================
      FOOTER
      ========================================================== */}

      <div
        className={
          styles.similarUsageFooter
        }
      >

        Product Semantic Runtimeから
        取得された情報を表示しています。

      </div>

    </section>

  )

}