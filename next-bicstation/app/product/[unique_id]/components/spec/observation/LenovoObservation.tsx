// /home/maya/shin-vps/next-bicstation/app/product/[unique_id]/components/spec/observation/LenovoObservation.tsx

// ============================================================================
// FILE:
// /home/maya/shin-vps/next-bicstation/app/product/[unique_id]/components/spec/observation/LenovoObservation.tsx
// ============================================================================
//
// SHIN CORE LINX
// Lenovo Observation Experience
//
// Backend Reality
//      ↓
// observation_runtime
//      ↓
// LenovoObservation
//      ↓
// Lenovo Reality UI
//
// IMPORTANT
//
// This component does NOT:
// ✗ infer specifications
// ✗ generate semantic meaning
// ✗ generate scores
// ✗ modify Observation Reality
//
// It displays Lenovo Observation Reality supplied by Backend.
// ============================================================================

import styles from '../spec.module.css'

/* ============================================================================
🔥 Props
============================================================================ */

type Props = {
    product: any
}

/* ============================================================================
🔥 Observation Types
============================================================================ */

type LenovoObservationSpecification = {

    label?: string

    value?: string

    media_icon?: string

    media_icon_alt?: string

    gaming_icon?: string

    gaming_icon_alt?: string

    c?: string

    web_exclusive?: boolean

}

type LenovoObservationRuntime = {

    source?: string

    source_url?: string

    document_key?: string

    format?: string

    specifications?:
    LenovoObservationSpecification[]

    raw_text?: string

}

/* ============================================================================
🔥 Observation Parser
============================================================================ */

function parseObservationRuntime(
    product: any,
): LenovoObservationRuntime | null {

    const observation =
        product?.observationRuntime

    /* --------------------------------------------------------------------------
    Empty
    -------------------------------------------------------------------------- */

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

        return (
            observation as LenovoObservationRuntime
        )

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

                return (
                    parsed as LenovoObservationRuntime
                )

            }

        } catch (error) {

            console.warn(
                '⚠️ LENOVO OBSERVATION JSON PARSE FAILED',
                error,
            )

        }

    }

    return null

}

/* ============================================================================
🔥 Specification Guard
============================================================================ */

function isLenovoSpecification(
    value: unknown,
): value is LenovoObservationSpecification {

    if (
        !value
        ||
        typeof value !== 'object'
    ) {

        return false

    }

    const specification =
        value as Record<string, unknown>

    return (

        typeof specification.label === 'string'

        ||

        typeof specification.value === 'string'

    )

}

/* ============================================================================
🔥 Specifications
============================================================================ */

function getSpecifications(
    observation:
        LenovoObservationRuntime | null,
): LenovoObservationSpecification[] {

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
        isLenovoSpecification
    )

}

/* ============================================================================
🔥 Component
============================================================================ */

export default function LenovoObservation({

    product,

}: Props) {

    const productName =
        product?.name
        ||
        'このPC'

    const observation =
        parseObservationRuntime(
            product
        )

    const specifications =
        getSpecifications(
            observation
        )

    /* ==========================================================================
    🔥 Debug
    ========================================================================== */

    console.log(
        '🔥 LENOVO OBSERVATION UI',
        {
            unique_id:
                product?.uniqueId
                ||
                product?.unique_id,

            product_name:
                product?.name,

            maker:
                product?.maker,

            observation,

            specification_count:
                specifications.length,
        }
    )

    /* ==========================================================================
    🔥 Empty
    ========================================================================== */

    if (
        !observation
        ||
        specifications.length === 0
    ) {

        return (

            <section
                className={
                    styles.radarSection
                }
            >

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
                        Lenovo Observation情報はありません。
                    </p>

                </div>

            </section>

        )

    }

    /* ==========================================================================
    🔥 Render
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
                    LENOVO OBSERVATION
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
                    についてLenovoのReality Sourceから
                    実際に観測された仕様情報を表示しています。
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
                            specification,
                            index,
                        ) => (

                            <div
                                key={
                                    `${specification.label
                                    ||
                                    'specification'
                                    }-${index}`
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
                                            specification.label
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
                                        specification.value
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
                    のLenovo Reality Sourceから取得された
                    Observation Runtimeを表示しています。
                </div>

            </div>

        </section>

    )

}