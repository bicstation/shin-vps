// ============================================================================
// FILE:
// /shared/lib/api/django/pc/navigation/index.ts
// Copyright (c) 2026 Shin Corporation.
// All rights reserved.
// ============================================================================

/**
 * ============================================================================
 * SHIN CORE LINX
 * Navigation Adapter Layer
 * ============================================================================
 *
 * PURPOSE
 *
 * Canonical Navigation Adapter
 *
 * Backend
 *      ↓
 * Gateway
 *      ↓
 * Normalize
 *      ↓
 * Projection
 *      ↓
 * Frontend Experience
 *
 * Backend remains:
 *
 * Semantic Authority
 *
 * Adapter remains:
 *
 * Translation Authority
 *
 * Frontend remains:
 *
 * Experience Authority
 *
 * IMPORTANT
 *
 * Navigation does NOT require Runtime Composition.
 *
 * ============================================================================
 */

/* ============================================================================
🔥 Contracts
============================================================================ */

export * from './contracts'

/* ============================================================================
🔥 Gateway
============================================================================ */

export * from './navigation'

/* ============================================================================
🔥 Normalize
============================================================================ */

export * from './normalize'

/* ============================================================================
🔥 Projection
============================================================================ */

export * from './projection'

/* ============================================================================
🔥 Runtime Facade (Migration Compatibility)
============================================================================ */

export * from './runtime'

/* ============================================================================
🔥 Observatory
============================================================================ */

console.log(
  '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
)

console.log(
  '🔥 NAVIGATION ADAPTER INITIALIZED'
)

console.log({

  runtime: 'navigation',

  authority: 'backend',

  transport: true,

  normalize: true,

  projection: true,

  composition: false,

  observability: true,

  continuity: 'healthy',

})

console.log(
  '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
)