// ============================================================================
// FILE:
// /app/ranking/[slug]/observatory/components/RuntimeInspector.tsx
// Copyright (c) 2024 Shin Corporation.
// All rights reserved.
// ============================================================================

'use client'

/* ============================================================================
🔥 Contracts
============================================================================ */

import type {

    SemanticRankingRuntime,

} from '../../types/contracts'

/* ============================================================================
🔥 Components
============================================================================ */

import RuntimeCoverage
    from './RuntimeCoverage'

import RuntimeConsumption
    from './RuntimeConsumption'

import RuntimeDiagnostics
    from './RuntimeDiagnostics'

/* ============================================================================
🔥 Styles
============================================================================ */

import styles
    from '../styles/inspector.module.css'

/* ============================================================================
🔥 Props
============================================================================ */

type Props = {

    runtime: SemanticRankingRuntime

}

/* ============================================================================
🔥 Runtime Inspector
============================================================================ */

export default function RuntimeInspector({

    runtime,

}: Props) {

    return (

        <section
            className={styles.inspector}
        >

            {/* ==========================================================
            Header
            ========================================================== */}

            <header
                className={styles.header}
            >

                <div
                    className={styles.badge}
                >

                    Runtime Inspector

                </div>

                <h2
                    className={styles.title}
                >

                    Ranking Runtime Observatory

                </h2>

                <p
                    className={styles.description}
                >

                    Developer Experience panel for inspecting
                    Runtime coverage, Runtime consumption,
                    and Runtime diagnostics.

                </p>

            </header>

            {/* ==========================================================
            Runtime Coverage
            ========================================================== */}

            <RuntimeCoverage

                runtime={runtime}

            />

            {/* ==========================================================
            Runtime Consumption
            ========================================================== */}

            <RuntimeConsumption

                runtime={runtime}

            />

            {/* ==========================================================
            Runtime Diagnostics
            ========================================================== */}

            <RuntimeDiagnostics

                runtime={runtime}

            />

        </section>

    )

}