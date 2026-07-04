// ============================================================================
// FILE:
// /shared/lib/api/django/pc/ranking/composition.ts
// Copyright (c) 2026 Shin Corporation.
// ============================================================================

/**
 * ============================================================================
 * SHIN CORE LINX
 * Ranking Runtime Composition
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
 * - Runtime Projection
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

} from '../navigation/contracts'

import type {

    SemanticRankingRuntime,

} from './contracts'

/* ============================================================================
🔥 Experience Runtime
============================================================================ */

export interface RankingExperienceRuntime {

    navigation: NavigationRuntime

    ranking: SemanticRankingRuntime

}

/* ============================================================================
🔥 Runtime Composition
============================================================================ */

export function composeRankingRuntime(

    navigation: NavigationRuntime,

    ranking: SemanticRankingRuntime,

): RankingExperienceRuntime {

    return {

        navigation,

        ranking,

    }

}

/* ============================================================================
🔥 Alias
============================================================================ */

export const composeRankingExperienceRuntime =

    composeRankingRuntime

/* ============================================================================
🔥 Default Export
============================================================================ */

export default composeRankingRuntime