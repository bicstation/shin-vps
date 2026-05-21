// ============================================================================
// FILE:
// /home/maya/shin-vps/next-bicstation/app/test/runtime/runtime/normalizeRuntimePayload.ts
// ============================================================================

/* ============================================================================
🔥 Normalize Runtime Payload
============================================================================ */

/**
 * Canonical runtime normalization layer.
 *
 * Responsibilities:
 *
 * - runtime transport normalization
 * - payload observability
 * - semantic runtime flattening
 * - traversal continuity preservation
 * - inspector-safe runtime topology
 *
 * IMPORTANT:
 *
 * Backend remains semantic authority.
 *
 * Frontend MUST NOT mutate semantic meaning.
 */

export function normalizeRuntimePayload(

  payload: any,

  endpoint?: string,

  duration?: number,
) {

  // ==========================================================================
  // Runtime Safety
  // ==========================================================================

  const safePayload =

    payload && typeof payload === 'object'

      ? payload

      : {}

  // ==========================================================================
  // Runtime Metadata
  // ==========================================================================

  const payloadKeys =

    Object.keys(
      safePayload
    )

  const payloadSize =

    JSON.stringify(
      safePayload
    ).length

  // ==========================================================================
  // Canonical Runtime Role
  // ==========================================================================

  const runtimeRole =

    safePayload?.runtime_role

    || safePayload?.semantic_runtime

    || 'unknown-runtime'

  // ==========================================================================
  // Canonical Topology Layer
  // ==========================================================================

  const topologyLayer =

    safePayload?.topology_layer

    || (

      runtimeRole ===
      'continuation-runtime'

        ? 'traversal'

        : runtimeRole ===
          'ranking-runtime'

            ? 'ranking'

            : runtimeRole ===
              'sidebar-runtime'

                ? 'navigation'

                : runtimeRole ===
                  'finder-runtime'

                    ? 'intent-routing'

                    : 'entity'
    )

  // ==========================================================================
  // Observatory Layer
  // ==========================================================================

  const observatory =

    safePayload?.observatory

    || (

      runtimeRole ===
      'continuation-runtime'

        ? 'semantic-traversal-runtime'

        : runtimeRole ===
          'ranking-runtime'

            ? 'semantic-ranking-runtime'

            : runtimeRole ===
              'finder-runtime'

                ? 'semantic-finder-runtime'

                : 'semantic-runtime-observatory'
    )

  // ==========================================================================
  // Runtime Flags
  // ==========================================================================

  const hasSemanticRuntime =

    !!safePayload?.semantic_runtime

  const hasAdaptiveRuntime =

    !!safePayload?.adaptive_runtime

  const hasTraversalEdges =

    Array.isArray(
      safePayload?.traversal_edges
    )

  const hasTraversalGraph =

    Array.isArray(
      safePayload?.traversal_graph
    )

  // ==========================================================================
  // Runtime Debug
  // ==========================================================================

  console.log(

    '🌌 NORMALIZED RUNTIME PAYLOAD',

    {

      runtimeRole,

      topologyLayer,

      observatory,

      endpoint,

      payloadKeys:
        payloadKeys.length,

      payloadSize,

      hasSemanticRuntime,

      hasAdaptiveRuntime,

      hasTraversalEdges,

      hasTraversalGraph,
    }
  )

  // ==========================================================================
  // Canonical Runtime Return
  // ==========================================================================

  return {

    // ==============================================================
    // Runtime Transport
    // ==============================================================

    runtime: true,

    endpoint:

      endpoint
      || null,

    transport_success: true,

    fetched_at:

      new Date()
        .toISOString(),

    duration_ms:

      duration
      || 0,

    payload_size:

      payloadSize,

    payload_type:

      typeof safePayload,

    payload_keys:

      payloadKeys.length,

    // ==============================================================
    // Runtime Identity
    // ==============================================================

    runtime_role:

      runtimeRole,

    topology_layer:

      topologyLayer,

    observatory,

    semantic_schema_version:

      safePayload
        ?.semantic_schema_version

      || safePayload
        ?.semantic_runtime

      || null,

    semantic_authority:

      safePayload
        ?.semantic_authority

      || 'backend',

    // ==============================================================
    // Runtime Flags
    // ==============================================================

    has_semantic_runtime:

      hasSemanticRuntime,

    has_adaptive_runtime:

      hasAdaptiveRuntime,

    has_traversal_edges:

      hasTraversalEdges,

    has_traversal_graph:

      hasTraversalGraph,

    // ==============================================================
    // Canonical Runtime Flattening
    // ==============================================================

    semantic_runtime:

      safePayload
        ?.semantic_runtime

      || null,

    adaptive_runtime:

      safePayload
        ?.adaptive_runtime

      || null,

    workflow_runtime:

      safePayload
        ?.workflow_runtime

      || null,

    semantic_labels:

      safePayload
        ?.semantic_labels

      || [],

    semantic_graph:

      safePayload
        ?.semantic_graph

      || [],

    grouped_attributes:

      safePayload
        ?.grouped_attributes

      || {},

    frontend_contract:

      safePayload
        ?.frontend_contract

      || null,

    runtime_profile:

      safePayload
        ?.runtime_profile

      || null,

    traversal_edges:

      Array.isArray(
        safePayload?.traversal_edges
      )

        ? safePayload.traversal_edges

        : [],

    traversal_graph:

      Array.isArray(
        safePayload?.traversal_graph
      )

        ? safePayload.traversal_graph

        : [],

    related_products:

      Array.isArray(
        safePayload?.related_products
      )

        ? safePayload.related_products

        : [],

    // ==============================================================
    // Raw Payload Preservation
    // ==============================================================

    raw_payload:

      safePayload,
  }
}

