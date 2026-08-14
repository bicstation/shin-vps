// ============================================================================
// FILE:
// next-bicstation/app/product/[unique_id]/components/spec/observation/LavieObservation.tsx
// ============================================================================
//
// SHIN CORE LINX
// LAVIE Observation Renderer
//
// PURPOSE
//
// LAVIE が提供した Observation Reality を表示する。
//
// Backend / Observation
//      ↓
// observation_runtime
//      ↓
// LavieObservation
//      ↓
// UI
//
// IMPORTANT
//
// ✓ LAVIE Observation Reality を表示
// ✓ specs[] をそのまま表示
// ✓ labels[] をそのまま表示
// ✓ release をそのまま表示
// ✓ Null Safety
//
// ✗ CPU / GPU等への意味分類
// ✗ Semantic Generation
// ✗ Reality解析
// ✗ raw dataからの推測
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
// Observation
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
    ) {

        return null

    }

    return observation

}

/* ============================================================================
// Specs
============================================================================ */

function getSpecs(
    observation: any,
): string[] {

    if (
        !Array.isArray(
            observation?.specs
        )
    ) {

        return []

    }

    return observation.specs
        .filter(
            (
                value: unknown
            ): value is string => (

                typeof value === 'string'
                &&
                value.trim().length > 0

            )
        )
        .map(
            (
                value
            ) =>
                value.trim()
        )

}

/* ============================================================================
// Labels
============================================================================ */

function getLabels(
    observation: any,
): string[] {

    if (
        !Array.isArray(
            observation?.labels
        )
    ) {

        return []

    }

    return observation.labels
        .filter(
            (
                value: unknown
            ): value is string => (

                typeof value === 'string'
                &&
                value.trim().length > 0

            )
        )
        .map(
            (
                value
            ) =>
                value.trim()
        )

}

/* ============================================================================
// Component
============================================================================ */

export default function LavieObservation({

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

    /* ========================================================================
    Observation unavailable
    ======================================================================== */

    if (
        !observation
    ) {

        return null

    }

    const specs =
        getSpecs(
            observation
        )

    const labels =
        getLabels(
            observation
        )

    const release =
        typeof observation.release === 'string'
            ? observation.release.trim()
            : ''

    const productName =
        product?.name
        ||
        observation?.raw_title
        ||
        'この製品'

    /* ========================================================================
    No displayable Reality
    ======================================================================== */

    if (
        specs.length === 0
        &&
        labels.length === 0
        &&
        !release
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
                    LAVIE OBSERVATION
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
      SPECIFICATIONS
      ================================================================ */}

            {
                specs.length > 0
                && (

                    <div
                        className={
                            styles.specGrid
                        }
                    >

                        {
                            specs.map(
                                (
                                    spec,
                                    index
                                ) => (

                                    <div
                                        key={
                                            `${spec}-${index}`
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
                                            LAVIE
                                        </div>

                                        <div
                                            className={
                                                styles.specCardValue
                                            }
                                        >
                                            {
                                                spec
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
      RELEASE
      ================================================================ */}

            {
                release
                && (

                    <div
                        className={
                            styles.specFooter
                        }
                    >
                        {
                            release
                        }
                    </div>

                )
            }

            {/* ================================================================
      LABELS
      ================================================================ */}

            {
                labels.length > 0
                && (

                    <div
                        className={
                            styles.specFooter
                        }
                    >

                        {
                            labels.join(
                                ' / '
                            )
                        }

                    </div>

                )
            }

        </section>

    )

}