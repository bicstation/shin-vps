// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/next-bicstation/app/test/runtime/inspectors/contracts/topology.ts
// ============================================================================

/**
 * SHIN CORE LINX
 * Runtime Topology Observatory Contracts
 *
 * IMPORTANT:
 * This file defines:
 *
 * topology observability contracts
 *
 * NOT:
 *
 * topology authority
 *
 * Backend remains:
 *
 * - traversal authority
 * - exploration authority
 * - workflow authority
 * - graph authority
 *
 * Frontend topology contracts exist ONLY for:
 *
 * - topology observability
 * - runtime-safe visualization
 * - exploration rendering
 * - inspector isolation
 */

/* ============================================================================
🔥 Runtime Role
============================================================================ */

export type RuntimeRole =

  | 'product-runtime'
  | 'continuation-runtime'
  | 'ranking-runtime'
  | 'sidebar-runtime'
  | 'discovery-runtime'
  | 'finder-runtime'
  | 'semantic-runtime'

/* ============================================================================
🔥 Topology Layer
============================================================================ */

export type RuntimeTopologyLayer =

  | 'entity'
  | 'continuation'
  | 'ranking'
  | 'navigation'
  | 'discovery'
  | 'intent-routing'
  | 'runtime'

/* ============================================================================
🔥 Runtime Observatory
============================================================================ */

export type RuntimeObservatory =

  | 'semantic-detail-runtime'
  | 'semantic-traversal-runtime'
  | 'semantic-ranking-runtime'
  | 'semantic-sidebar-runtime'
  | 'semantic-discovery-runtime'
  | 'semantic-finder-runtime'
  | 'runtime-observatory'

/* ============================================================================
🔥 Runtime Topology Contract
============================================================================ */

export type RuntimeTopologyContract = {

  runtime_role: RuntimeRole

  topology_layer: RuntimeTopologyLayer

  observatory: RuntimeObservatory

}

/* ============================================================================
🔥 Runtime Endpoint Topology
============================================================================ */

export type RuntimeEndpointTopology = {

  endpoint: string

  canonical: boolean

  topology_depth?: number | null

  traversal_enabled?: boolean

  continuation_enabled?: boolean

}

/* ============================================================================
🔥 Runtime Traversal Topology
============================================================================ */

export type RuntimeTraversalTopology = {

  traversal_layer?: string | null

  traversal_depth?: number | null

  recursive_protection?: boolean

  shallow_payload?: boolean

  continuation_runtime?: boolean

}

/* ============================================================================
🔥 Runtime Exploration Topology
============================================================================ */

export type RuntimeExplorationTopology = {

  exploration_role?: string | null

  workflow_role?: string | null

  continuation_role?: string | null

  discovery_role?: string | null

}

/* ============================================================================
🔥 Runtime Graph Topology
============================================================================ */

export type RuntimeGraphTopology = {

  graph_enabled?: boolean

  graph_role?: string | null

  graph_depth?: number | null

  graph_nodes?: number | null

  graph_edges?: number | null

}

/* ============================================================================
🔥 Runtime Navigation Topology
============================================================================ */

export type RuntimeNavigationTopology = {

  navigation_role?: string | null

  entry_runtime?: boolean

  continuation_runtime?: boolean

  discovery_runtime?: boolean

}

/* ============================================================================
🔥 Runtime Topology Observatory
============================================================================ */

export type RuntimeTopologyObservatory =

  RuntimeTopologyContract
  &

  RuntimeEndpointTopology
  &

  RuntimeTraversalTopology
  &

  RuntimeExplorationTopology
  &

  RuntimeGraphTopology
  &

  RuntimeNavigationTopology

/* ============================================================================
🔥 Topology Inspector Props
============================================================================ */

export type TopologyInspectorProps = {

  runtime: {

    runtime_role?: RuntimeRole

    topology_layer?: RuntimeTopologyLayer

    observatory?: RuntimeObservatory

    endpoint?: string

    payload?: any

  } | null

}

/* ============================================================================
🔥 Runtime Topology Rules
============================================================================ */

/**
 * IMPORTANT:
 *
 * Frontend topology contracts:
 *
 * ❌ must NOT create traversal meaning
 * ❌ must NOT infer exploration structure
 * ❌ must NOT mutate workflow topology
 * ❌ must NOT rewrite graph semantics
 *
 * Allowed:
 *
 * ✅ topology observability
 * ✅ traversal visualization
 * ✅ runtime-safe rendering
 * ✅ exploration rendering
 */

/* ============================================================================
🔥 Default Export
============================================================================ */

export default RuntimeTopologyContract