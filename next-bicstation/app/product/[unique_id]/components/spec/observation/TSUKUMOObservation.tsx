// ============================================================================
// FILE:
// next-bicstation/app/product/[unique_id]/components/spec/observation/TSUKUMOObservation.tsx
// ============================================================================
//
// SHIN CORE LINX
// TSUKUMO Observation Renderer
//
// PURPOSE
//
// TSUKUMO が提供した Observation Reality を表示する。
//
// Backend / Observation
//      ↓
// raw_*
//      ↓
// TSUKUMOObservation
//      ↓
// UI
//
// IMPORTANT
//
// ✓ TSUKUMO Observation Reality の表示のみ
// ✓ raw_title / raw_price / raw_maker / raw_stock をそのまま表示
// ✓ raw_specs[] をそのまま表示
// ✓ raw_labels[] をそのまま表示
// ✓ raw_shipping / raw_availability をそのまま表示
// ✓ Null / malformed data を防御
//
// ✗ raw_html の表示
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

type ObservationRuntime = {

    raw_sku?: unknown

    raw_maker?: unknown

    raw_title?: unknown

    raw_price?: unknown

    raw_stock?: unknown

    raw_labels?: unknown

    raw_shipping?: unknown

    raw_availability?: unknown

    raw_specs?: unknown

    raw_description?: unknown

    raw_image?: unknown

    raw_detail_url?: unknown

}

/* ============================================================================
Helpers
============================================================================ */

function getObservation(
    product: any,
): ObservationRuntime | null {

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

    return observation as ObservationRuntime

}

/* ============================================================================
String
============================================================================ */

function getString(
    value: unknown,
): string {

    if (
        typeof value !== 'string'
    ) {

        return ''

    }

    return value.trim()

}

/* ============================================================================
Array
============================================================================ */

function getStringArray(
    value: unknown,
): string[] {

    if (
        !Array.isArray(
            value
        )
    ) {

        return []

    }

    return value
        .filter(
            (
                item: unknown
            ): item is string =>
                typeof item === 'string'
                &&
                item.trim().length > 0
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

export default function TSUKUMOObservation({

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

    const rawMaker =
        getString(
            observation.raw_maker
        )

    const rawTitle =
        getString(
            observation.raw_title
        )

    const rawPrice =
        getString(
            observation.raw_price
        )

    const rawStock =
        getString(
            observation.raw_stock
        )

    const rawShipping =
        getString(
            observation.raw_shipping
        )

    const rawAvailability =
        getString(
            observation.raw_availability
        )

    const rawDescription =
        getString(
            observation.raw_description
        )

    const rawSku =
        getString(
            observation.raw_sku
        )

    const rawSpecs =
        getStringArray(
            observation.raw_specs
        )

    const rawLabels =
        getStringArray(
            observation.raw_labels
        )

    const productName =
        product?.name
        ||
        rawTitle
        ||
        'この製品'

    /* ==========================================================================
    Empty
    ========================================================================== */

    if (
        !rawMaker
        &&
        !rawTitle
        &&
        !rawPrice
        &&
        !rawStock
        &&
        rawSpecs.length === 0
        &&
        rawLabels.length === 0
        &&
        !rawDescription
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
        >

            {/* ==================================================================
            HEADER
            ================================================================== */}

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
                    TSUKUMO OBSERVATION
                </div>

                <h2
                    className={
                        styles.specTitle
                    }
                >
                    販売店提供情報
                </h2>

                <p
                    className={
                        styles.specDescription
                    }
                >
                    {productName}
                    の販売店提供情報を確認できます。
                </p>

            </div>

            {/* ==================================================================
            OBSERVATION GRID
            ================================================================== */}

            <div
                className={
                    styles.specGrid
                }
            >

                {
                    rawMaker
                        ? (

                            <div
                                className={
                                    styles.specCard
                                }
                            >

                                <div
                                    className={
                                        styles.specCardLabel
                                    }
                                >
                                    メーカー
                                </div>

                                <div
                                    className={
                                        styles.specCardValue
                                    }
                                >
                                    {
                                        rawMaker
                                    }
                                </div>

                            </div>

                        )
                        : null
                }

                {
                    rawPrice
                        ? (

                            <div
                                className={
                                    styles.specCard
                                }
                            >

                                <div
                                    className={
                                        styles.specCardLabel
                                    }
                                >
                                    価格
                                </div>

                                <div
                                    className={
                                        styles.specCardValue
                                    }
                                >
                                    {
                                        rawPrice
                                    }
                                </div>

                            </div>

                        )
                        : null
                }

                {
                    rawStock
                        ? (

                            <div
                                className={
                                    styles.specCard
                                }
                            >

                                <div
                                    className={
                                        styles.specCardLabel
                                    }
                                >
                                    在庫
                                </div>

                                <div
                                    className={
                                        styles.specCardValue
                                    }
                                >
                                    {
                                        rawStock
                                    }
                                </div>

                            </div>

                        )
                        : null
                }

                {
                    rawShipping
                        ? (

                            <div
                                className={
                                    styles.specCard
                                }
                            >

                                <div
                                    className={
                                        styles.specCardLabel
                                    }
                                >
                                    配送
                                </div>

                                <div
                                    className={
                                        styles.specCardValue
                                    }
                                >
                                    {
                                        rawShipping
                                    }
                                </div>

                            </div>

                        )
                        : null
                }

                {
                    rawSku
                        ? (

                            <div
                                className={
                                    styles.specCard
                                }
                            >

                                <div
                                    className={
                                        styles.specCardLabel
                                    }
                                >
                                    SKU
                                </div>

                                <div
                                    className={
                                        styles.specCardValue
                                    }
                                >
                                    {
                                        rawSku
                                    }
                                </div>

                            </div>

                        )
                        : null
                }

            </div>

            {/* ==================================================================
            PRODUCT TITLE
            ================================================================== */}

            {
                rawTitle
                    ? (

                        <div
                            className={
                                styles.specFooter
                            }
                        >
                            <strong>
                                商品名
                            </strong>
                            {' '}
                            {rawTitle}
                        </div>

                    )
                    : null
            }

            {/* ==================================================================
            DESCRIPTION
            ================================================================== */}

            {
                rawDescription
                    ? (

                        <div
                            className={
                                styles.specFooter
                            }
                        >
                            <strong>
                                商品説明
                            </strong>
                            {' '}
                            {rawDescription}
                        </div>

                    )
                    : null
            }

            {/* ==================================================================
            RAW SPECS
            ================================================================== */}

            {
                rawSpecs.length > 0
                    ? (

                        <div
                            className={
                                styles.specGrid
                            }
                        >

                            {
                                rawSpecs.map(
                                    (
                                        specification,
                                        index
                                    ) => (

                                        <div
                                            key={
                                                `${specification}-${index}`
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

                    )
                    : null
            }

            {/* ==================================================================
            LABELS
            ================================================================== */}

            {
                rawLabels.length > 0
                    ? (

                        <div
                            className={
                                styles.specFooter
                            }
                        >

                            {
                                rawLabels.join(
                                    ' / '
                                )
                            }

                        </div>

                    )
                    : null
            }

            {/* ==================================================================
            AVAILABILITY
            ================================================================== */}

            {
                rawAvailability
                    ? (

                        <div
                            className={
                                styles.specFooter
                            }
                        >
                            Availability:
                            {' '}
                            {
                                rawAvailability
                            }
                        </div>

                    )
                    : null
            }

            {/* ==================================================================
            FOOTER
            ================================================================== */}

            <div
                className={
                    styles.specFooter
                }
            >
                TSUKUMO が提供する販売情報を
                Observation Reality として表示しています。
            </div>

        </section>

    )

}