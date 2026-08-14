// ============================================================================
// FILE:
// next-bicstation/app/product/[unique_id]/components/spec/ProductRadar.tsx
// ============================================================================
//
// SHIN CORE LINX
// Product Observation Experience
//
// Backend Reality
//      ↓
// observation_runtime
//      ↓
// Adapter / Projection
//      ↓
// ProductRadar
//      ↓
// Observation UI
//
// IMPORTANT
//
// This component does NOT:
// ✗ infer performance
// ✗ generate scores
// ✗ generate semantic meaning
// ✗ modify Observation Reality
//
// It displays observed Reality supplied by Backend.
// ============================================================================

import styles from './spec.module.css'

/* ============================================================================
🔥 Props
============================================================================ */

type Props = {
  product: any
}

/* ============================================================================
🔥 Observation Types
============================================================================ */

type ObservationSpecification = {
  label?: string
  value?: string
}

type ProductObservationRuntime = {
  source?: string
  source_url?: string
  document_key?: string
  format?: string
  specifications?: ObservationSpecification[]
  raw_text?: string
}

/* ============================================================================
🔥 Observation Parser
============================================================================ */

function parseObservationRuntime(
  product: any,
): ProductObservationRuntime | null {

  const observation =
    product?.observationRuntime

  if (!observation) {
    return null
  }

  /* --------------------------------------------------------------------------
  Structured Observation
  -------------------------------------------------------------------------- */

  if (
    typeof observation === 'object'
    &&
    observation !== null
  ) {

    const parsedObservation =
      observation as ProductObservationRuntime

    return parsedObservation

  }

  /* --------------------------------------------------------------------------
  JSON Observation
  -------------------------------------------------------------------------- */

  if (
    typeof observation === 'string'
  ) {

    try {

      const parsed =
        JSON.parse(
          observation
        )

      if (
        parsed
        &&
        typeof parsed === 'object'
      ) {

        const parsedObservation =
          parsed as ProductObservationRuntime

        return parsedObservation

      }

    } catch (error) {

      console.warn(
        '⚠️ PRODUCT OBSERVATION JSON PARSE FAILED',
        error,
      )

    }

  }

  return null

}

/* ============================================================================
🔥 Observation Specifications
============================================================================ */

function getObservationSpecifications(
  product: any,
): ObservationSpecification[] {

  const observation =
    parseObservationRuntime(
      product,
    )

  const specifications =
    observation?.specifications

  if (
    !Array.isArray(
      specifications
    )
  ) {

    return []

  }

  return specifications.filter(
    (
      item,
    ): item is ObservationSpecification =>

      item
      &&
      typeof item === 'object'
      &&
      (
        typeof item.label === 'string'
        ||
        typeof item.value === 'string'
      ),
  )

}

/* ============================================================================
🔥 Component
============================================================================ */

export default function ProductRadar({
  product,
}: Props) {

  const productName =
    product?.name
    || 'このPC'

  const observation =
    parseObservationRuntime(
      product,
    )

  const specifications =
    getObservationSpecifications(
      product,
    )

  /* ==========================================================================
  🔥 Reality Observation
  ========================================================================== */

  console.log(
    '🔥 PRODUCT OBSERVATION UI',
    {
      unique_id:
        product?.uniqueId
        ||
        product?.unique_id,

      product_name:
        product?.name,

      observationRuntime:
        product?.observationRuntime,

      observation,

      specification_count:
        specifications.length,
    },
  )

  /* ==========================================================================
  🔥 Empty Observation
  ========================================================================== */

  if (
    !observation
    ||
    !specifications.length
  ) {

    return (

      <section
        className={
          styles.radarSection
        }
      >

        {/* ====================================================================
        HEADER
        ==================================================================== */}

        <div
          className={
            styles.radarHeader
          }
        >

          <div
            className={
              styles.radarLabel
            }
          >
            OBSERVATION
          </div>

          <h2
            className={
              styles.radarTitle
            }
          >
            {productName}
            の観測された仕様
          </h2>

          <p
            className={
              styles.radarDescription
            }
          >
            {productName}
            について取得された
            Observation情報はありません。
          </p>

        </div>

      </section>

    )

  }

  /* ==========================================================================
  🔥 Observation UI
  ========================================================================== */

  return (

    <section
      className={
        styles.radarSection
      }
    >

      {/* ======================================================================
      HEADER
      ====================================================================== */}

      <div
        className={
          styles.radarHeader
        }
      >

        <div
          className={
            styles.radarLabel
          }
        >
          OBSERVATION
        </div>

        <h2
          className={
            styles.radarTitle
          }
        >
          {productName}
          の観測された仕様
        </h2>

        <p
          className={
            styles.radarDescription
          }
        >
          {productName}
          について、
          Reality Sourceから実際に観測された
          仕様情報を表示しています。
        </p>

      </div>

      {/* ======================================================================
      SOURCE
      ====================================================================== */}

      {
        (
          observation.source
          ||
          observation.source_url
        )
        &&
        (

          <div
            className={
              styles.radarFooter
            }
          >

            <div
              className={
                styles.radarFooterText
              }
            >

              {
                observation.source
                &&
                (
                  <>
                    SOURCE:
                    {' '}
                    {observation.source}
                  </>
                )
              }

              {
                observation.source_url
                &&
                (
                  <>
                    {' '}
                    / {' '}
                    {observation.source_url}
                  </>
                )
              }

            </div>

          </div>

        )
      }

      {/* ======================================================================
      DOCUMENT
      ====================================================================== */}

      {
        (
          observation.document_key
          ||
          observation.format
        )
        &&
        (

          <div
            className={
              styles.radarFooter
            }
          >

            <div
              className={
                styles.radarFooterText
              }
            >

              {
                observation.document_key
                &&
                (
                  <>
                    DOCUMENT:
                    {' '}
                    {observation.document_key}
                  </>
                )
              }

              {
                observation.format
                &&
                (
                  <>
                    {' '}
                    / FORMAT:
                    {' '}
                    {observation.format}
                  </>
                )
              }

            </div>

          </div>

        )
      }

      {/* ======================================================================
      SPECIFICATIONS
      ====================================================================== */}

      <div
        className={
          styles.radarGrid
        }
      >

        {
          specifications.map(
            (
              spec,
              index,
            ) => (

              <div
                key={
                  `${spec.label || 'specification'}-${index}`
                }
                className={
                  styles.radarCard
                }
              >

                {/* ============================================================
                LABEL
                ============================================================ */}

                <div
                  className={
                    styles.radarCardTop
                  }
                >

                  <div
                    className={
                      styles.radarCardLabel
                    }
                  >
                    {
                      spec.label
                      ||
                      'SPECIFICATION'
                    }
                  </div>

                </div>

                {/* ============================================================
                VALUE
                ============================================================ */}

                <div
                  className={
                    styles.radarCardValue
                  }
                >
                  {
                    spec.value
                    ||
                    '—'
                  }
                </div>

              </div>

            )
          )
        }

      </div>

      {/* ======================================================================
      RAW OBSERVATION
      ====================================================================== */}

      {
        observation.raw_text
        &&
        (

          <details>

            <summary>
              RAW OBSERVATION
            </summary>

            <div
              className={
                styles.radarFooterText
              }
            >
              {
                observation.raw_text
              }
            </div>

          </details>

        )
      }

      {/* ======================================================================
      FOOTER
      ====================================================================== */}

      <div
        className={
          styles.radarFooter
        }
      >

        <div
          className={
            styles.radarFooterText
          }
        >
          {productName}
          のReality Sourceから取得された
          Observation Runtimeの情報を表示しています。
        </div>

      </div>

    </section>

  )

}