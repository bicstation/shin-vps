// ============================================================================
// FILE:
// next-bicstation/app/product/[unique_id]/components/spec/observation/
// OZGAMINGObservation.tsx
// ============================================================================
//
// SHIN CORE LINX
// OZ GAMING Observation Renderer
//
// PURPOSE
//
// OZ GAMING が提供した Observation Reality を表示する。
//
// Backend / Observation
//      ↓
// specifications{}
//      ↓
// OZGAMINGObservation
//      ↓
// UI
//
// IMPORTANT
//
// ✓ Observation Reality の表示のみ
// ✓ specifications の label / value をそのまま表示
// ✓ price / stock / delivery は Observation Metadata として必要に応じて表示
// ✓ Null / malformed data を防御
//
// ✗ raw_spec の解析
// ✗ 商品名からGPU等を補完
// ✗ Semantic Classification
// ✗ Realityの推測
// ✗ Runtime生成
//
// ============================================================================

import styles
    from '../spec.module.css'

/* ============================================================================
Types
============================================================================ */

type ObservationSpecifications = {

    [key: string]: unknown

}

type Props = {

    product: any

}

/* ============================================================================
Helpers
============================================================================ */

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
getSpecifications
============================================================================ */

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

    const specifications =
        observation?.specifications

    if (
        !specifications
        ||
        typeof specifications !== 'object'
        ||
        Array.isArray(
            specifications
        )
    ) {

        return []

    }

    return Object.entries(
        specifications as ObservationSpecifications
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
                    typeof value === 'string'
                    &&
                    value.trim().length > 0
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
                    value.trim(),

            })
        )

}

/* ============================================================================
Component
============================================================================ */

export default function OZGAMINGObservation({

    product,

}: Props) {

    if (
        !product
    ) {

        return null

    }

    const observation =
        getObservation(
            product
        )

    if (
        !observation
    ) {

        return null

    }

    const specifications =
        getSpecifications(
            product
        )

    if (
        specifications.length === 0
    ) {

        return null

    }

    const productName =
        product?.name
        ||
        observation?.product_name
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
                    OZ GAMING OBSERVATION
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