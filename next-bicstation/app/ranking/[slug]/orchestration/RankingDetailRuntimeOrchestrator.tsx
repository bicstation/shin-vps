// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/[slug]/orchestration/RankingDetailRuntimeOrchestrator.tsx
// Copyright (c) 2024 Shin Corporation.
// All rights reserved.
// ============================================================================

'use client'

/**
 * ============================================================================
 * SHIN CORE LINX
 * Ranking Detail Runtime Orchestrator
 * ============================================================================
 *
 * PURPOSE
 *
 * Experience composition only.
 *
 * This module SHALL:
 *
 * ✓ Compose Ranking Experience
 * ✓ Bind Platform Runtime
 * ✓ Render Experience Components
 *
 * This module SHALL NOT:
 *
 * ✗ Fetch Runtime
 * ✗ Generate Metadata
 * ✗ Generate JSON-LD
 * ✗ Generate Meaning
 *
 * ============================================================================
 */

import {

    RankingRuntime,

    RankingDebug,

} from '../components'

import styles from '../RankingSlugPage.module.css'

/* ============================================================================
🔥 Props
============================================================================ */
interface RankingDetailRuntimeOrchestratorProps {

  runtime: {

    ranking: any

    debug?: boolean

    semantic_runtime: boolean

    adaptive_runtime: boolean

  }

}


/* ============================================================================
🔥 Orchestrator
============================================================================ */

export default function RankingDetailRuntimeOrchestrator({

    runtime,

}: RankingDetailRuntimeOrchestratorProps) {

    return (

        <main

            className={styles.page}

        >

            {/* ==========================================================
            Ranking Experience
            ========================================================== */}

            <RankingRuntime

                runtime={

                    runtime.ranking.runtime

                }

            />

            {/* ==========================================================
            Debug
            ========================================================== */}

            {

                runtime.debug && (

                    <RankingDebug

                        runtime={

                            runtime.ranking.runtime

                        }

                    />

                )

            }

        </main>

    )

}