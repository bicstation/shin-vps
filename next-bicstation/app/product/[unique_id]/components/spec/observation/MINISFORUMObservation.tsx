// /home/maya/shin-dev/shin-vps/next-bicstation/app/product/[unique_id]/components/spec/observation/MINISFORUMObservation.tsx
// ============================================================================
// FILE:
// next-bicstation/app/product/[unique_id]/components/spec/observation/MINISFORUMObservation.tsx
// ============================================================================
//
// SHIN CORE LINX
// MINISFORUM Observation Renderer
//
// PURPOSE
//
// MINISFORUM が提供した Observation Reality を表示する。
//
// Backend / Observation
//      ↓
// tables[]
//      ↓
// MINISFORUMObservation
//      ↓
// UI
//
// IMPORTANT
//
// ✓ MINISFORUM Observation Reality の表示のみ
// ✓ tables[] の各ブロックをそのまま表示
// ✓ メーカーが提供した表示順を維持
// ✓ table block の内容を解析・分類しない
// ✓ Null / malformed data を防御
//
// ✗ CPU / GPU等の意味生成
// ✗ tables[] の意味分類
// ✗ raw_text の解析
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
// getTables
============================================================================ */

/**
 * ============================================================================
 * getTables
 * ============================================================================
 *
 * MINISFORUM Observation Reality に存在する
 * tables[] を取得する。
 *
 * 各要素はメーカーが提供した
 * Observation block として扱う。
 *
 * ここでは内容を解析しない。
 *
 * ============================================================================
 */

function getTables(
    product: any,
): string[] {

    const observation =
        getObservation(
            product
        )

    const tables =
        observation?.tables

    if (
        !Array.isArray(
            tables
        )
    ) {

        return []

    }

    return tables
        .filter(
            (
                table: unknown
            ): table is string => {

                return (
                    typeof table === 'string'
                    &&
                    table.trim().length > 0
                )

            }
        )
        .map(
            (
                table
            ) =>
                table.trim()
        )

}

/* ============================================================================
// Component
============================================================================ */

export default function MINISFORUMObservation({

    product,

}: Props) {

    if (
        !product
    ) {

        return null

    }

    const tables =
        getTables(
            product
        )

    /* ========================================================================
    Empty
    ======================================================================== */

    if (
        tables.length === 0
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
                    MINISFORUM OBSERVATION
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
            OBSERVATION TABLE BLOCKS
            ================================================================ */}

            <div
                className={
                    styles.specGrid
                }
            >

                {
                    tables.map(
                        (
                            table,
                            index
                        ) => (

                            <div
                                key={
                                    `minisforum-observation-${index}`
                                }

                                className={
                                    styles.specCard
                                }
                            >

                                <div
                                    className={
                                        styles.specCardValue
                                    }
                                    style={{
                                        whiteSpace:
                                            'pre-line',
                                    }}
                                >
                                    {
                                        table
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