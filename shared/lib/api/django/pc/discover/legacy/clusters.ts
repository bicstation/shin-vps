// ============================================================================
// FILE:
// /home/maya/shin-vps/shared/lib/api/django/pc/discover/clusters.ts
// Copyright (c) 2024 Shin Corporation.
// All rights reserved.
// ============================================================================

/* ============================================================================
🔥 Contracts
============================================================================ */

export interface DiscoverCluster {

  slug?: string

  name?: string

  title?: string

  description?: string

  icon?: string

  color?: string

  product_count?: number

  [key: string]: any
}

/* ============================================================================
🔥 Normalize Discover Clusters
============================================================================ */

export function normalizeDiscoverClusters(

  payload?: any

): DiscoverCluster[] {

  const source =

    payload
    ?? {}

  const clusters =

    Array.isArray(
      source?.clusters
    )

      ? source.clusters

      : Array.isArray(
          source?.featured_groups
        )

          ? source.featured_groups

          : []

  console.log(
    '🔥 DISCOVER CLUSTERS',
    {

      count:
        clusters.length,

      sample:
        clusters?.[0],
    }
  )

  return clusters
}

/* ============================================================================
🔥 Default Export
============================================================================ */

export default normalizeDiscoverClusters