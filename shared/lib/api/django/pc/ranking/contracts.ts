// ============================================================================
// FILE:
// shared/lib/api/django/pc/ranking/contracts.ts
// Copyright (c) 2026 Shin Corporation.
// All rights reserved.
// ============================================================================

/**
 * ============================================================================
 * SHIN CORE LINX
 * Ranking Backend Contract
 * ============================================================================
 *
 * PURPOSE
 *
 * Defines the canonical TypeScript contract that represents the
 * Backend Ranking API.
 *
 * This file mirrors Backend Reality.
 *
 * It does NOT define:
 *
 * ✗ Frontend UI
 * ✗ Projection Models
 * ✗ Runtime Helpers
 * ✗ Future Architecture
 *
 * Backend remains:
 *
 * Semantic Authority
 *
 * Adapter remains:
 *
 * Translation Authority
 *
 * ============================================================================
 */

/* ============================================================================
🔥 Meaning
============================================================================ */

export interface RankingMeaning {

    identity?: string

    mission?: string

    user_intent?: string

    meaning_statement?: string

    existence_reason?: string

}

/* ============================================================================
🔥 Presentation
============================================================================ */

export interface RankingPresentation {

    slug?: string

    name?: string

    title?: string

    subtitle?: string

    description?: string

}

/* ============================================================================
🔥 SEO
============================================================================ */

export interface RankingSEO {

    title?: string

    description?: string

    keywords?: string[]

    canonical?: string

    schema_jsonld?: any

}

/* ============================================================================
🔥 Category Group
============================================================================ */

export interface RankingCategoryGroup {

    group_slug: string

    group_name: string

    presentation_name?: string

    presentation_description?: string

    icon?: string

    color?: string

    sort_order?: string | number

    product_count?: number

}

/* ============================================================================
🔥 Category
============================================================================ */

export interface RankingCategory {

    parent_group: string

    presentation_name: string

    group_count: number

    groups: RankingCategoryGroup[]

}

/* ============================================================================
🔥 Product
============================================================================ */

export interface RankingProduct {

    product_id: number

    unique_id: string

    name: string

    maker: string

    price: number

    image_url: string

    semantic_attributes: string[]

    matched_groups: string[]

    reality_scores?: Record<string, number>

    product_type?: string

    primary_workflow?: string | null

    workflow_score?: number

    semantic_score?: number

    workflow_tags?: string[]

    workflows?: any[]

    semantic_labels?: string[]

    adaptive_runtime?: any

    semantic_version?: string

    semantic_authority?: string

    runtime_valid?: boolean

}

/* ============================================================================
🔥 Ranking Data
============================================================================ */

export interface RankingData {

    group_slug: string

    group_name: string

    product_count: number

    products: RankingProduct[]

}

/* ============================================================================
🔥 Summary
============================================================================ */

export interface RankingSummary {

    category_count: number

    product_count: number

}

/* ============================================================================
🔥 Ranking Backend Runtime
============================================================================ */

export interface SemanticRankingRuntime {

    /* ------------------------------------------------------------------------
    Backend Status
    ------------------------------------------------------------------------ */

    success?: boolean

    /* ------------------------------------------------------------------------
    Backend Reality
    ------------------------------------------------------------------------ */

    meaning?: RankingMeaning

    presentation?: RankingPresentation

    seo?: RankingSEO

    categories?: RankingCategory[]

    data: RankingData

    summary?: RankingSummary

    /* ------------------------------------------------------------------------
    Backend Authority
    ------------------------------------------------------------------------ */

    semantic_schema_version?: number

    authority_version?: string

    semantic_authority?: string

    ready?: boolean

    /* ------------------------------------------------------------------------
    Raw Backup
    ------------------------------------------------------------------------ */

    raw?: any

}

/* ============================================================================
🔥 Legacy Compatibility
============================================================================ */

export type RankingRuntime =

    SemanticRankingRuntime

export type RankingRuntimeResponse =

    SemanticRankingRuntime