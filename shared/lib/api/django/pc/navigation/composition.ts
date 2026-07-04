// ============================================================================
// FILE:
// /shared/lib/api/django/pc/navigation/composition.ts
// Copyright (c) 2026 Shin Corporation.
// All rights reserved.
// ============================================================================

/**
 * ============================================================================
 * SHIN CORE LINX
 * Navigation Runtime Composition
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

    NavigationRuntime,

} from './contracts'

/* ============================================================================
🔥 Experience Runtime
============================================================================ */

export interface NavigationExperienceRuntime {

    navigation: NavigationRuntime

}

/* ============================================================================
🔥 Runtime Composition
============================================================================ */

export function composeNavigationRuntime(

    navigation: NavigationRuntime,

): NavigationExperienceRuntime {

    return {

        navigation,

    }

}

/* ============================================================================
🔥 Alias
============================================================================ */

export const composeNavigationExperienceRuntime =

    composeNavigationRuntime

/* ============================================================================
🔥 Default Export
============================================================================ */

export default composeNavigationRuntime