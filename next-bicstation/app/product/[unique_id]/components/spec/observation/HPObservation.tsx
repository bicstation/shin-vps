// ============================================================================
// FILE:
// /home/maya/shin-vps/next-bicstation/app/product/[unique_id]/components/spec/observation/HPObservation.tsx
// ============================================================================
//
// SHIN CORE LINX
// HP Observation Renderer
//
// PURPOSE
//
// HP Observation Runtime
//      ↓
// HP Manufacturer Reality
//      ↓
// HP Observation UI
//
// IMPORTANT
//
// This component does NOT:
//
// ✗ generate semantic meaning
// ✗ infer specifications
// ✗ generate CPU / GPU meaning
// ✗ infer missing values
// ✗ modify Observation Reality
//
// It only presents the Reality supplied by the HP Observation Runtime.
//
// ============================================================================

import styles from '../spec.module.css'

/* ============================================================================
// Types
============================================================================ */

type HPObservationSpecifications = {

    os?: string

    usage?: string

    memory?: string

    weight?: string

    storage?: string

    graphics?: string

    npu_aipc?: unknown[]

    display_size?: string

    processor_type?: string

    display_input_type?: string

    [key: string]: unknown

}

type HPObservationRuntime = {

    raw?: Record<string, unknown>

    sku?: string

    url?: string

    image_url?: string

    web_price?: number

    source_url?: string

    description?: string

    final_price?: number

    price_range?: string

    product_code?: string

    product_name?: string

    product_type?: string

    purchase_url?: string

    top_features?: string[]

    category_name?: string

    specifications?:
    HPObservationSpecifications

    short_description?: string

    source_unique_id?: string

    suggested_retail_price?: number

    [key: string]: unknown

}

/* ============================================================================
// Props
============================================================================ */

type Props = {

    product: any

}

/* ============================================================================
🔥 Helpers
============================================================================ */

/**
 * ============================================================================
 * getObservationRuntime
 * ============================================================================
 *
 * ProjectedProductからObservation Runtimeを取得する。
 *
 * observationRuntimeは、
 *
 * string
 * object
 *
 * の両方を安全に扱う。
 *
 * ============================================================================
 */

function getObservationRuntime(
    product: any,
): HPObservationRuntime | null {

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

                return parsed as HPObservationRuntime

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

        return observation as HPObservationRuntime

    }

    return null

}

/* ============================================================================
🔥 Value Guard
============================================================================ */

/**
 * ============================================================================
 * hasValue
 * ============================================================================
 *
 * HP Realityに存在する値だけを表示する。
 *
 * undefined
 * null
 * ''
 *
 * は表示しない。
 *
 * ============================================================================
 */

function hasValue(
    value: unknown,
): boolean {

    if (
        value === undefined
        || value === null
    ) {

        return false

    }

    return (
        String(value).trim().length > 0
    )

}

/* ============================================================================
🔥 Specification Builder
============================================================================ */

/**
 * ============================================================================
 * buildSpecifications
 * ============================================================================
 *
 * HP Observation Runtimeの
 * specifications をUI表示用に変換する。
 *
 * ここで意味生成は行わない。
 *
 * HPが返したフィールド名を
 * UIラベルへ翻訳するだけ。
 *
 * ============================================================================
 */

function buildSpecifications(
    specifications?:
        HPObservationSpecifications,
) {

    if (
        !specifications
    ) {

        return []

    }

    const specs: {
        label: string
        value: string
    }[] = []

    /* --------------------------------------------------------------------------
    OS
    -------------------------------------------------------------------------- */

    if (
        hasValue(
            specifications.os
        )
    ) {

        specs.push({

            label:
                'OS',

            value:
                String(
                    specifications.os
                ),

        })

    }

    /* --------------------------------------------------------------------------
    USAGE
    -------------------------------------------------------------------------- */

    if (
        hasValue(
            specifications.usage
        )
    ) {

        specs.push({

            label:
                '用途',

            value:
                String(
                    specifications.usage
                ),

        })

    }

    /* --------------------------------------------------------------------------
    PROCESSOR
    -------------------------------------------------------------------------- */

    if (
        hasValue(
            specifications.processor_type
        )
    ) {

        specs.push({

            label:
                'プロセッサー',

            value:
                String(
                    specifications.processor_type
                ),

        })

    }

    /* --------------------------------------------------------------------------
    GRAPHICS
    -------------------------------------------------------------------------- */

    if (
        hasValue(
            specifications.graphics
        )
    ) {

        specs.push({

            label:
                'グラフィックス',

            value:
                String(
                    specifications.graphics
                ),

        })

    }

    /* --------------------------------------------------------------------------
    MEMORY
    -------------------------------------------------------------------------- */

    if (
        hasValue(
            specifications.memory
        )
    ) {

        specs.push({

            label:
                'メモリ',

            value:
                String(
                    specifications.memory
                ),

        })

    }

    /* --------------------------------------------------------------------------
    STORAGE
    -------------------------------------------------------------------------- */

    if (
        hasValue(
            specifications.storage
        )
    ) {

        specs.push({

            label:
                'ストレージ',

            value:
                String(
                    specifications.storage
                ),

        })

    }

    /* --------------------------------------------------------------------------
    DISPLAY
    -------------------------------------------------------------------------- */

    if (
        hasValue(
            specifications.display_size
        )
    ) {

        specs.push({

            label:
                'ディスプレイ',

            value:
                String(
                    specifications.display_size
                ),

        })

    }

    /* --------------------------------------------------------------------------
    WEIGHT
    -------------------------------------------------------------------------- */

    if (
        hasValue(
            specifications.weight
        )
    ) {

        specs.push({

            label:
                '重量',

            value:
                String(
                    specifications.weight
                ),

        })

    }

    /* --------------------------------------------------------------------------
    DISPLAY INPUT
    -------------------------------------------------------------------------- */

    if (
        hasValue(
            specifications.display_input_type
        )
    ) {

        specs.push({

            label:
                'ディスプレイ入力',

            value:
                String(
                    specifications.display_input_type
                ),

        })

    }

    return specs

}

/* ============================================================================
🔥 Top Feature Parser
============================================================================ */

/**
 * ============================================================================
 * parseTopFeature
 * ============================================================================
 *
 * HPが返す
 *
 *     OS===Windows 11 Pro
 *
 * のようなメーカー提供文字列を、
 *
 *     label
 *     value
 *
 * に分離する。
 *
 * これは意味生成ではなく、
 * HP Realityの表示上の構造化のみを行う。
 *
 * ============================================================================
 */

function parseTopFeature(
    feature: unknown,
) {

    if (
        typeof feature !== 'string'
    ) {

        return null

    }

    const separator =
        feature.indexOf(
            '==='
        )

    if (
        separator < 0
    ) {

        return {

            label:
                'FEATURE',

            value:
                feature,

        }

    }

    const label =
        feature
            .slice(
                0,
                separator
            )
            .trim()

    const value =
        feature
            .slice(
                separator + 3
            )
            .trim()

    if (
        !label
        || !value
    ) {

        return null

    }

    return {

        label,

        value,

    }

}

/* ============================================================================
🔥 Component
============================================================================ */

export default function HPObservation({
    product,
}: Props) {

    if (
        !product
    ) {

        return null

    }

    const observation =
        getObservationRuntime(
            product
        )

    if (
        !observation
    ) {

        return null

    }

    const specifications =
        buildSpecifications(
            observation.specifications
        )

    const topFeatures =
        Array.isArray(
            observation.top_features
        )
            ? observation.top_features
                .map(
                    parseTopFeature
                )
                .filter(
                    Boolean
                ) as {
                    label: string
                    value: string
                }[]
            : []

    /* --------------------------------------------------------------------------
    Empty
    -------------------------------------------------------------------------- */

    if (
        specifications.length === 0
        && topFeatures.length === 0
    ) {

        return null

    }

    const productName =
        observation.product_name
        || product?.name
        || 'このPC'

    /* ==========================================================================
    Render
    ========================================================================== */

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
                    HP OBSERVATION
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
                    のHP提供情報を確認できます。
                </p>

            </div>

            {/* ======================================================================
      SPECIFICATIONS
      ====================================================================== */}

            {
                specifications.length > 0
                && (

                    <div
                        className={
                            styles.specGrid
                        }
                    >

                        {
                            specifications.map(
                                (
                                    spec,
                                    index
                                ) => (

                                    <div
                                        key={
                                            `${spec.label}-${index}`
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
                                                spec.label
                                            }
                                        </div>

                                        <div
                                            className={
                                                styles.specCardValue
                                            }
                                        >
                                            {
                                                spec.value
                                            }
                                        </div>

                                    </div>

                                )
                            )
                        }

                    </div>

                )
            }

            {/* ======================================================================
      TOP FEATURES
      ====================================================================== */}

            {
                topFeatures.length > 0
                && (

                    <>

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
                                HP PRODUCT FEATURES
                            </div>

                            <h3
                                className={
                                    styles.specTitle
                                }
                            >
                                製品の主な特徴
                            </h3>

                        </div>

                        <div
                            className={
                                styles.specGrid
                            }
                        >

                            {
                                topFeatures.map(
                                    (
                                        feature,
                                        index
                                    ) => (

                                        <div
                                            key={
                                                `${feature.label}-${index}`
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
                                                    feature.label
                                                }
                                            </div>

                                            <div
                                                className={
                                                    styles.specCardValue
                                                }
                                            >
                                                {
                                                    feature.value
                                                }
                                            </div>

                                        </div>

                                    )
                                )
                            }

                        </div>

                    </>

                )
            }

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