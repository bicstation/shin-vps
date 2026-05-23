// ============================================================================
// FILE:
// /shared/lib/api/django/pc/discover/index.ts
// Copyright (c) 2024 Shin Corporation. All rights reserved.
// ============================================================================

/**
 * SHIN CORE LINX
 * Discover Continuity Exports
 *
 * IMPORTANT:
 *
 * This layer exists for:
 *
 * discover continuity exposure
 *
 * NOT:
 *
 * semantic authority generation
 *
 * Responsibilities:
 *
 * - discover module exposure
 * - continuity-safe exports
 * - unified discover access
 * - runtime-safe discover aggregation
 *
 * IMPORTANT:
 *
 * Backend remains:
 *
 * semantic authority
 *
 * Discover remains:
 *
 * exploration continuity authority
 */

/* ============================================================================
🔥 Contracts
============================================================================ */

export type {

  DiscoverProduct,
  DiscoverCluster,
  DiscoverPath,
  DiscoverRecommendation,
  DiscoverIntent,
  DiscoverRuntime,

} from './contracts'

/* ============================================================================
🔥 Discover Gateway
============================================================================ */

export {

  fetchDiscover,

} from './discover'

export {

  default as fetchDiscoverRuntime,

} from './discover'

/* ============================================================================
🔥 Normalize
============================================================================ */

export {

  normalizeDiscoverRuntime,

} from './normalize'

export {

  default as normalizeDiscover,

} from './normalize'

/* ============================================================================
🔥 Runtime
============================================================================ */

export {

  createDiscoverRuntime,

} from './runtime'

export {

  default as discoverRuntime,

} from './runtime'

/* ============================================================================
🔥 Clusters
============================================================================ */

export {

  normalizeDiscoverClusters,

} from './clusters'

export {

  default as discoverClusters,

} from './clusters'

/* ============================================================================
🔥 Intent
============================================================================ */

export {

  normalizeDiscoverIntents,

} from './intent'

export {

  default as discoverIntent,

} from './intent'

/* ============================================================================
🔥 Recommendations
============================================================================ */

export {

  normalizeDiscoverRecommendations,

} from './recommendations'

export {

  default as discoverRecommendations,

} from './recommendations'

/* ============================================================================
🔥 Semantic Paths
============================================================================ */

export {

  normalizeSemanticPaths,

} from './semanticPaths'

export {

  default as semanticPaths,

} from './semanticPaths'

/* ============================================================================
🔥 Topology
============================================================================ */

export type {

  DiscoverTopologyNode,
  DiscoverTopologyEdge,
  DiscoverTopologyRuntime,

} from './topology'

export {

  createDiscoverTopology,

} from './topology'

export {

  default as discoverTopology,

} from './topology'

/* ============================================================================
🔥 Traversal
============================================================================ */

export type {

  DiscoverTraversalStep,
  DiscoverTraversalRuntime,

} from './traversal'

export {

  normalizeDiscoverTraversal,

} from './traversal'

export {

  default as discoverTraversal,

} from './traversal'

/* ============================================================================
🔥 Observatory
============================================================================ */

export type {

  DiscoverObservatoryReport,

} from './observatory'

export {

  inspectDiscoverRuntime,

} from './observatory'

export {

  default as discoverObservatory,

} from './observatory'