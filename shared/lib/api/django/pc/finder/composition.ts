// ============================================================================
// FILE:
// /shared/lib/api/django/pc/finder/composition.ts
// Copyright (c) 2026 Shin Corporation.
// All rights reserved.
// ============================================================================

/**
 * ============================================================================
 * SHIN CORE LINX
 * Finder Runtime Composition
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

    FinderRuntimeContract,

} from './contracts'

/* ============================================================================
🔥 Experience Runtime
============================================================================ */

export interface FinderExperienceRuntime {

    finder: FinderRuntimeContract

}

/* ============================================================================
🔥 Runtime Composition
============================================================================ */

export function composeFinderRuntime(

    finder: FinderRuntimeContract,

): FinderExperienceRuntime {

    return {

        finder,

    }

}

/* ============================================================================
🔥 Alias
============================================================================ */

export const composeFinderExperienceRuntime =

    composeFinderRuntime

/* ============================================================================
🔥 Default Export
============================================================================ */

export default composeFinderRuntime