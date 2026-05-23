// ============================================================================
// FILE:
// /shared/lib/api/django/pc/discover/topology.ts
// Copyright (c) 2024 Shin Corporation. All rights reserved.
// ============================================================================

/**
 * SHIN CORE LINX
 * Discover Topology Continuity
 *
 * IMPORTANT:
 *
 * This layer exists for:
 *
 * semantic exploration topology continuity
 *
 * NOT:
 *
 * semantic meaning generation
 *
 * Responsibilities:
 *
 * - topology continuity stabilization
 * - semantic graph normalization
 * - exploration relationship continuity
 * - cluster/path coherence
 * - frontend-safe topology exposure
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

import type {

  DiscoverCluster,
  DiscoverPath,

} from './contracts'

/* ============================================================================
🔥 Discover Topology Node
============================================================================ */

export type DiscoverTopologyNode = {

  id?: string

  type?: string

  title?: string

  slug?: string

  semantic_weight?: number

  workflow_tags?: string[]

  grouped_attributes?: Record<string, any>

  connections?: string[]

  raw?: any
}

/* ============================================================================
🔥 Discover Topology Edge
============================================================================ */

export type DiscoverTopologyEdge = {

  source?: string

  target?: string

  relation?: string

  semantic_weight?: number

  traversal_type?: string

  raw?: any
}

/* ============================================================================
🔥 Discover Topology Runtime
============================================================================ */

export type DiscoverTopologyRuntime = {

  nodes: DiscoverTopologyNode[]

  edges: DiscoverTopologyEdge[]

  continuity_status?: string

  topology_source?: string

  raw?: any
}

/* ============================================================================
🔥 Normalize Nodes
============================================================================ */

function normalizeTopologyNodes(

  payload?: any

): DiscoverTopologyNode[] {

  // ======================================
  // Topology Absorption
  // ======================================

  const rawNodes =

    Array.isArray(
      payload?.nodes
    )

      ? payload.nodes

    : Array.isArray(
        payload?.topology_nodes
      )

        ? payload.topology_nodes

    : Array.isArray(
        payload?.semantic_graph
      )

        ? payload.semantic_graph

    : []

  // ======================================
  // Normalize
  // ======================================

  return rawNodes.map(
    (
      node
    ): DiscoverTopologyNode => ({

      id:
        node?.id || '',

      type:
        node?.type || '',

      title:
        node?.title || '',

      slug:
        node?.slug || '',

      semantic_weight:
        node?.semantic_weight || 0,

      workflow_tags:

        Array.isArray(
          node?.workflow_tags
        )

          ? node.workflow_tags

          : [],

      grouped_attributes:
        node?.grouped_attributes || {},

      connections:

        Array.isArray(
          node?.connections
        )

          ? node.connections

          : [],

      raw:
        node,
    })
  )
}

/* ============================================================================
🔥 Normalize Edges
============================================================================ */

function normalizeTopologyEdges(

  payload?: any

): DiscoverTopologyEdge[] {

  // ======================================
  // Topology Absorption
  // ======================================

  const rawEdges =

    Array.isArray(
      payload?.edges
    )

      ? payload.edges

    : Array.isArray(
        payload?.topology_edges
      )

        ? payload.topology_edges

    : Array.isArray(
        payload?.semantic_relationships
      )

        ? payload.semantic_relationships

    : []

  // ======================================
  // Normalize
  // ======================================

  return rawEdges.map(
    (
      edge
    ): DiscoverTopologyEdge => ({

      source:
        edge?.source || '',

      target:
        edge?.target || '',

      relation:
        edge?.relation || '',

      semantic_weight:
        edge?.semantic_weight || 0,

      traversal_type:
        edge?.traversal_type || '',

      raw:
        edge,
    })
  )
}

/* ============================================================================
🔥 Build Cluster Nodes
============================================================================ */

function buildClusterNodes(

  clusters?: DiscoverCluster[]

): DiscoverTopologyNode[] {

  // ======================================
  // Safe Array
  // ======================================

  const safeClusters =

    Array.isArray(clusters)

      ? clusters

      : []

  // ======================================
  // Normalize
  // ======================================

  return safeClusters.map(
    (
      cluster
    ): DiscoverTopologyNode => ({

      id:
        cluster?.id || '',

      type:
        'cluster',

      title:
        cluster?.title || '',

      slug:
        cluster?.slug || '',

      semantic_weight:
        cluster?.semantic_weight || 0,

      workflow_tags:
        cluster?.workflow_tags || [],

      grouped_attributes:
        cluster?.grouped_attributes || {},

      connections:

        Array.isArray(
          cluster?.products
        )

          ? cluster.products.map(
              (
                product
              ) => product?.unique_id || ''
            )

          : [],

      raw:
        cluster,
    })
  )
}

/* ============================================================================
🔥 Build Path Nodes
============================================================================ */

function buildPathNodes(

  paths?: DiscoverPath[]

): DiscoverTopologyNode[] {

  // ======================================
  // Safe Array
  // ======================================

  const safePaths =

    Array.isArray(paths)

      ? paths

      : []

  // ======================================
  // Normalize
  // ======================================

  return safePaths.map(
    (
      path
    ): DiscoverTopologyNode => ({

      id:
        path?.id || '',

      type:
        'path',

      title:
        path?.title || '',

      slug:
        path?.slug || '',

      semantic_weight:
        0,

      workflow_tags:
        path?.workflow_tags || [],

      grouped_attributes:
        {},

      connections:

        Array.isArray(
          path?.semantic_route
        )

          ? path.semantic_route

          : [],

      raw:
        path,
    })
  )
}

/* ============================================================================
🔥 Create Discover Topology Runtime
============================================================================ */

export function createDiscoverTopology(

  payload?: any,

  clusters?: DiscoverCluster[],

  paths?: DiscoverPath[],

): DiscoverTopologyRuntime {

  // ======================================
  // Base Topology
  // ======================================

  const nodes =
    normalizeTopologyNodes(payload)

  const edges =
    normalizeTopologyEdges(payload)

  // ======================================
  // Discover Continuity Nodes
  // ======================================

  const clusterNodes =
    buildClusterNodes(clusters)

  const pathNodes =
    buildPathNodes(paths)

  // ======================================
  // Canonical Runtime
  // ======================================

  const normalizedNodes = [

    ...nodes,

    ...clusterNodes,

    ...pathNodes,
  ]

  // ======================================
  // Observatory
  // ======================================

  console.log(
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
  )

  console.log(
    '🔥 DISCOVER TOPOLOGY'
  )

  console.log({

    nodes:
      normalizedNodes.length,

    edges:
      edges.length,

    clusters:
      clusterNodes.length,

    paths:
      pathNodes.length,
  })

  console.log(
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
  )

  // ======================================
  // Return
  // ======================================

  return {

    nodes:
      normalizedNodes,

    edges,

    continuity_status:
      'topology-normalized',

    topology_source:
      'discover-topology',

    raw:
      payload,
  }
}

/* ============================================================================
🔥 Default Export
============================================================================ */

export default createDiscoverTopology