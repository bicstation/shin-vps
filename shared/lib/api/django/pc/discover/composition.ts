// ============================================================================
// FILE:
// /shared/lib/api/django/pc/discover/composition.ts
// Copyright (c) 2026 Shin Corporation.
// All rights reserved.
// ============================================================================

/**
 * ============================================================================
 * SHIN CORE LINX
 * Discover Composition Layer
 * ============================================================================
 *
 * PURPOSE
 *
 * Light composition between:
 *
 * - Navigation Runtime (context)
 * - Discover Runtime (content)
 *
 * IMPORTANT
 *
 * This layer is OPTIONAL.
 *
 * It exists only to provide
 * cross-domain context merging.
 *
 * Backend remains:
 *
 * Semantic Authority
 *
 * Adapter remains:
 *
 * Composition Authority
 *
 * ============================================================================
 */

import type {
    NavigationRuntimeContract,
} from '../navigation/contracts'

import type {
    DiscoverRuntimeContract,
} from './contracts'

/* ============================================================================
🔥 Composition Result
============================================================================ */

export interface DiscoverExperienceRuntime {

    navigation: NavigationRuntimeContract

    discover: DiscoverRuntimeContract

}

/* ============================================================================
🔥 Compose Discover Runtime
============================================================================ */

export function composeDiscoverRuntime(

    navigation: NavigationRuntimeContract,
    discover: DiscoverRuntimeContract,

): DiscoverExperienceRuntime {

    return {

        navigation,

        discover,

    }

}

/* ============================================================================
🔥 Legacy Compatibility
============================================================================ */

export const composeDiscoverExperienceRuntime =
    composeDiscoverRuntime

/* ============================================================================
🔥 Default Export
============================================================================ */

export default composeDiscoverRuntime