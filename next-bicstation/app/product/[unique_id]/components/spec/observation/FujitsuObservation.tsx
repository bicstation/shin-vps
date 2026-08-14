// ============================================================================
// FILE:
// next-bicstation/app/product/[unique_id]/components/spec/observation/FujitsuObservation.tsx
// ============================================================================
//
// SHIN CORE LINX
// Fujitsu Observation Renderer
//
// PURPOSE
//
// Fujitsu が提供した Observation Reality を表示する。
//
// Backend / Observation
//      ↓
// observation_runtime
//      ↓
// JSON Object / JSON String
//      ↓
// specifications[]
//      ↓
// FujitsuObservation
//      ↓
// UI
//
// IMPORTANT
//
// ✓ Fujitsu Observation Reality の表示のみ
// ✓ label / value をそのまま表示
// ✓ Fujitsu が提供した表示順を維持
// ✓ JSON Object / JSON String の両方に対応
// ✓ Null / malformed data を防御
// ✓ code はUIに表示しない
//
// ✗ raw_text の解析
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

type ObservationSpecification = {

    label?: unknown

    value?: unknown

    code?: unknown

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
 * observationRuntime / observation_runtime の
 * どちらにも対応する。
 *
 * BackendからJSON文字列として渡された場合は、
 * ここでJSON Objectへ戻す。
 *
 * ここでは意味解析を行わない。
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

    /* --------------------------------------------------------------------------
    Observationなし
    -------------------------------------------------------------------------- */

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
 * Fujitsu Observation Reality に存在する
 * specifications[] を取得する。
 *
 * label / value はメーカーが提供した値を
 * そのままUIへ渡す。
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

    const specifications =
        observation?.specifications

    if (
        !Array.isArray(
            specifications
        )
    ) {

        return []

    }

    return specifications
        .filter(
            (
                item: unknown
            ): item is ObservationSpecification => {

                if (
                    !item
                    ||
                    typeof item !== 'object'
                ) {

                    return false

                }

                const specification =
                    item as ObservationSpecification

                return (

                    typeof specification.label === 'string'
                    &&
                    specification.label.trim().length > 0
                    &&
                    typeof specification.value === 'string'
                    &&
                    specification.value.trim().length > 0

                )

            }
        )
        .map(
            (
                item
            ) => ({

                label:
                    String(
                        item.label
                    ).trim(),

                value:
                    String(
                        item.value
                    ).trim(),

            })
        )

}

/* ============================================================================
// Component
============================================================================ */

export default function FujitsuObservation({

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
                    FUJITSU OBSERVATION
                </div>

                <h2
                    className={
                        styles.specTitle
                    }
                >
                    メーカー提供情報
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