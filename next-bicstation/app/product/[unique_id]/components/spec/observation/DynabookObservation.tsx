// ============================================================================
// FILE:
// next-bicstation/app/product/[unique_id]/components/spec/observation/DynabookObservation.tsx
// ============================================================================
//
// SHIN CORE LINX
// Dynabook Observation Renderer
//
// PURPOSE
//
// Dynabook が提供した Observation Reality を表示する。
//
// Backend / Observation
//      ↓
// observation_runtime
//      ↓
// DynabookObservation
//      ↓
// UI
//
// IMPORTANT
//
// ✓ Dynabook Observation Runtime を表示
// ✓ specifications[] に対応
// ✓ raw_text に対応
// ✓ Object / JSON String の両方に対応
// ✓ Null / malformed data を防御
//
// ✗ raw_text の意味解析
// ✗ CPU / GPU等への分類
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
 * observation_runtime は、
 *
 * ✓ Object
 * ✓ JSON String
 *
 * の両方を許容する。
 *
 * メーカー固有の内部構造はここでは解釈しない。
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
        ||
        rawObservation === ''
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
                !Array.isArray(parsed)
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
 * Dynabook Observation に仕様配列が存在する場合のみ取得する。
 *
 * 現在のDynabook Realityでは specifications[] が空の場合がある。
 *
 * その場合は raw_text を表示対象とする。
 *
 * ============================================================================
 */

function getSpecifications(
    observation: any,
): Array<{
    label: string
    value: string
}> {

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
// getRawText
============================================================================ */

/**
 * ============================================================================
 * getRawText
 * ============================================================================
 *
 * Dynabookが提供したraw_textをそのまま取得する。
 *
 * ここでは解析・分類を行わない。
 *
 * ============================================================================
 */

function getRawText(
    observation: any,
): string {

    const rawText =
        observation?.raw_text
        ||
        observation?.rawText

    if (
        typeof rawText !== 'string'
    ) {

        return ''

    }

    return rawText.trim()

}

/* ============================================================================
// Component
============================================================================ */

export default function DynabookObservation({

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
            observation
        )

    const rawText =
        getRawText(
            observation
        )

    const productName =
        product?.name
        ||
        'この製品'

    /* ========================================================================
    Empty
    ======================================================================== */

    if (
        specifications.length === 0
        &&
        !rawText
    ) {

        return null

    }

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
                    DYNABOOK OBSERVATION
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
            STRUCTURED SPECIFICATIONS
            ================================================================ */}

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

                )
            }

            {/* ================================================================
            RAW OBSERVATION
            ================================================================ */}

            {
                rawText
                && (

                    <div
                        className={
                            styles.specFooter
                        }
                    >

                        <div>
                            メーカー提供情報
                        </div>

                        <div
                            style={{
                                marginTop: '8px',
                                whiteSpace: 'pre-wrap',
                            }}
                        >
                            {
                                rawText
                            }
                        </div>

                    </div>

                )
            }

            {/* ================================================================
            FOOTER
            ================================================================ */}

            <div
                className={
                    styles.specFooter
                }
            >
                Dynabookが提供する製品情報を
                Observation Reality として表示しています。
            </div>

        </section>

    )

}