// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/[slug]/types/contracts.ts
// Copyright (c) 2024 Shin Corporation.
// All rights reserved.
// ============================================================================

/**
 * ============================================================================
 * SHIN CORE LINX
 * Ranking Experience V2 Contracts
 * ============================================================================
 *
 * Experience Layer Contract Gateway
 *
 * Backend
 *      ↓
 * Adapter
 *      ↓
 * Experience
 *
 * This file MUST NOT define runtime contracts.
 * It only re-exports Adapter contracts.
 */

/* ============================================================================
🔥 Adapter Contracts
============================================================================ */

export type {

    SemanticAttribute,

    SemanticRuntime,

    AdaptiveRuntime,

    RankingMeaning,

    PresentationRuntime,

    RankingRuntime,

    RankingProduct,

    RankingCollection,

    RankingSEO,

    SemanticRankingRuntime,

} from '@/shared/lib/api/django/pc/ranking/contracts'