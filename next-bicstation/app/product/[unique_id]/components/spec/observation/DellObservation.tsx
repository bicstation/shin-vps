// ============================================================================
// FILE:
// /home/maya/shin-vps/next-bicstation/app/product/[unique_id]/components/spec/observation/DellObservation.tsx
// ============================================================================

import styles from '../spec.module.css'

/* ============================================================================
🔥 Types
============================================================================ */

type ObservationSpecification = {
    label?: string
    value?: string | number | null

    media_icon?: string | null
    media_icon_alt?: string | null

    gaming_icon?: string | null
    gaming_icon_alt?: string | null

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

    [key: string]: unknown
}

type Props = {
    product: any
}

/* ============================================================================
🔥 Helpers
============================================================================ */

/**
 * ============================================================================
 * Observation Runtime
 * ============================================================================
 *
 * Dell Realityを最優先する。
 *
 * Backend / Adapterから渡されたObservationを
 * Frontendで意味変換しない。
 *
 * ✓ label
 * ✓ value
 * ✓ manufacturer supplied metadata
 *
 * ✗ Semantic generation
 * ✗ CPU/GPU inference
 * ✗ Workflow inference
 * ✗ Missing value generation
 *
 * ============================================================================
 */

function getObservationRuntime(
    product: any,
): ObservationRuntime | null {

    const observation =
        product?.observationRuntime

    if (
        !observation
    ) {

        return null

    }

    /* --------------------------------------------------------------------------
     String Runtime
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
                && typeof parsed === 'object'
            ) {

                return parsed as ObservationRuntime

            }

        } catch {

            return null

        }

    }

    /* --------------------------------------------------------------------------
     Object Runtime
     -------------------------------------------------------------------------- */

    if (
        typeof observation === 'object'
    ) {

        return observation as ObservationRuntime

    }

    return null

}

/* ============================================================================
🔥 Specifications
============================================================================ */

function getSpecifications(
    product: any,
): ObservationSpecification[] {

    const observation =
        getObservationRuntime(
            product
        )

    if (
        !observation
    ) {

        return []

    }

    if (
        !Array.isArray(
            observation.specifications
        )
    ) {

        return []

    }

    return observation.specifications.filter(
        (
            specification
        ) => {

            if (
                !specification
                || typeof specification !== 'object'
            ) {

                return false

            }

            const label =
                typeof specification.label === 'string'
                    ? specification.label.trim()
                    : ''

            const value =
                specification.value

            if (
                !label
            ) {

                return false

            }

            if (
                value === undefined
                || value === null
                || String(value).trim() === ''
            ) {

                return false

            }

            return true

        }
    )

}

/* ============================================================================
🔥 Metadata
============================================================================ */

function getMetadata(
    specification: ObservationSpecification,
) {

    return {

        icon:
            typeof specification.media_icon === 'string'
                ? specification.media_icon
                : null,

        iconAlt:
            typeof specification.media_icon_alt === 'string'
                ? specification.media_icon_alt
                : null,

        gamingIcon:
            typeof specification.gaming_icon === 'string'
                ? specification.gaming_icon
                : null,

        gamingIconAlt:
            typeof specification.gaming_icon_alt === 'string'
                ? specification.gaming_icon_alt
                : null,

    }

}

/* ============================================================================
🔥 Component
============================================================================ */

export default function DellObservation({
    product,
}: Props) {

    if (
        !product
    ) {

        return null

    }

    const specifications =
        getSpecifications(
            product
        )

    /* --------------------------------------------------------------------------
     Empty
    -------------------------------------------------------------------------- */

    if (
        specifications.length === 0
    ) {

        return null

    }

    const productName =
        product?.name
        || 'このPC'

    /* --------------------------------------------------------------------------
     Render
    -------------------------------------------------------------------------- */

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
                    DELL OBSERVATION
                </div>

                <h2
                    className={
                        styles.specTitle
                    }
                >
                    製品情報
                </h2>

                <p
                    className={
                        styles.specDescription
                    }
                >
                    {productName}
                    のメーカー提供情報を確認できます。
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
                    specifications.map(
                        (
                            specification,
                            index
                        ) => {

                            const metadata =
                                getMetadata(
                                    specification
                                )

                            return (

                                <div
                                    key={
                                        `${specification.label}-${index}`
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
                                            specification.label
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
                                            specification.value
                                        }

                                    </div>

                                    {/* ============================================================
                  MANUFACTURER METADATA
                  ============================================================ */}

                                    {
                                        (
                                            metadata.icon
                                            || metadata.gamingIcon
                                        )
                                        && (

                                            <div>

                                                {
                                                    metadata.icon
                                                    && (

                                                        <img
                                                            src={
                                                                metadata.icon
                                                            }

                                                            alt={
                                                                metadata.iconAlt
                                                                || ''
                                                            }
                                                        />

                                                    )
                                                }

                                                {
                                                    metadata.gamingIcon
                                                    && (

                                                        <img
                                                            src={
                                                                metadata.gamingIcon
                                                            }

                                                            alt={
                                                                metadata.gamingIconAlt
                                                                || ''
                                                            }
                                                        />

                                                    )
                                                }

                                            </div>

                                        )
                                    }

                                </div>

                            )

                        }
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
                のメーカー提供情報をもとに構成を確認できます。

            </div>

        </section>

    )

}