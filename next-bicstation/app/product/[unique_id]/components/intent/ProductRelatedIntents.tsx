// ============================================================================
// FILE:
// app/product/[unique_id]/components/intent/ProductRelatedIntents.tsx
// ============================================================================

import Link
  from 'next/link'

import styles
  from './intent.module.css'

/* ============================================================================
🔥 Projection
============================================================================ */

import type {
  ProjectedSemanticRuntime,
  ProjectedRelatedIntent,
} from '@/shared/lib/api/django/pc/product-detail'

/* ============================================================================
🔥 Props
============================================================================ */

type Props = {

  semanticRuntime?: ProjectedSemanticRuntime

}

/* ============================================================================
🔥 Helpers
============================================================================ */

/**
 * ============================================================================
 * Related Intent Guard
 * ============================================================================
 *
 * Projectionから渡されたRelated Intentを、
 * UIとして安全に利用できる形だけに限定する。
 *
 * ここでは意味を生成しない。
 *
 * ✓ 型安全性
 * ✓ Null Safety
 * ✓ UI破壊防止
 *
 * ✗ Meaning Generation
 * ✗ Semantic Generation
 * ✗ Runtime Generation
 *
 * ============================================================================
 */

function isRelatedIntent(
  value: unknown,
): value is ProjectedRelatedIntent {

  if (
    !value
    || typeof value !== 'object'
  ) {

    return false

  }

  const intent =
    value as ProjectedRelatedIntent

  if (
    typeof intent.groupSlug !== 'string'
    || !intent.groupSlug.trim()
  ) {

    return false

  }

  if (
    typeof intent.title !== 'string'
    || !intent.title.trim()
  ) {

    return false

  }

  if (
    intent.description !== undefined
    && intent.description !== null
    && typeof intent.description !== 'string'
  ) {

    return false

  }

  return true

}

/* ============================================================================
🔥 Build Related Intents
============================================================================ */

function getRelatedIntents(
  semanticRuntime?: ProjectedSemanticRuntime,
): ProjectedRelatedIntent[] {

  const relatedIntents =
    semanticRuntime?.relatedIntents

  if (
    !Array.isArray(
      relatedIntents
    )
  ) {

    return []

  }

  return relatedIntents.filter(
    isRelatedIntent
  )

}

/* ============================================================================
🔥 Component
============================================================================ */

export default function ProductRelatedIntents({

  semanticRuntime,

}: Props) {

  const intents =
    getRelatedIntents(
      semanticRuntime
    )

  /* ==========================================================================
  Debug
  ========================================================================== */

  console.log(
    '🔥 PRODUCT RELATED INTENTS',
    {

      relatedIntents:
        semanticRuntime?.relatedIntents,

      validIntents:
        intents,

      count:
        intents.length,

    }
  )

  /* ==========================================================================
  Empty
  ========================================================================== */

  if (
    intents.length === 0
  ) {

    return null

  }

  /* ==========================================================================
  Render
  ========================================================================== */

  return (

    <section
      className={
        styles.intentSection
      }
    >

      {/* ==========================================================
      HEADER
      ========================================================== */}

      <div
        className={
          styles.header
        }
      >

        <div
          className={
            styles.label
          }
        >
          RELATED DISCOVERY
        </div>

        <h2
          className={
            styles.title
          }
        >
          次に探索する分野
        </h2>

        <p
          className={
            styles.description
          }
        >
          この製品に関連する
          Discovery Runtime を表示しています。
        </p>

      </div>

      {/* ==========================================================
      INTENT GRID
      ========================================================== */}

      <div
        className={
          styles.grid
        }
      >

        {
          intents.map(
            (
              intent,
              index
            ) => (

              <Link
                key={
                  `${intent.groupSlug}-${index}`
                }

                href={
                  `/discover/${encodeURIComponent(
                    intent.groupSlug
                  )}`
                }

                className={
                  styles.card
                }
              >

                {/* ==================================================
                Content
                ================================================== */}

                <div
                  className={
                    styles.cardContent
                  }
                >

                  <h3
                    className={
                      styles.cardTitle
                    }
                  >
                    {
                      intent.title
                    }
                  </h3>

                  {
                    intent.description
                    && (

                      <p
                        className={
                          styles.cardDescription
                        }
                      >
                        {
                          intent.description
                        }
                      </p>

                    )
                  }

                </div>

                {/* ==================================================
                Action
                ================================================== */}

                <div
                  className={
                    styles.cardAction
                  }
                >
                  探索する →
                </div>

              </Link>

            )
          )
        }

      </div>

    </section>

  )

}