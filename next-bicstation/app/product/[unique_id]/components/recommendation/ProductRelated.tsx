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
🔥 Helpers
============================================================================ */

/**
 * Extract attributes that are actually present in the related product.
 *
 * IMPORTANT
 *
 * This component does NOT generate semantic meaning.
 *
 * It only presents observable / already-classified attributes
 * supplied by the related-product runtime.
 */

function extractRelatedAttributes(
  item: any,
): string[] {

  const attributes: string[] = []

  /* ==========================================================================
  CPU
  ========================================================================== */

  const cpu =
    item?.cpu_model
    || item?.cpuModel

  if (cpu) {

    attributes.push(
      `CPU: ${cpu}`
    )

  }

  /* ==========================================================================
  GPU
  ========================================================================== */

  const gpu =
    item?.gpu_model
    || item?.gpuModel

  if (gpu) {

    attributes.push(
      `GPU: ${gpu}`
    )

  }

  /* ==========================================================================
  MEMORY
  ========================================================================== */

  const memory =
    item?.memory_gb
    ?? item?.memoryGb

  if (
    memory !== undefined
    && memory !== null
  ) {

    attributes.push(
      `MEMORY: ${memory}GB`
    )

  }

  /* ==========================================================================
  STORAGE
  ========================================================================== */

  const storage =
    item?.storage_gb
    ?? item?.storageGb

  if (
    storage !== undefined
    && storage !== null
  ) {

    attributes.push(
      `STORAGE: ${storage}GB`
    )

  }

  /* ==========================================================================
  DISPLAY
  ========================================================================== */

  const display =
    item?.display_info
    || item?.displayInfo

  if (display) {

    attributes.push(
      `DISPLAY: ${display}`
    )

  }

  /* ==========================================================================
  BRAND
  ========================================================================== */

  if (item?.brand) {

    attributes.push(
      `BRAND: ${item.brand}`
    )

  }

  /* ==========================================================================
  SERIES
  ========================================================================== */

  if (item?.series) {

    attributes.push(
      `SERIES: ${item.series}`
    )

  }

  /* ==========================================================================
  PRODUCT TYPE
  ========================================================================== */

  const productType =
    item?.product_type
    || item?.productType

  if (productType) {

    attributes.push(
      `TYPE: ${productType}`
    )

  }

  return attributes

}

/* ============================================================================
🔥 Build Related Narratives
============================================================================ */

/**
 * Build display text from actual related-product attributes.
 *
 * No workflow inference.
 * No AI / gaming / creator inference.
 * No JSON keyword inspection.
 * No semantic meaning generation.
 */

function buildRelatedNarratives(
  related: any[],
) {

  const narratives: string[] = []

  if (
    !Array.isArray(related)
  ) {

    return narratives

  }

  related.forEach(
    (
      item: any
    ) => {

      const attributes =
        extractRelatedAttributes(
          item
        )

      if (
        attributes.length === 0
      ) {

        return

      }

      narratives.push(
        attributes
          .slice(0, 4)
          .join(' ・ ')
      )

    }
  )

  return Array.from(
    new Set(
      narratives
    )
  ).slice(0, 4)

}

/* ============================================================================
🔥 Component
============================================================================ */

export default function ProductRelated({

  product,
  related,

}: Props) {

  void product

  const narratives =
    buildRelatedNarratives(
      related
    )

  /* ==========================================================================
  Empty
  ========================================================================== */

  if (
    narratives.length === 0
  ) {

    return null

  }

  /* ==========================================================================
  Render
  ========================================================================== */

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
          CPU・GPU・メモリー・ストレージなど、
          主要な製品構成をもとに、
          近い構成を持つPCを整理しています。
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
                key={
                  `${narrative}-${index}`
                }
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