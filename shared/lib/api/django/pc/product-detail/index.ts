// ============================================================================
// FILE:
// /shared/lib/api/django/pc/product-detail/index.ts
// Copyright (c) 2026 Shin Corporation.
// All rights reserved.
// ============================================================================

/**
 * ============================================================================
 * SHIN CORE LINX
 * Product Detail Adapter Layer
 * ============================================================================
 *
 * PURPOSE
 *
 * Canonical Product Detail Adapter
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
 * Product Detail does NOT require Runtime Composition.
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

export * from './detail'

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

    fetchProductDetail,

} from './detail'

export const fetchProduct =

    fetchProductDetail

/* ============================================================================
🔥 Observatory
============================================================================ */

console.log(
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
)

console.log(
    '🔥 PRODUCT DETAIL ADAPTER INITIALIZED'
)

console.log({

    runtime: 'product-detail',

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