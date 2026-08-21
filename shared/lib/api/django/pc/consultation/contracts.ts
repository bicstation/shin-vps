// ============================================================================
// FILE:
// /shared/lib/api/django/pc/consultation/contracts.ts
// Copyright (c) 2026 Shin Corporation.
// All rights reserved.
// ============================================================================

/**
 * ============================================================================
 * SHIN CORE LINX
 * PC Consultation Runtime Contracts
 * ============================================================================
 *
 * PURPOSE
 *
 * Defines the canonical TypeScript contract that represents the
 * Backend Consultation Runtime JSON.
 *
 * Backend remains:
 *
 * Semantic Authority
 * Reality Authority
 *
 * Adapter remains:
 *
 * Translation Authority
 *
 * This contract mirrors Backend Runtime Reality.
 *
 * It does NOT:
 *
 * ✗ Generate Semantic Meaning
 * ✗ Resolve Requirements
 * ✗ Rebuild Finder Logic
 * ✗ Optimize Candidates
 * ✗ Generate UI Meaning
 *
 * ============================================================================
 */

/* ============================================================================
🔥 Consultation Request
============================================================================ */

export interface ConsultationRequest {

    /**
     * Natural Language User Input
     *
     * Example:
     *
     * 持ち運べるノートPCでゲームもしたい
     */

    message: string

}

/* ============================================================================
🔥 Consultation Meaning
============================================================================ */

export interface ConsultationMeaning {

    identity?: string

    mission?: string

    user_intent?: string

    meaning_statement?: string

    existence_reason?: string

}

/* ============================================================================
🔥 Consultation Presentation
============================================================================ */

export interface ConsultationPresentation {

    title?: string

    subtitle?: string

    description?: string

}

/* ============================================================================
🔥 Consultation SEO
============================================================================ */

export interface ConsultationSEO {

    title?: string

    description?: string

    keywords?: string[]

    canonical?: string

    schema_jsonld?: any

    open_graph?: any

    twitter?: any

}

/* ============================================================================
🔥 Consultation Query
============================================================================ */

export interface ConsultationQuery {

    selected_groups: string[]

    selected_attributes: string[]

    filters: string[]

    max_price?: number | null

    /**
     * Future Backend Runtime Extensions
     *
     * Adapter SHALL preserve unknown query fields.
     */

    [key: string]: any

}

/* ============================================================================
🔥 Consultation Summary
============================================================================ */

export interface ConsultationSummary {

    group_count: number

    attribute_count: number

    filter_count: number

    result_count: number

    has_result: boolean

}

/* ============================================================================
🔥 Consultation Product
============================================================================ */

export interface ConsultationProduct {

    score: number

    product_id: number

    unique_id: string

    name: string

    maker: string

    price: number

    image_url: string

    cpu_model?: string | null

    gpu_model?: string | null

    memory_gb?: number | null

    storage_gb?: number | null

    display_info?: string | null

    is_ai_pc?: boolean

    semantic_attributes: string[]

    matched_groups: string[]

    reality_scores?: Record<string, number>

    product_type?: string | null

    primary_workflow?: string | null

    workflow_score?: number

    semantic_score?: number

    workflow_tags?: string[]

    workflows?: any[]

    semantic_labels?: string[]

    adaptive_runtime?: Record<string, any>

    semantic_version?: string | null

    semantic_authority?: string | null

    runtime_valid?: boolean

}

/* ============================================================================
🔥 Consultation Data
============================================================================ */

export interface ConsultationData {

    query: ConsultationQuery

    summary: ConsultationSummary

    products: ConsultationProduct[]

}

/* ============================================================================
🔥 Consultation Runtime Contract
============================================================================ */

export interface ConsultationRuntimeContract {

    /* ------------------------------------------------------------------------
    Backend Meaning
    ------------------------------------------------------------------------ */

    meaning?: ConsultationMeaning

    /* ------------------------------------------------------------------------
    Backend Presentation
    ------------------------------------------------------------------------ */

    presentation?: ConsultationPresentation

    /* ------------------------------------------------------------------------
    Backend SEO
    ------------------------------------------------------------------------ */

    seo?: ConsultationSEO

    /* ------------------------------------------------------------------------
    Backend Data
    ------------------------------------------------------------------------ */

    data: ConsultationData

    /* ------------------------------------------------------------------------
    Backend Authority
    ------------------------------------------------------------------------ */

    semantic_schema_version?: number

    authority_version?: string

    semantic_authority?: string

    ready?: boolean

}

/* ============================================================================
🔥 Legacy Compatibility
============================================================================ */

export type ConsultationRuntime =
    ConsultationRuntimeContract

export type ConsultationRuntimeResponse =
    ConsultationRuntimeContract