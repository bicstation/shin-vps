// /home/maya/shin-vps/next-bicstation/app/product/[unique_id]/components/spec/observation/DefaultObservation.tsx

// ============================================================================
// FILE:
// /home/maya/shin-vps/next-bicstation/app/product/[unique_id]/components/spec/observation/DefaultObservation.tsx
// ============================================================================
//
// SHIN CORE LINX
// Default Observation Experience
//
// Backend Reality
//      ↓
// observation_runtime
//      ↓
// DefaultObservation
//      ↓
// Generic Observation UI
//
// PURPOSE
//
// Manufacturer-specific Observation Renderer が存在しない場合に使用する
// 共通Observation Renderer。
//
// IMPORTANT
//
// This component does NOT:
//
// ✗ generate semantic meaning
// ✗ infer CPU / GPU / Memory / Storage
// ✗ generate scores
// ✗ modify Observation Reality
// ✗ classify manufacturer-specific fields
//
// It only translates existing Observation Runtime into a generic UI.
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

type ObservationSpecification = {

    label?: string

    value?: string

    [key: string]: unknown

}

type ObservationRuntime = {

    source?: string

    source_url?: string

    document_key?: string

    format?: string

    specifications?:
    ObservationSpecification[]

    raw_text?: string

}

/* ============================================================================
🔥 Observation Parser
============================================================================ */

function parseObservationRuntime(
    product: any,
): ObservationRuntime | null {

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
            observation as ObservationRuntime
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
                    parsed as ObservationRuntime
                )

            }

        } catch (error) {

            console.warn(
                '⚠️ DEFAULT OBSERVATION JSON PARSE FAILED',
                error,
            )

        }

    }

    return null

}

/* ============================================================================
🔥 Specification Guard
============================================================================ */

function isObservationSpecification(
    value: unknown,
): value is ObservationSpecification {

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
        ObservationRuntime | null,
): ObservationSpecification[] {

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
        isObservationSpecification
    )

}

/* ============================================================================
🔥 Component
============================================================================ */

export default function DefaultObservation({

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
        '🔥 DEFAULT OBSERVATION UI',
        {
            unique_id:
                product?.uniqueId
                ||
                product?.unique_id,

            product_name:
                product?.name,

            maker:
                product?.maker,

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

        return null

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
                    OBSERVATION
                </div>

                <h2
                    className={
                        styles.radarTitle
                    }
                >
                    {productName}
                    の観測情報
                </h2>

                <p
                    className={
                        styles.radarDescription
                    }
                >
                    {productName}
                    について取得された
                    Observation Runtimeを表示しています。
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
                                            'OBSERVATION'
                                        }
                                    </div>

                                </div>

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
                    のObservation Runtimeから取得された
                    Reality情報を表示しています。
                </div>

            </div>

        </section>

    )

}