// ============================================================================
// FILE:
// next-bicstation/app/product/[unique_id]/components/spec/observation/GMKtecObservation.tsx
// ============================================================================
//
// SHIN CORE LINX
// GMKtec Observation Renderer
//
// PURPOSE
//
// GMKtec が提供した Observation Reality を表示する。
//
// Backend / Observation
//      ↓
// observation_runtime
//      ↓
// tables[]
//      ↓
// GMKtecObservation
//      ↓
// UI
//
// IMPORTANT
//
// ✓ メーカー提供情報をそのまま表示
// ✓ tables[] の順序を維持
// ✓ 項目名と値の構造だけをUI用に復元
// ✓ 複数行の値を1つの項目として保持
// ✓ JSON String / Object の両方に対応
// ✓ Null / malformed data を防御
//
// ✗ CPU / GPU等の意味生成
// ✗ Semantic Classification
// ✗ Realityの推測
// ✗ scripts[] の解析
// ✗ JSON-LDの解析
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

type ObservationSpecification = {

    label: string

    value: string

}

/* ============================================================================
getObservation
============================================================================ */

function getObservation(
    product: any,
): any {

    const rawObservation =
        product?.observationRuntime
        ||
        product?.observation_runtime

    if (
        !rawObservation
    ) {

        return null

    }

    if (
        typeof rawObservation === 'object'
        &&
        !Array.isArray(
            rawObservation
        )
    ) {

        return rawObservation

    }

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
getTables
============================================================================ */

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
parseTable
============================================================================ */

/**
 * ============================================================================
 * parseTable
 * ============================================================================
 *
 * GMKtecのメーカー表は、
 *
 * label
 * value
 * label
 * value
 *
 * という順序で構成されている。
 *
 * valueが複数行の場合は、
 * 次のlabelが出現するまで同じvalueへ追加する。
 *
 * これは意味解析ではなく、
 * メーカーが提供した表構造の復元である。
 *
 * ============================================================================
 */

function parseTable(
    table: string,
): ObservationSpecification[] {

    const lines =
        table
            .split(/\r?\n/)
            .map(
                (
                    line
                ) =>
                    line.trim()
            )
            .filter(
                (
                    line
                ) =>
                    line.length > 0
            )

    if (
        lines.length === 0
    ) {

        return []

    }

    const specifications:
        ObservationSpecification[]
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
                ||
                currentValue.length === 0
            ) {

                return

            }

            specifications.push({

                label:
                    currentLabel,

                value:
                    currentValue.join(
                        '\n'
                    ),

            })

        }

    for (
        const line of lines
    ) {

        /*
         * GMKtecの現在のRealityでは、
         * 項目名は短い独立行として現れる。
         *
         * ただしvalueにも短い文字列があり得るため、
         * 「現在valueが存在している状態で次の短い行が来た」
         * 場合だけ新しいlabelとして扱う。
         */

        if (
            currentLabel === null
        ) {

            currentLabel =
                line

            continue

        }

        if (
            currentValue.length > 0
            &&
            line.length <= 20
            &&
            !line.includes(' ')
            &&
            !line.startsWith('•')
        ) {

            flush()

            currentLabel =
                line

            currentValue =
                []

            continue

        }

        currentValue.push(
            line
        )

    }

    flush()

    return specifications

}

/* ============================================================================
getSpecifications
============================================================================ */

function getSpecifications(
    product: any,
): ObservationSpecification[] {

    const tables =
        getTables(
            product
        )

    return tables.flatMap(
        (
            table
        ) =>
            parseTable(
                table
            )
    )

}

/* ============================================================================
Component
============================================================================ */

export default function GMKtecObservation({

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

    if (
        specifications.length === 0
    ) {

        return null

    }

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
                    GMKTEC OBSERVATION
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
            SPEC GRID
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