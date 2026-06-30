// ============================================================================
// FILE:
// /app/ranking/[slug]/types/contracts.ts
// Copyright (c) 2026 Shin Corporation.
// All rights reserved.
// ============================================================================

/**
 * ============================================================================
 * SHIN CORE LINX
 * Ranking Experience Contract Gateway
 * ============================================================================
 *
 * Constitution
 *
 * Backend Reality
 *      │
 *      ▼
 * Adapter Canonical Contract
 *      │
 *      ▼
 * Ranking Experience
 *
 * ----------------------------------------------------------------------------
 * Responsibilities
 * ----------------------------------------------------------------------------
 *
 * • This file defines NO contracts.
 * • This file defines NO runtime.
 * • This file defines NO semantic meaning.
 *
 * It simply exposes the canonical Adapter contracts
 * to the Ranking Experience.
 *
 * Backend remains the Semantic Authority.
 * Frontend remains the Experience Authority.
 *
 * ============================================================================
 */

/* ============================================================================
🔥 Canonical Adapter Contracts
============================================================================ */

export type {

    RankingMeaning,

    RankingPresentation,

    RankingSEO,

    RankingProduct,

    RankingData,

    SemanticRankingRuntime,

} from '@/shared/lib/api/django/pc/ranking/contracts'