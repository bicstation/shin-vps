// ============================================================================
// FILE:
// next-bicstation/app/product/[unique_id]/components/spec/ProductSpec.tsx
// ============================================================================
//
// SHIN CORE LINX
// Product Basic Specification
//
// PURPOSE
//
// Product Detail
//      ↓
// ProjectedProduct
//      ↓
// ProductSpec
//
// ProductSpec = Basic Product Information UI
//
// ✓ Maker
// ✓ Brand
// ✓ Series
// ✓ Collaboration
// ✓ CPU
// ✓ GPU
// ✓ Memory
// ✓ Storage
// ✓ Display
//
// ✗ Observation Runtime
// ✗ Manufacturer-specific Reality
// ✗ Semantic Generation
// ✗ Runtime Generation
// ✗ Meaning Generation
//
// Manufacturer-specific Observation is handled by:
//
// components/spec/observation/
//      ├── LenovoObservation
//      ├── DefaultObservation
//      └── future manufacturer renderers
//
// ============================================================================

import styles from './spec.module.css'

/* ============================================================================
🔥 Props
============================================================================ */

type Props = {
  product: any
}

/* ============================================================================
🔥 Specification
============================================================================ */

type ProductSpecification = {

  label: string

  value: string

}

/* ============================================================================
🔥 Helpers
============================================================================ */

/**
 * ============================================================================
 * Product Basic Specifications
 * ============================================================================
 *
 * Product model itself already contains these normalized fields.
 *
 * This function does NOT inspect:
 *
 * observation_runtime
 * semantic_runtime
 * compiled_runtime
 *
 * It only prepares the basic Product View Model for presentation.
 *
 * ============================================================================
 */

function buildSpecs(
  product: any,
): ProductSpecification[] {

  const specs:
    ProductSpecification[] = []

  /* ========================================================================
  MAKER
  ======================================================================== */

  const maker =
    product?.maker
    ||
    product?.makerName
    ||
    product?.maker_name

  if (maker) {

    specs.push({

      label:
        'MAKER',

      value:
        String(maker),

    })

  }

  /* ========================================================================
  BRAND
  ======================================================================== */

  if (
    product?.brand
  ) {

    specs.push({

      label:
        'BRAND',

      value:
        String(product.brand),

    })

  }

  /* ========================================================================
  SERIES
  ======================================================================== */

  if (
    product?.series
  ) {

    specs.push({

      label:
        'SERIES',

      value:
        String(product.series),

    })

  }

  /* ========================================================================
  COLLABORATION
  ======================================================================== */

  if (
    product?.collaboration
  ) {

    specs.push({

      label:
        'COLLABORATION',

      value:
        String(product.collaboration),

    })

  }

  /* ========================================================================
  CPU
  ======================================================================== */

  const cpu =
    product?.cpuModel
    ||
    product?.cpu_model

  if (cpu) {

    specs.push({

      label:
        'CPU',

      value:
        String(cpu),

    })

  }

  /* ========================================================================
  GPU
  ======================================================================== */

  const gpu =
    product?.gpuModel
    ||
    product?.gpu_model

  if (gpu) {

    specs.push({

      label:
        'GPU',

      value:
        String(gpu),

    })

  }

  /* ========================================================================
  MEMORY
  ======================================================================== */

  const memory =
    product?.memoryGb
    ??
    product?.memory_gb

  if (
    memory != null
  ) {

    specs.push({

      label:
        'MEMORY',

      value:
        `${memory}GB`,

    })

  }

  /* ========================================================================
  STORAGE
  ======================================================================== */

  const storage =
    product?.storageGb
    ??
    product?.storage_gb

  if (
    storage != null
  ) {

    specs.push({

      label:
        'STORAGE',

      value:
        `${storage}GB`,

    })

  }

  /* ========================================================================
  DISPLAY
  ======================================================================== */

  const display =
    product?.displayInfo
    ||
    product?.display_info

  if (display) {

    specs.push({

      label:
        'DISPLAY',

      value:
        String(display),

    })

  }

  return specs

}

/* ============================================================================
🔥 Component
============================================================================ */

export default function ProductSpec({

  product,

}: Props) {

  /* ==========================================================================
  Guard
  ========================================================================== */

  if (
    !product
  ) {

    return null

  }

  /* ==========================================================================
  Product Name
  ========================================================================== */

  const productName =
    product?.name
    ||
    'このPC'

  /* ==========================================================================
  Basic Specifications
  ========================================================================== */

  const specs =
    buildSpecs(
      product
    )

  /* ==========================================================================
  Empty
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
        styles.specSection
      }
    >

      {/* ======================================================================
      HEADER
      ====================================================================== */}

      <div
        className={
          styles.specHeader
        }
      >

        <div
          className={
            styles.specLabel
          }
        >
          PRODUCT SPECIFICATIONS
        </div>

        <h2
          className={
            styles.specTitle
          }
        >
          {productName}
          の基本仕様
        </h2>

        <p
          className={
            styles.specDescription
          }
        >
          {productName}
          の主要な製品情報と構成を確認できます。
        </p>

      </div>

      {/* ======================================================================
      SPEC GRID
      ====================================================================== */}

      <div
        className={
          styles.specGrid
        }
      >

        {
          specs.map(
            (
              spec,
              index,
            ) => (

              <div
                key={
                  `${spec.label}-${index}`
                }

                className={
                  styles.specCard
                }
              >

                <div
                  className={
                    styles.specCardLabel
                  }
                >
                  {
                    spec.label
                  }
                </div>

                <div
                  className={
                    styles.specCardValue
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
          styles.specFooter
        }
      >

        {productName}
        の基本的な製品情報をまとめて確認できます。

      </div>

    </section>

  )

}