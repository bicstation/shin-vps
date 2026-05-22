// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/next-bicstation/app/test/runtime/runtime/normalizeRuntimePayload.ts
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
 * - semantic payload flattening
 * - traversal continuity preservation
 * - inspector-safe runtime composition
 * - observability-safe payload exposure
 *
 * IMPORTANT:
 *
 * Backend remains semantic authority.
 *
 * Frontend acts as runtime adapter layer only.
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
  // Canonical Runtime Payload
  // ==========================================================================

  /**
   * IMPORTANT:
   *
   * Some runtime pipelines return:
   *
   * payload.payload
   *
   * while others return:
   *
   * raw_payload.payload
   *
   * This canonical adapter layer normalizes both.
   */

  const runtimePayload =

    safePayload?.payload

    || safePayload?.raw_payload?.payload

    || safePayload

  // ==========================================================================
  // Runtime Metadata
  // ==========================================================================

  const payloadKeys =

    Object.keys(
      runtimePayload || {}
    )

  const payloadSize =

    JSON.stringify(
      runtimePayload || {}
    ).length

  // ==========================================================================
  // Canonical Runtime Identity
  // ==========================================================================

  const runtimeRole =

    runtimePayload?.runtime_role
    || safePayload?.runtime_role
    || 'unknown-runtime'

  const topologyLayer =

    runtimePayload?.topology_layer
    || safePayload?.topology_layer
    || 'entity'

  const observatory =

    runtimePayload?.observatory
    || safePayload?.observatory
    || 'semantic-runtime-observatory'

  // ==========================================================================
  // Runtime Flags
  // ==========================================================================

  const hasSemanticRuntime =

    !!runtimePayload?.semantic_runtime

  const hasAdaptiveRuntime =

    !!runtimePayload?.adaptive_runtime

  const hasTraversalEdges =

    Array.isArray(
      runtimePayload?.traversal_edges
    )

  const hasTraversalGraph =

    Array.isArray(
      runtimePayload?.traversal_graph
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

      traversalEdges:

        runtimePayload
          ?.traversal_edges
          ?.length || 0,

      traversalGraph:

        runtimePayload
          ?.traversal_graph
          ?.length || 0,
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

      typeof runtimePayload,

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

      runtimePayload
        ?.semantic_schema_version

      || null,

    semantic_authority:

      runtimePayload
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
    // Semantic Runtime
    // ==============================================================

    semantic_runtime:

      runtimePayload
        ?.semantic_runtime

      || runtimePayload
        ?.traversal_runtime

      || null,

    adaptive_runtime:

      runtimePayload
        ?.adaptive_runtime

      || null,

    workflow_runtime:

      runtimePayload
        ?.workflow_runtime

      || runtimePayload
        ?.continuation_runtime

      || null,

    semantic_labels:

      runtimePayload
        ?.semantic_labels

      || [],

    semantic_graph:

      runtimePayload
        ?.semantic_graph

      || [],

    grouped_attributes:

      runtimePayload
        ?.grouped_attributes

      || {},

    frontend_contract:

      runtimePayload
        ?.frontend_contract

      || null,

    runtime_profile:

      runtimePayload
        ?.runtime_profile

      || null,

    // ==============================================================
    // Traversal Runtime
    // ==============================================================

    traversal_edges:

      Array.isArray(
        runtimePayload?.traversal_edges
      )

        ? runtimePayload.traversal_edges

        : [],

    traversal_graph:

      Array.isArray(
        runtimePayload?.traversal_graph
      )

        ? runtimePayload.traversal_graph

        : [],

    related_products:

      Array.isArray(
        runtimePayload?.related_products
      )

        ? runtimePayload.related_products

        : [],

    // ==============================================================
    // Raw Payload Preservation
    // ==============================================================

    raw_payload:

      safePayload,
  }
}