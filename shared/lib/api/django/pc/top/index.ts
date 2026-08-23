// ============================================================================
// FILE:
// /home/maya/shin-vps/shared/lib/api/django/pc/top/index.ts
// Copyright (c) 2026 Shin Corporation.
// All rights reserved.
// ============================================================================

/**
 * ============================================================================
 * SHIN CORE LINX
 * Semantic Top Runtime Adapter
 * ============================================================================
 *
 * PURPOSE
 *
 * Public Surface for the Top Adapter.
 *
 * Backend
 *      ↓
 * Gateway
 *      ↓
 * Normalize
 *      ↓
 * Projection
 *      ↓
 * Runtime
 *      ↓
 * Frontend Experience
 *
 * Backend remains:
 *
 * Semantic Authority
 * Reality Authority
 *
 * Adapter remains:
 *
 * Translation Authority
 *
 * Frontend remains:
 *
 * Experience Authority
 *
 * ============================================================================
 */

/* ============================================================================
🔥 Contracts
============================================================================ */

export {

  type TopRuntimeContract,

  type TopMeaning,

  type TopPresentation,

  type TopSEO,

  type TopStats,

  type TopFeaturedGroup,

  type TopFeaturedProduct,

  type TopData,

  type TopRuntime,

  type TopRuntimeResponse,

} from './contracts'

/* ============================================================================
🔥 Gateway
============================================================================ */

export {

  fetchTopRuntime,

  fetchTop,

} from './gateway'

/* ============================================================================
🔥 Normalize
============================================================================ */

export {

  normalizeTopRuntime,

} from './normalize'

/* ============================================================================
🔥 Projection
============================================================================ */

export {

  projectTopRuntime,

  projectTop,

} from './projection'

export type {

  ProjectedTopRuntime,

  ProjectedTopFeaturedGroup,

  ProjectedTopFeaturedProduct,

} from './projection'

/* ============================================================================
🔥 Runtime
============================================================================ */

export {

  getTopRuntime,

  fetchProjectedTopRuntime,

} from './runtime'