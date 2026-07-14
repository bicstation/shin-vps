// ============================================================================
// FILE:
// /shared/lib/api/django/pc/products/index.ts
// Copyright (c) 2026 Shin Corporation.
// All rights reserved.
// ============================================================================

/**
 * ============================================================================
 * SHIN CORE LINX
 * Products Adapter Layer
 * ============================================================================
 *
 * PURPOSE
 *
 * Canonical Products Adapter
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
 * IMPORTANT
 *
 * Products does NOT require Runtime Composition.
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

export * from './products'

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
🔥 Legacy Compatibility
============================================================================ */

import {

    fetchProducts,

} from './products'

export const fetchPCProducts =

    fetchProducts

/* ============================================================================
🔥 Observatory
============================================================================ */

console.log(
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
)

console.log(
    '🔥 PRODUCTS ADAPTER INITIALIZED'
)

console.log({

    runtime: 'products',

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