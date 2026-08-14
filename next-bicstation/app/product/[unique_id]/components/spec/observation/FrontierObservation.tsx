// ============================================================================
// FILE:
// next-bicstation/app/product/[unique_id]/components/spec/observation/FrontierObservation.tsx
// ============================================================================
//
// SHIN CORE LINX
// Frontier Observation Renderer
//
// PURPOSE
//
// Frontier が提供した Observation Reality を表示する。
//
// Backend / Observation
//      ↓
// observation_runtime
//      ↓
// Frontier Reality Object
//      ↓
// FrontierObservation
//      ↓
// UI
//
// IMPORTANT
//
// ✓ Frontier Observation Reality の表示のみ
// ✓ Frontier が提供した key / value をそのまま表示
// ✓ Frontier が提供した項目順を維持
// ✓ Null / malformed data を防御
//
// ✗ CPU / GPU等の意味生成
// ✗ Semantic Classification
// ✗ Realityの推測
// ✗ Runtime生成
//
// ============================================================================

import styles
    from '../spec.module.css'

/* ============================================================================
// Types
============================================================================ */

type FrontierObservation = {

    [key: string]: unknown

}

type Props = {

    product: any

}

/* ============================================================================
// Helpers
============================================================================ */

/**
 * ============================================================================
 * getObservation
 * ============================================================================
 *
 * ProductからObservation Runtimeを取得する。
 *
 * Object / JSON String の両方に対応する。
 *
 * ============================================================================
 */

function getObservation(
    product: any,
) {

    const rawObservation =
        product?.observationRuntime
        ||
        product?.observation_runtime

    if (
        rawObservation === null
        ||
        rawObservation === undefined
    ) {

        return null

    }

    /* --------------------------------------------------------------------------
    Object
    -------------------------------------------------------------------------- */

    if (
        typeof rawObservation === 'object'
        &&
        !Array.isArray(
            rawObservation
        )
    ) {

        return rawObservation

    }

    /* --------------------------------------------------------------------------
    JSON String
    -------------------------------------------------------------------------- */

    if (
        typeof rawObservation === 'string'
    ) {

        try {

            const parsed =
                JSON.parse(
                    rawObservation
                )

            if (
                parsed
                &&
                typeof parsed === 'object'
                &&
                !Array.isArray(
                    parsed
                )
            ) {

                return parsed

            }

        } catch {

            return null

        }

    }

    return null

}

/* ============================================================================
// getSpecifications
============================================================================ */

/**
 * ============================================================================
 * getSpecifications
 * ============================================================================
 *
 * Frontier Observation Reality の
 * key / value をそのままUI表示用に変換する。
 *
 * keyの意味解釈は行わない。
 *
 * ============================================================================
 */

function getSpecifications(
    product: any,
): Array<{
    label: string
    value: string
}> {

    const observation =
        getObservation(
            product
        )

    if (
        !observation
    ) {

        return []

    }

    return Object.entries(
        observation as FrontierObservation
    )
        .filter(
            (
                [
                    label,
                    value,
                ]
            ) => {

                return (

                    typeof label === 'string'
                    &&
                    label.trim().length > 0
                    &&
                    value !== null
                    &&
                    value !== undefined
                    &&
                    String(
                        value
                    ).trim().length > 0

                )

            }
        )
        .map(
            (
                [
                    label,
                    value,
                ]
            ) => ({

                label:
                    label.trim(),

                value:
                    String(
                        value
                    ).trim(),

            })
        )

}

/* ============================================================================
// Component
============================================================================ */

export default function FrontierObservation({

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

    /* ========================================================================
    Empty
    ======================================================================== */

    if (
        specifications.length === 0
    ) {

        return null

    }

    const productName =
        product?.name
        ||
        'この製品'

    /* ========================================================================
    Render
    ======================================================================== */

    return (

        <section
            className={
                styles.specSection
            }
        >

            {/* ================================================================
            HEADER
            ================================================================ */}

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
                    FRONTIER OBSERVATION
                </div>

                <h2
                    className={
                        styles.specTitle
                    }
                >
                    製品仕様
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

            {/* ================================================================
            OBSERVATION GRID
            ================================================================ */}

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
                        ) => (

                            <div
                                key={
                                    `${specification.label}-${index}`
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
                                        specification.label
                                    }
                                </div>

                                <div
                                    className={
                                        styles.specCardValue
                                    }
                                >
                                    {
                                        specification.value
                                    }
                                </div>

                            </div>

                        )
                    )
                }

            </div>

            {/* ================================================================
            FOOTER
            ================================================================ */}

            <div
                className={
                    styles.specFooter
                }
            >
                メーカーが提供する製品情報を
                Observation Reality として表示しています。
            </div>

        </section>

    )

}