// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/next-bicstation/app/test/runtime/inspectors/orchestrators/RankingInspectorOrchestrator.tsx
// ============================================================================

'use client'

/**
 * ============================================================================
 * SHIN CORE LINX
 * Ranking Inspector Orchestrator
 * ============================================================================
 *
 * PURPOSE:
 *
 * Ranking runtime observability orchestration
 *
 * IMPORTANT:
 *
 * This orchestrator exists for:
 *
 * ranking-runtime inspector composition
 *
 * NOT:
 *
 * payload normalization
 * semantic mutation
 * ranking transformation
 *
 * ============================================================================
 */

/* ============================================================================
🔥 Ranking Inspectors
============================================================================ */

import RankingRuntimeInspector
from '../semantic/ranking/RankingRuntimeInspector'

import RankingAuthorityInspector
from '../semantic/ranking/RankingAuthorityInspector'

import RankingCollectionInspector
from '../semantic/ranking/RankingCollectionInspector'

import RankingPayloadInspector
from '../semantic/ranking/RankingPayloadInspector'

/* ============================================================================
🔥 Props
============================================================================ */

type RankingInspectorOrchestratorProps = {

  runtime?: any
}

/* ============================================================================
🔥 Ranking Inspector Orchestrator
============================================================================ */

export default function RankingInspectorOrchestrator({

  runtime,

}: RankingInspectorOrchestratorProps) {

  /* ==========================================================================
  🔥 Payload
  ========================================================================== */

  const payload =

    runtime?.payload
    || {}

  /* ==========================================================================
  🔥 Ranking
  ========================================================================== */

  const ranking =

    payload?.ranking
    || {}

  /* ==========================================================================
  🔥 Ranking Results
  ========================================================================== */

  const rankingResults =

    Array.isArray(
      ranking?.results
    )

      ? ranking.results

      : []

  /* ==========================================================================
  🔥 Runtime Metadata
  ========================================================================== */

  const rankingMode =

    payload?.ranking_mode
    || '-'

  const semanticSlug =

    payload?.semantic_slug
    || '-'

  const semanticRuntime =

    payload?.semantic_runtime
    || '-'

  /* ==========================================================================
  🔥 Runtime Debug
  ========================================================================== */

  console.log(

    '🏆 RANKING INSPECTOR ORCHESTRATOR',

    {

      runtimeRole:

        runtime?.runtime_role,

      topologyLayer:

        runtime?.topology_layer,

      endpoint:

        runtime?.endpoint,

      rankingMode,

      semanticSlug,

      semanticRuntime,

      results:

        rankingResults.length,
    }
  )

  /* ==========================================================================
  🔥 Observatory Stack
  ========================================================================== */

  return (

    <div className="space-y-8">

      {/* ================================================================
      🔥 Ranking Runtime
      ================================================================ */}

      <RankingRuntimeInspector

        runtime={runtime}

      />

      {/* ================================================================
      🔥 Ranking Authority
      ================================================================ */}

      <RankingAuthorityInspector

        runtime={runtime}

      />

      {/* ================================================================
      🔥 Ranking Collection
      ================================================================ */}

      <RankingCollectionInspector

        ranking={ranking}

        results={rankingResults}

      />

      {/* ================================================================
      🔥 Raw Ranking Payload
      ================================================================ */}

      <RankingPayloadInspector

        payload={payload}

      />

    </div>
  )
}