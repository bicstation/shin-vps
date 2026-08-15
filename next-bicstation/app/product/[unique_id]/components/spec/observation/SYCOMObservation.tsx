// /home/maya/shin-dev/shin-vps/next-bicstation/app/product/[unique_id]/components/spec/observation/SYCOMObservation.tsx
// ============================================================================
// FILE:
// next-bicstation/app/product/[unique_id]/components/spec/observation/SYCOMObservation.tsx
// ============================================================================
//
// SHIN CORE LINX
// SYCOM Observation Renderer
//
// PURPOSE
//
// SYCOM が提供した Observation Reality を表示する。
//
// Backend / Observation
//      ↓
// SYCOM Observation Runtime
//      ↓
// SYCOMObservation
//      ↓
// UI
//
// IMPORTANT
//
// ✓ SYCOM Observation Reality の表示のみ
// ✓ Observation Runtime の固定フィールドをそのまま表示
// ✓ 値が存在する項目のみ表示
// ✓ 空値はUIから除外
// ✓ Null / malformed data を防御
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

type Props = {

    product: any

}

type SYCOMObservation = {

    os?: unknown

    cpu?: unknown

    gpu?: unknown

    case?: unknown

    wifi?: unknown

    power?: unknown

    cooler?: unknown

    memory?: unknown

    chipset?: unknown

    storage?: unknown

    guarantee?: unknown

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
 * Frontend Adapterによって
 *
 * observationRuntime
 * observation_runtime
 *
 * のどちらで渡されても対応する。
 *
 * ============================================================================
 */

function getObservation(
    product: any,
): SYCOMObservation | null {

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

    return observation as SYCOMObservation

}

/* ============================================================================
// Value
============================================================================ */

/**
 * ============================================================================
 * normalizeValue
 * ============================================================================
 *
 * Observation Realityの値をUI表示可能な文字列へ変換する。
 *
 * 値そのものの意味解析は行わない。
 *
 * ============================================================================
 */

function normalizeValue(
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
// Specifications
============================================================================ */

/**
 * ============================================================================
 * getSpecifications
 * ============================================================================
 *
 * SYCOM Observation Runtimeの固定フィールドを
 * UI表示用のlabel / valueへ投影する。
 *
 * Observation Realityの値そのものは変更しない。
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

    const fields: Array<{
        key: keyof SYCOMObservation
        label: string
    }> = [

        {
            key: 'os',
            label: 'OS',
        },

        {
            key: 'cpu',
            label: 'CPU',
        },

        {
            key: 'gpu',
            label: 'GPU',
        },

        {
            key: 'memory',
            label: 'メモリ',
        },

        {
            key: 'storage',
            label: 'ストレージ',
        },

        {
            key: 'chipset',
            label: 'チップセット',
        },

        {
            key: 'case',
            label: 'ケース',
        },

        {
            key: 'wifi',
            label: '無線LAN',
        },

        {
            key: 'power',
            label: '電源',
        },

        {
            key: 'cooler',
            label: 'CPUクーラー',
        },

        {
            key: 'guarantee',
            label: '保証',
        },

    ]

    return fields
        .map(
            (
                field
            ) => ({

                label:
                    field.label,

                value:
                    normalizeValue(
                        observation[
                            field.key
                        ]
                    ),

            })
        )
        .filter(
            (
                specification
            ) => (
                specification.value.length > 0
            )
        )

}

/* ============================================================================
// Component
============================================================================ */

export default function SYCOMObservation({

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
                    SYCOM OBSERVATION
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