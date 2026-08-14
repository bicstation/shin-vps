// ============================================================================
// FILE:
// next-bicstation/app/product/[unique_id]/components/spec/observation/ObservationState.tsx
// ============================================================================
//
// SHIN CORE LINX
// Observation State Renderer
//
// PURPOSE
//
// Observation Runtime の取得状態を共通UIとして表示する。
//
// Product
//      ↓
// Observation Runtime
//      ↓
// Observation State
//      ↓
// Manufacturer Renderer
//
// IMPORTANT
//
// このコンポーネントはメーカー固有のObservation構造を解釈しない。
//
// ✓ Observation Runtime の存在確認
// ✓ Observation Runtime の取得状態表示
// ✓ Object / JSON String の両方に対応
// ✓ Empty State の表示
//
// ✗ specifications の型判定
// ✗ specs[] の判定
// ✗ raw_text の解析
// ✗ メーカー固有仕様の解釈
// ✗ Realityの意味生成
// ✗ Semantic Classification
// ✗ Runtime生成
//
// Manufacturer-specific Reality の表示判定は、
// 各 Manufacturer Observation Renderer が担当する。
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

/* ============================================================================
// Observation
============================================================================ */

/**
 * ============================================================================
 * getObservation
 * ============================================================================
 *
 * Backend / Adapter / Projection の状態によって、
 * observation_runtime が以下のどちらかになる可能性がある。
 *
 * 1. Object
 *
 * {
 *     source: 'lenovo',
 *     specifications: [...]
 * }
 *
 * 2. JSON String
 *
 * '{"source":"dynabook","specifications":[]}'
 *
 * この共通レイヤーでは両方をObservation Runtimeとして扱う。
 *
 * メーカー固有の内部構造は検査しない。
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
    Runtime が存在しない
    -------------------------------------------------------------------------- */

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

            /*
             * JSONとして解釈できない文字列は
             * Observation Runtimeとして扱わない。
             */

            return null

        }

    }

    /* --------------------------------------------------------------------------
    Unsupported
    -------------------------------------------------------------------------- */

    return null

}

/* ============================================================================
// State
============================================================================ */

export type ObservationStateType =

    | 'unavailable'

    | 'available'

/* ============================================================================
// resolveObservationState
============================================================================ */

/**
 * ============================================================================
 * Observation Runtime State
 * ============================================================================
 *
 * ここでは Observation Runtime の存在だけを判定する。
 *
 * メーカーによってObservation構造は異なるため、
 *
 * specifications[]
 * specifications{}
 * specs[]
 * raw_text
 * labels[]
 * classification[]
 *
 * などの内部構造は検査しない。
 *
 * ============================================================================
 */

export function resolveObservationState(
    product: any,
): ObservationStateType {

    const observation =
        getObservation(
            product
        )

    /* --------------------------------------------------------------------------
    Observation Runtime が存在しない
    -------------------------------------------------------------------------- */

    if (
        !observation
    ) {

        return 'unavailable'

    }

    /* --------------------------------------------------------------------------
    Observation Runtime が存在する
    -------------------------------------------------------------------------- */

    return 'available'

}

/* ============================================================================
// Component
============================================================================ */

export default function ObservationState({

    product,

}: Props) {

    const state =
        resolveObservationState(
            product
        )

    /* ========================================================================
    AVAILABLE
    ======================================================================== */

    if (
        state === 'available'
    ) {

        return null

    }

    /* ========================================================================
    UNAVAILABLE
    ======================================================================== */

    const productName =
        product?.name
        ||
        'この製品'

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
                    OBSERVATION
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
            EMPTY
            ================================================================ */}

            <div
                className={
                    styles.specFooter
                }
            >

                メーカー提供情報を取得できませんでした。

            </div>

        </section>

    )

}