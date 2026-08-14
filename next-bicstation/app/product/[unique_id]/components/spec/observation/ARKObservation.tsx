// ============================================================================
// FILE:
// next-bicstation/app/product/[unique_id]/components/spec/observation/ARKObservation.tsx
// ============================================================================
//
// SHIN CORE LINX
// ARK Observation Renderer
//
// PURPOSE
//
// ARK が提供した Observation Reality を表示する。
//
// Backend / Observation
//      ↓
// observation_runtime
//      ↓
// raw_specs{}
//      ↓
// ARKObservation
//      ↓
// UI
//
// IMPORTANT
//
// ✓ ARK Observation Reality の表示のみ
// ✓ raw_specs の key / value をそのまま表示
// ✓ ARK が提供した表示順を維持
// ✓ Null / malformed data を防御
//
// ✗ raw_html の解析
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

type ARKObservationSpec = {

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
 * ============================================================================
 */

function getObservation(
    product: any,
) {

    const observation =
        product?.observationRuntime
        ||
        product?.observation_runtime

    if (
        !observation
        ||
        typeof observation !== 'object'
        ||
        Array.isArray(
            observation
        )
    ) {

        return null

    }

    return observation

}

/* ============================================================================
// getSpecifications
============================================================================ */

/**
 * ============================================================================
 * getSpecifications
 * ============================================================================
 *
 * ARK Observation Reality の
 *
 * raw_specs{}
 *
 * をUI表示用のkey / value配列へ変換する。
 *
 * ここではkeyの意味を解釈しない。
 *
 * ARKが返したkeyとvalueをそのまま表示する。
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

    const rawSpecs =
        observation?.raw_specs

    if (
        !rawSpecs
        ||
        typeof rawSpecs !== 'object'
        ||
        Array.isArray(
            rawSpecs
        )
    ) {

        return []

    }

    return Object.entries(
        rawSpecs as ARKObservationSpec
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

export default function ARKObservation({

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
                    ARK OBSERVATION
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