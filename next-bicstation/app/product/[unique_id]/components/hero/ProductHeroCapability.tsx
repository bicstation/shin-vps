// ============================================================================
// FILE:
// app/product/[unique_id]/components/hero/ProductHeroCapability.tsx
//
// SHIN CORE LINX
// Product Hero Capability Experience
//
// RESPONSIBILITY
//
// Projected Product
//      ↓
// Projected Semantic Runtime
//      ↓
// ProductHeroCapability
//      ↓
// Workflow Experience
//      ↓
// Recommendation Evidence
//
// ProductHeroCapability = Semantic Evidence Experience
//
// ✓ Product name presentation
// ✓ Workflow tags
// ✓ Semantic reasons
// ✓ UI label translation
// ✓ Empty / duplicate safety
// ✓ Section navigation anchor
//
// ✗ Semantic generation
// ✗ Workflow inference
// ✗ Recommendation generation
// ✗ Score generation
// ✗ Runtime generation
// ✗ Backend Reality modification
//
// ============================================================================

import styles
  from './styles/ProductHeroCapability.module.css'

/* ============================================================================
🔥 Projection
============================================================================ */

import type {

  ProjectedProduct,
  ProjectedSemanticRuntime,

} from '@/shared/lib/api/django/pc/product-detail'


/* ============================================================================
🔥 Types
============================================================================ */

type SemanticReason = {

  slug?:
    string

  title?:
    string

  description?:
    string

  role?:
    string

}


/* ============================================================================
🔥 Props
============================================================================ */

type Props = {

  product:
    ProjectedProduct

  semanticRuntime?:
    ProjectedSemanticRuntime

}


/* ============================================================================
🔥 Workflow Labels
============================================================================ */

/**
 * Backend / Adapterから提供された
 * workflow tagをUI表示用ラベルへ変換する。
 *
 * ここでは新しい意味を生成しない。
 */

function getWorkflowLabel(
  tag: string
): string {

  const labels:
    Record<string, string> = {

    'usage-ai':
      'AI開発・生成AI',

    'usage-gaming':
      'FPS・ゲームプレイ',

    'usage-creator':
      '動画編集・制作',

    'usage-business':
      'ビジネス用途',

    'usage-mobile':
      'モバイル利用',

  }

  return (
    labels[tag]
    ||
    tag
  )

}


/* ============================================================================
🔥 Workflow Observation
============================================================================ */

/**
 * Semantic Runtimeから提供された
 * workflow tagsを表示用データとして整理する。
 *
 * ✗ 新しいworkflowを生成しない
 * ✗ 推測しない
 */

function buildWorkflowTags(
  semanticRuntime?:
    ProjectedSemanticRuntime,
): string[] {

  const workflowTags =
    Array.isArray(
      semanticRuntime?.workflowTags
    )
      ? semanticRuntime.workflowTags
      : []

  return Array.from(
    new Set(

      workflowTags

        .filter(
          (
            tag
          ): tag is string =>

            typeof tag === 'string'
            &&
            tag.trim().length > 0

        )

        .map(
          (
            tag
          ) =>
            tag.trim()
        )

    )
  )

}


/* ============================================================================
🔥 Semantic Reason Observation
============================================================================ */

/**
 * Semantic Runtimeから提供された
 * recommendation evidenceを表示用に整理する。
 *
 * ✗ 推薦理由を新規生成しない
 * ✗ title / descriptionを推測しない
 */

function buildSemanticReasons(
  semanticRuntime?:
    ProjectedSemanticRuntime,
): SemanticReason[] {

  const reasons =
    semanticRuntime?.semanticReasons

  if (
    !Array.isArray(
      reasons
    )
  ) {

    return []

  }

  return reasons

    .filter(
      (
        reason
      ): reason is SemanticReason => {

        if (
          !reason
          ||
          typeof reason !== 'object'
        ) {

          return false

        }

        const title =
          (reason as SemanticReason).title

        return (

          typeof title === 'string'
          &&
          title.trim().length > 0

        )

      }
    )

    .map(
      (
        reason
      ) => ({

        slug:
          typeof reason.slug === 'string'
            ? reason.slug
            : undefined,

        title:
          reason.title?.trim(),

        description:
          typeof reason.description === 'string'
            && reason.description.trim()
              ? reason.description.trim()
              : undefined,

        role:
          typeof reason.role === 'string'
            && reason.role.trim()
              ? reason.role.trim()
              : undefined,

      })
    )

    .slice(
      0,
      6
    )

}


/* ============================================================================
🔥 Component
============================================================================ */

export default function ProductHeroCapability({

  product,

  semanticRuntime,

}: Props) {

  /* ==========================================================================
  Product Identity
  ========================================================================== */

  const productName =
    product.name?.trim()
    ||
    'このPC'


  /* ==========================================================================
  Observation
  ========================================================================== */

  const workflowTags =
    buildWorkflowTags(
      semanticRuntime
    )

  const semanticReasons =
    buildSemanticReasons(
      semanticRuntime
    )

  const hasWorkflow =
    workflowTags.length > 0

  const hasReasons =
    semanticReasons.length > 0


  /* ==========================================================================
  Empty
  ========================================================================== */

  if (
    !hasWorkflow
    &&
    !hasReasons
  ) {

    return null

  }


  /* ==========================================================================
  Render
  ========================================================================== */

  return (

    <section

      id="semantic"

      className={
        styles.heroCapabilitySection
      }

      aria-labelledby="product-capability-title"

    >

      {/* ======================================================================
      WORKFLOW EXPERIENCE
      ====================================================================== */}

      {

        hasWorkflow && (

          <div
            className={
              styles.heroCapabilityGroup
            }
          >

            {/* ================================================================
            HEADER
            ================================================================ */}

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

                WORKFLOW EXPERIENCE

              </div>

              <h2

                id="product-capability-title"

                className={
                  styles.heroCapabilityTitle
                }

              >

                {productName}
                でできること

              </h2>

              <p
                className={
                  styles.heroCapabilityDescription
                }
              >

                {productName}
                が対応する主な利用シーンです。

              </p>

            </div>


            {/* ================================================================
            WORKFLOW GRID
            ================================================================ */}

            <div
              className={
                styles.heroCapabilityGrid
              }
            >

              {

                workflowTags.map(

                  (
                    tag
                  ) => (

                    <div

                      key={
                        tag
                      }

                      className={
                        styles.heroCapabilityCard
                      }

                    >

                      <div
                        className={
                          styles.heroCapabilityText
                        }
                      >

                        {
                          getWorkflowLabel(
                            tag
                          )
                        }

                      </div>

                    </div>

                  )

                )

              }

            </div>

          </div>

        )

      }


      {/* ======================================================================
      WHY THIS PRODUCT
      ====================================================================== */}

      {

        hasReasons && (

          <div
            className={
              styles.heroCapabilityGroup
            }
          >

            {/* ================================================================
            HEADER
            ================================================================ */}

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

                WHY THIS PRODUCT

              </div>

              <h2
                className={
                  styles.heroCapabilityTitle
                }
              >

                {productName}
                が選ばれる理由

              </h2>

              <p
                className={
                  styles.heroCapabilityDescription
                }
              >

                {productName}
                を候補として検討するための
                主なポイントです。

              </p>

            </div>


            {/* ================================================================
            REASON GRID
            ================================================================ */}

            <div
              className={
                styles.heroCapabilityGrid
              }
            >

              {

                semanticReasons.map(

                  (
                    reason,
                    index
                  ) => (

                    <article

                      key={

                        reason.slug
                        ||
                        `${reason.title}-${index}`

                      }

                      className={
                        styles.heroCapabilityCard
                      }

                    >

                      <div
                        className={
                          styles.heroCapabilityText
                        }
                      >

                        {
                          reason.title
                        }

                      </div>


                      {

                        reason.description && (

                          <div
                            className={
                              styles.heroCapabilitySubText
                            }
                          >

                            {
                              reason.description
                            }

                          </div>

                        )

                      }

                    </article>

                  )

                )

              }

            </div>

          </div>

        )

      }

    </section>

  )

}