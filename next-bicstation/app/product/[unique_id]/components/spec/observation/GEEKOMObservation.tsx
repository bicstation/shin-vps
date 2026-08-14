// ============================================================================
// FILE:
// next-bicstation/app/product/[unique_id]/components/spec/observation/GEEKOMObservation.tsx
// ============================================================================
//
// SHIN CORE LINX
// GEEKOM Observation Renderer
//
// PURPOSE
//
// GEEKOM が提供した Observation Reality を表示する。
//
// Backend / Observation
//      ↓
// observation_runtime
//      ↓
// tables[]
//      ↓
// GEEKOMObservation
//      ↓
// UI
//
// IMPORTANT
//
// ✓ GEEKOM Observation Reality の表示のみ
// ✓ tables[] に含まれるメーカー提供情報をそのまま表示
// ✓ メーカーが提供した表示順を維持
// ✓ メーカーの項目 / 値の境界をUI上で復元
// ✓ Object / JSON String の両方に対応
// ✓ Null / malformed data を防御
//
// ✗ CPU / GPU等の意味生成
// ✗ Semantic Classification
// ✗ Realityの推測
// ✗ Runtime生成
// ✗ scripts[] の解析
// ✗ JSON-LD の表示
//
// ============================================================================

import styles
    from '../spec.module.css'

/* ============================================================================
// Types
============================================================================ */

type GEEKOMObservation = {

    tables?: unknown

}

type GEEKOMSpecification = {

    label: string

    value: string

}

type Props = {

    product: any

}

/* ============================================================================
// getObservation
============================================================================ */

function getObservation(
    product: any,
): GEEKOMObservation | null {

    const rawObservation =
        product?.observationRuntime
        ||
        product?.observation_runtime

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

        return (
            rawObservation
            as GEEKOMObservation
        )

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

                return (
                    parsed
                    as GEEKOMObservation
                )

            }

        } catch {

            return null

        }

    }

    return null

}

/* ============================================================================
// getTables
============================================================================ */

/**
 * ============================================================================
 * getTables
 * ============================================================================
 *
 * GEEKOM Observation Reality に存在する
 * tables[] を取得する。
 *
 * tables[] の内容そのものは変更しない。
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
// getLines
============================================================================ */

/**
 * ============================================================================
 * getLines
 * ============================================================================
 *
 * table文字列を行単位に分解する。
 *
 * ここでは意味を解釈しない。
 *
 * ============================================================================
 */

function getLines(
    table: string,
): string[] {

    return table
        .split(/\r?\n/)
        .map(
            (
                line
            ) =>
                line
                    .replace(
                        /\s+/g,
                        ' '
                    )
                    .trim()
        )
        .filter(
            (
                line
            ) =>
                line.length > 0
        )

}

/* ============================================================================
// isLikelyLabel
============================================================================ */

/**
 * ============================================================================
 * isLikelyLabel
 * ============================================================================
 *
 * メーカーの表における「項目名」と「値」の境界を
 * UI表示上で復元するための構造判定。
 *
 * これはCPU/GPU等の意味分類ではない。
 *
 * 長い値を誤ってlabelとして扱わないため、
 * 短い行を項目候補として扱う。
 *
 * ============================================================================
 */

function isLikelyLabel(
    line: string,
): boolean {

    if (
        !line
    ) {

        return false

    }

    if (
        line.length > 40
    ) {

        return false

    }

    return true

}

/* ============================================================================
// parseTable
// ============================================================================ */

/**
 * ============================================================================
 * parseTable
 * ============================================================================
 *
 * GEEKOMのメーカー表を
 *
 * label
 * value
 *
 * のペアへ変換する。
 *
 * 重要：
 *
 * ここで行っているのは「表示上の表構造の復元」のみ。
 *
 * CPU
 * GPU
 * Memory
 * Storage
 *
 * などの意味分類は行わない。
 *
 * ============================================================================
 */

function parseTable(
    table: string,
): GEEKOMSpecification[] {

    const lines =
        getLines(
            table
        )

    if (
        lines.length === 0
    ) {

        return []

    }

    const specifications:
        GEEKOMSpecification[]
        = []

    let currentLabel:
        string
        | null
        = null

    let currentValue:
        string[]
        = []

    const flush =
        () => {

            if (
                !currentLabel
            ) {

                return

            }

            const value =
                currentValue
                    .join(' ')
                    .trim()

            if (
                !value
            ) {

                return

            }

            specifications.push({

                label:
                    currentLabel,

                value,

            })

        }

    for (
        const line of lines
    ) {

        /* ----------------------------------------------------------------------
        最初の行
        ---------------------------------------------------------------------- */

        if (
            !currentLabel
        ) {

            if (
                isLikelyLabel(
                    line
                )
            ) {

                currentLabel =
                    line

            } else {

                /*
                 * 想定外の構造でも
                 * Realityを捨てない。
                 *
                 * 値だけの場合は表示可能な
                 * フォールバックとして保持する。
                 */

                specifications.push({

                    label:
                        'メーカー提供情報',

                    value:
                        line,

                })

            }

            continue

        }

        /* ----------------------------------------------------------------------
        次の項目名と判断
        ---------------------------------------------------------------------- */

        if (
            isLikelyLabel(
                line
            )
            &&
            currentValue.length > 0
        ) {

            flush()

            currentLabel =
                line

            currentValue =
                []

            continue

        }

        /* ----------------------------------------------------------------------
        現在の項目の値
        ---------------------------------------------------------------------- */

        currentValue.push(
            line
        )

    }

    /* --------------------------------------------------------------------------
    最後の項目
    -------------------------------------------------------------------------- */

    flush()

    return specifications

}

/* ============================================================================
// getSpecifications
============================================================================ */

/**
 * ============================================================================
 * getSpecifications
 * ============================================================================
 *
 * tables[] の各表をメーカー提供順のまま
 * UI表示用の項目へ変換する。
 *
 * ============================================================================
 */

function getSpecifications(
    product: any,
): GEEKOMSpecification[] {

    const tables =
        getTables(
            product
        )

    if (
        tables.length === 0
    ) {

        return []

    }

    return tables
        .flatMap(
            (
                table
            ) =>
                parseTable(
                    table
                )
        )

}

/* ============================================================================
// Component
============================================================================ */

export default function GEEKOMObservation({

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
                    GEEKOM OBSERVATION
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