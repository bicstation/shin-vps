// ============================================================================
// FILE:
// next-bicstation/app/product/[unique_id]/components/spec/ProductSpec.tsx
//
// SHIN CORE LINX
// Product Basic Specification Experience
//
// RESPONSIBILITY
//
// ProjectedProduct
//      ↓
// ProductSpec
//      ↓
// Product Basic Specification Experience
//
// PURPOSE
//
// ProductSpec presents the normalized product specification itself.
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
// ✓ Product identity in heading
// ✓ Stable section anchor
//
// ✗ Observation Runtime
// ✗ Manufacturer-specific Reality
// ✗ Semantic Generation
// ✗ Workflow Generation
// ✗ Recommendation Generation
// ✗ Runtime Generation
//
// Manufacturer-specific Observation is handled by:
//
// components/spec/observation/
//      ├── LenovoObservation
//      ├── DefaultObservation
//      └── future manufacturer renderers
//
// Authority
//
// Backend Reality
//      ↓
// Adapter / Projection
//      ↓
// ProjectedProduct
//      ↓
// ProductSpec
//
// ============================================================================

import styles
  from './spec.module.css'


/* ============================================================================
🔥 Projection
============================================================================ */

import type {

  ProjectedProduct,

} from '@/shared/lib/api/django/pc/product-detail'


/* ============================================================================
🔥 Props
============================================================================ */

type Props = {

  product:
    ProjectedProduct

}


/* ============================================================================
🔥 Specification
============================================================================ */

type ProductSpecification = {

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
 * Product Basic Specifications
 * ============================================================================
 *
 * ProductSpec reads only canonical ProjectedProduct fields.
 *
 * It does NOT inspect:
 *
 * ✗ observation_runtime
 * ✗ semantic_runtime
 * ✗ compiled_runtime
 *
 * It does NOT generate semantic meaning.
 *
 * ============================================================================
 */

function buildSpecs(
  product:
    ProjectedProduct
): ProductSpecification[] {

  const specs:
    ProductSpecification[] = []


  /* ==========================================================================
  MAKER
  ========================================================================== */

  const maker =
    product.maker?.trim()
    ||
    ''


  if (maker) {

    specs.push({

      label:
        'MAKER',

      value:
        maker,

    })

  }


  /* ==========================================================================
  BRAND
  ========================================================================== */

  const brand =
    product.brand?.trim()
    ||
    ''


  if (brand) {

    specs.push({

      label:
        'BRAND',

      value:
        brand,

    })

  }


  /* ==========================================================================
  SERIES
  ========================================================================== */

  const series =
    product.series?.trim()
    ||
    ''


  if (series) {

    specs.push({

      label:
        'SERIES',

      value:
        series,

    })

  }


  /* ==========================================================================
  COLLABORATION
  ========================================================================== */

  const collaboration =
    product.collaboration?.trim()
    ||
    ''


  if (collaboration) {

    specs.push({

      label:
        'COLLABORATION',

      value:
        collaboration,

    })

  }


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


  /* ==========================================================================
  DISPLAY
  ========================================================================== */

  const display =
    product.displayInfo?.trim()
    ||
    ''


  if (display) {

    specs.push({

      label:
        'DISPLAY',

      value:
        display,

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
  Basic Specifications
  ========================================================================== */

  const specs =
    buildSpecs(
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
        styles.specSection
      }

      id="specifications"

      aria-labelledby="product-specifications-title"

    >

      {/* ======================================================================
      HEADER
      ====================================================================== */}

      <div
        className={
          styles.specHeader
        }
      >

        {/* ====================================================================
        LABEL
        ==================================================================== */}

        <div
          className={
            styles.specLabel
          }
        >

          PRODUCT SPECIFICATIONS

        </div>


        {/* ====================================================================
        TITLE
        ==================================================================== */}

        <h2

          id="product-specifications-title"

          className={
            styles.specTitle
          }
        >

          {productName}
          の基本仕様

        </h2>


        {/* ====================================================================
        DESCRIPTION
        ==================================================================== */}

        <p
          className={
            styles.specDescription
          }
        >

          {productName}
          のメーカー・シリーズ・主要ハードウェア構成など、
          基本的な製品仕様を確認できます。

        </p>

      </div>


      {/* ======================================================================
      SPEC GRID
      ====================================================================== */}

      <div

        className={
          styles.specGrid
        }

        aria-label={
          `${productName}の基本仕様`
        }

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
                  styles.specCard
                }

              >

                {/* ============================================================
                LABEL
                ============================================================ */}

                <div
                  className={
                    styles.specCardLabel
                  }
                >

                  {
                    spec.label
                  }

                </div>


                {/* ============================================================
                VALUE
                ============================================================ */}

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