// ============================================================================
// FILE:
// /shared/lib/api/django/pc/discover-detail/composition.ts
// Copyright (c) 2026 Shin Corporation.
// All rights reserved.
// ============================================================================

/**
 * ============================================================================
 * SHIN CORE LINX
 * Discover Detail Runtime Composition
 * ============================================================================
 *
 * Responsibilities
 *
 * - Runtime Composition
 *
 * NOT
 *
 * - Runtime Fetch
 * - Runtime Normalize
 * - UI Projection
 * - Semantic Authority
 *
 * Backend remains:
 *
 * Semantic Authority
 *
 * Adapter remains:
 *
 * Runtime Composition Authority
 *
 * ============================================================================
 */

import type {

    DiscoverDetailRuntime,

} from './contracts'

/* ============================================================================
🔥 Experience Runtime
============================================================================ */

export interface DiscoverDetailExperienceRuntime {

    discover: DiscoverDetailRuntime

}

/* ============================================================================
🔥 Runtime Composition
============================================================================ */

export function composeDiscoverDetailRuntime(

    discover: DiscoverDetailRuntime,

): DiscoverDetailExperienceRuntime {

    return {

        discover,

    }

}

/* ============================================================================
🔥 Alias
============================================================================ */

export const composeDiscoverExperienceRuntime =

    composeDiscoverDetailRuntime

/* ============================================================================
🔥 Default Export
============================================================================ */

export default composeDiscoverDetailRuntime