// ============================================================================
// FILE:
// /home/maya/shin-vps/next-bicstation/app/test/runtime/orchestration/buildRuntimeScene.ts
// ============================================================================

/* ============================================================================
🔥 Types
============================================================================ */

type BuildRuntimeSceneOptions = {

  mode?: string

  runtime?: any
}

/* ============================================================================
🔥 Build Runtime Scene
============================================================================ */

/**
 * Canonical runtime scene builder.
 *
 * Responsibilities:
 *
 * - runtime scene continuity
 * - observatory scene orchestration
 * - semantic runtime preservation
 * - traversal continuity preservation
 * - inspector-safe runtime composition
 *
 * IMPORTANT:
 *
 * Frontend does NOT mutate semantic meaning.
 *
 * Backend remains semantic authority.
 */

export function buildRuntimeScene({

  mode,

  runtime,

}: BuildRuntimeSceneOptions) {

  // ==========================================================================
  // Runtime Safety
  // ==========================================================================

  const safeRuntime =

    runtime && typeof runtime === 'object'

      ? runtime

      : {}

  // ==========================================================================
  // Canonical Runtime Metadata
  // ==========================================================================

  const runtimeRole =

    safeRuntime?.runtime_role
    || 'unknown-runtime'

  const topologyLayer =

    safeRuntime?.topology_layer
    || 'entity'

  const observatory =

    safeRuntime?.observatory
    || 'semantic-runtime-observatory'

  // ==========================================================================
  // Runtime Activity
  // ==========================================================================

  const runtimeActive =

    !!safeRuntime?.semantic_runtime

    || !!safeRuntime?.adaptive_runtime

    || !!safeRuntime?.workflow_runtime

    || (

      Array.isArray(
        safeRuntime?.traversal_edges
      )

      &&

      safeRuntime.traversal_edges.length > 0
    )

    || (

      Array.isArray(
        safeRuntime?.traversal_graph
      )

      &&

      safeRuntime.traversal_graph.length > 0
    )

  // ==========================================================================
  // Scene Title
  // ==========================================================================

  const sceneTitle =

    runtimeRole ===
    'continuation-runtime'

      ? 'Continuation Runtime'

      : runtimeRole ===
        'ranking-runtime'

          ? 'Ranking Runtime'

          : runtimeRole ===
            'finder-runtime'

              ? 'Finder Runtime'

              : runtimeRole ===
                'sidebar-runtime'

                  ? 'Sidebar Runtime'

                  : 'Entity Runtime'

  // ==========================================================================
  // Scene Description
  // ==========================================================================

  const sceneDescription =

    runtimeRole ===
    'continuation-runtime'

      ? 'semantic continuation runtime ・ traversal orchestration ・ exploration continuity'

      : runtimeRole ===
        'ranking-runtime'

          ? 'semantic ranking runtime ・ orchestration observability ・ ranking topology'

          : runtimeRole ===
            'finder-runtime'

              ? 'semantic finder runtime ・ intent routing ・ discovery orchestration'

              : runtimeRole ===
                'sidebar-runtime'

                  ? 'semantic sidebar runtime ・ navigation observability ・ runtime topology'

                  : 'semantic entity runtime ・ semantic observability ・ runtime orchestration'

  // ==========================================================================
  // Runtime Debug
  // ==========================================================================

  console.log(

    '🏗️ BUILD RUNTIME SCENE',

    {

      runtimeRole,

      topologyLayer,

      observatory,

      runtimeActive,

      sceneTitle,

      traversalEdges:

        Array.isArray(
          safeRuntime?.traversal_edges
        )

          ? safeRuntime.traversal_edges.length

          : 0,

      traversalGraph:

        Array.isArray(
          safeRuntime?.traversal_graph
        )

          ? safeRuntime.traversal_graph.length

          : 0,
    }
  )

  // ==========================================================================
  // Runtime Scene
  // ==========================================================================

  return {

    // ==============================================================
    // 🔥 Preserve Canonical Runtime
    // ==============================================================

    ...safeRuntime,

    // ==============================================================
    // 🔥 Runtime Scene Metadata
    // ==============================================================

    mode,

    runtimeRole,

    topologyLayer,

    observatory,

    runtimeActive,

    sceneTitle,

    sceneDescription,
  }
}