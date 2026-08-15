// ============================================================================
// FILE:
// next-bicstation/app/product/[unique_id]/components/spec/observation/MOUSEObservation.tsx
// ============================================================================
//
// SHIN CORE LINX
// MOUSE Observation Renderer
//
// PURPOSE
//
// MOUSE が提供した Observation Reality を表示する。
//
// Backend / Observation
//      ↓
// observation_runtime.specifications[]
//      ↓
// MOUSEObservation
//      ↓
// UI
//
// IMPORTANT
//
// ✓ Observation Reality の表示のみ
// ✓ specifications[] の順序を維持
// ✓ 文字列をそのまま表示
// ✓ 空値 / malformed data を防御
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
Types
============================================================================ */

type Props = {

    product: any

}

/* ============================================================================
Observation
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
Specifications
============================================================================ */

function getSpecifications(
    product: any,
): string[] {

    const observation =
        getObservation(
            product
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

    return specifications
        .filter(
            (
                item: unknown
            ): item is string => {

                return (
                    typeof item === 'string'
                    &&
                    item.trim().length > 0
                )

            }
        )
        .map(
            (
                item
            ) =>
                item.trim()
        )

}

/* ============================================================================
Component
============================================================================ */

export default function MOUSEObservation({

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
                    MOUSE OBSERVATION
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
                                    `${index}-${specification}`
                                }

                                className={
                                    styles.specCard
                                }
                            >

                                <div
                                    className={
                                        styles.specCardValue
                                    }
                                >
                                    {
                                        specification
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