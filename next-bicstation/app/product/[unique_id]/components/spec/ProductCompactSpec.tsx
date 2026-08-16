// ============================================================================
// FILE:
// next-bicstation/app/product/[unique_id]/components/spec/ProductCompactSpec.tsx
//
// SHIN CORE LINX
// Product Quick Specification Experience
//
// RESPONSIBILITY
//
// Projected Product
//        ↓
// ProductCompactSpec
//        ↓
// Quick Product Configuration
//
// PURPOSE
//
// ProductCompactSpec provides a fast visual understanding of the
// most important hardware configuration.
//
// ✓ CPU
// ✓ GPU
// ✓ Memory
// ✓ Storage
// ✓ Product identity in heading
// ✓ Null-safe rendering
//
// ✗ Semantic generation
// ✗ Product classification
// ✗ Recommendation generation
// ✗ Observation parsing
// ✗ Runtime generation
//
// Detailed specification is handled by:
//      ProductSpec
//
// Observation Reality is handled by:
//      ProductRadar
//
// ============================================================================

/* ============================================================================
🔥 Styles
============================================================================ */

import styles
  from './spec.module.css'


/* ============================================================================
🔥 Projection
============================================================================ */

import type {

  ProjectedProduct,

} from '@/shared/lib/api/django/pc/product-detail'


/* ============================================================================
🔥 Types
============================================================================ */

type Props = {

  product:
    ProjectedProduct

}


type CompactSpec = {

  label:
    string

  value:
    string

}


/* ============================================================================
🔥 Helpers
============================================================================ */

/**
 * ============================================================================
 * Build Quick Specifications
 * ============================================================================
 *
 * ProductCompactSpec only reads canonical ProjectedProduct fields.
 *
 * It does not inspect:
 *
 * ✗ observation runtime
 * ✗ semantic runtime
 * ✗ compiled runtime
 *
 * It does not generate meaning.
 *
 * ============================================================================
 */

function buildCompactSpecs(
  product:
    ProjectedProduct
): CompactSpec[] {

  const specs:
    CompactSpec[] = []


  /* ==========================================================================
  CPU
  ========================================================================== */

  const cpu =
    product.cpuModel?.trim()
    ||
    ''


  if (cpu) {

    specs.push({

      label:
        'CPU',

      value:
        cpu,

    })

  }


  /* ==========================================================================
  GPU
  ========================================================================== */

  const gpu =
    product.gpuModel?.trim()
    ||
    ''


  if (gpu) {

    specs.push({

      label:
        'GPU',

      value:
        gpu,

    })

  }


  /* ==========================================================================
  MEMORY
  ========================================================================== */

  const memory =
    product.memoryGb


  if (
    typeof memory === 'number'
    &&
    Number.isFinite(memory)
    &&
    memory > 0
  ) {

    specs.push({

      label:
        'MEMORY',

      value:
        `${memory}GB`,

    })

  }


  /* ==========================================================================
  STORAGE
  ========================================================================== */

  const storage =
    product.storageGb


  if (
    typeof storage === 'number'
    &&
    Number.isFinite(storage)
    &&
    storage > 0
  ) {

    specs.push({

      label:
        'STORAGE',

      value:
        `${storage}GB`,

    })

  }


  return specs.slice(
    0,
    4
  )

}


/* ============================================================================
🔥 Component
============================================================================ */

export default function ProductCompactSpec({

  product,

}: Props) {


  /* ==========================================================================
  Guard
  ========================================================================== */

  if (!product) {

    return null

  }


  /* ==========================================================================
  Product Identity
  ========================================================================== */

  const productName =
    product.name?.trim()
    ||
    'このPC'


  /* ==========================================================================
  Quick Specifications
  ========================================================================== */

  const specs =
    buildCompactSpecs(
      product
    )


  /* ==========================================================================
  Empty Guard
  ========================================================================== */

  if (
    specs.length === 0
  ) {

    return null

  }


  /* ==========================================================================
  Render
  ========================================================================== */

  return (

    <section

      className={
        styles.compactSpecSection
      }

      aria-labelledby="product-quick-spec-title"

    >

      {/* ======================================================================
      HEADER
      ====================================================================== */}

      <div
        className={
          styles.compactSpecHeader
        }
      >

        <div
          className={
            styles.compactSpecLabel
          }
        >

          QUICK SPECS

        </div>


        <h2

          id="product-quick-spec-title"

          className={
            styles.compactSpecTitle
          }
        >

          {productName}
          の主要スペック

        </h2>


        <p
          className={
            styles.compactSpecDescription
          }
        >

          CPU・GPU・メモリー・ストレージから、
          このPCの主要な構成をすばやく確認できます。

        </p>

      </div>


      {/* ======================================================================
      SPEC GRID
      ====================================================================== */}

      <div
        className={
          styles.compactSpecGrid
        }

        aria-label="主要スペック"

      >

        {
          specs.map(
            (
              spec
            ) => (

              <div

                key={
                  spec.label
                }

                className={
                  styles.compactSpecCard
                }

              >

                <div
                  className={
                    styles.compactSpecCardLabel
                  }
                >

                  {
                    spec.label
                  }

                </div>


                <div
                  className={
                    styles.compactSpecCardValue
                  }
                >

                  {
                    spec.value
                  }

                </div>

              </div>

            )
          )
        }

      </div>


      {/* ======================================================================
      FOOTER
      ====================================================================== */}

      <div
        className={
          styles.compactSpecFooter
        }
      >

        <div
          className={
            styles.compactSpecFooterText
          }
        >

          基本構成をひと目で確認できます。

        </div>

      </div>

    </section>

  )

}