// ============================================================================
// FILE:
// /shared/lib/api/django/pc/product-detail/contracts.ts
// Copyright (c) 2026 Shin Corporation.
// All rights reserved.
// ============================================================================

/**
 * ============================================================================
 * SHIN CORE LINX
 * Product Detail Backend Contract
 * ============================================================================
 *
 * PURPOSE
 *
 * Defines the canonical TypeScript contract that represents the
 * Backend Product Detail JSON.
 *
 * IMPORTANT
 *
 * This contract mirrors Backend Runtime.
 *
 * Adapter MUST NOT:
 *
 * ✗ Generate Meaning
 * ✗ Generate Semantic Meaning
 * ✗ Remove Backend Runtime information
 * ✗ Reinterpret Backend information
 * ✗ Generate Frontend UI meaning
 *
 * Adapter responsibility:
 *
 * Backend Runtime
 *      ↓
 * Transport
 *      ↓
 * Normalize
 *      ↓
 * Projection
 *      ↓
 * Frontend
 *
 * Backend remains:
 *
 * Reality Authority
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

export interface ProductDetailMeaning {

    identity?: string

    mission?: string

    user_intent?: string

    meaning_statement?: string

    existence_reason?: string

}

/* ============================================================================
🔥 SEO
============================================================================ */

export interface ProductDetailSEO {

    title?: string

    description?: string

    keywords?: string[]

    canonical?: string

    schema_jsonld?: any

    open_graph?: any

    twitter?: any

}

/* ============================================================================
🔥 Observation Specification
============================================================================ */

export interface ProductObservationSpecification {

    label?: string

    value?: string

}

/* ============================================================================
🔥 Observation Runtime
============================================================================ */

export interface ProductObservationRuntime {

    source?: string

    source_url?: string

    document_key?: string

    format?: string

    specifications?:
        ProductObservationSpecification[]

    raw_text?: string

}

/* ============================================================================
🔥 Breadcrumb
============================================================================ */

export interface ProductBreadcrumb {

    name: string

    url: string

}

/* ============================================================================
🔥 Related Intent
============================================================================ */

export interface ProductRelatedIntent {

    slug: string

    title: string

    description?: string | null

}

/* ============================================================================
🔥 Product
============================================================================ */

export interface ProductDetail {

    /* ------------------------------------------------------------------------
    Identity
    ------------------------------------------------------------------------ */

    id?: number

    unique_id: string

    site_prefix?: string

    maker?: string

    brand?: string

    series?: string

    collaboration?: string

    model?: string

    product_no?: string

    pc_id?: string

    raw_genre?: string

    unified_genre?: string

    name: string

    product_type?: string

    /* ------------------------------------------------------------------------
    Navigation
    ------------------------------------------------------------------------ */

    breadcrumbs?: ProductBreadcrumb[]

    /* ------------------------------------------------------------------------
    Commercial
    ------------------------------------------------------------------------ */

    price?: number

    url?: string

    affiliate_url?: string

    affiliate_updated_at?: string | null

    stock_status?: string

    is_posted?: boolean

    is_active?: boolean

    /* ------------------------------------------------------------------------
    Media
    ------------------------------------------------------------------------ */

    image_url?: string

    /* ------------------------------------------------------------------------
    Description
    ------------------------------------------------------------------------ */

    description?: string

    /* ------------------------------------------------------------------------
    Observation
    ------------------------------------------------------------------------ */

    observation_runtime?:
        string | ProductObservationRuntime

    /* ------------------------------------------------------------------------
    Hardware
    ------------------------------------------------------------------------ */

    cpu_model?: string

    gpu_model?: string

    normalized_gpu?: string

    memory_gb?: number

    storage_gb?: number

    weight_kg?: number | null

    npu_tops?: number | null

    display_info?: string

    cpu_socket?: string | null

    motherboard_chipset?: string | null

    ram_type?: string | null

    power_recommendation?: string | null

    /* ------------------------------------------------------------------------
    Operating / Software
    ------------------------------------------------------------------------ */

    os_support?: string | null

    license_term?: string | null

    device_count?: number | null

    edition?: string | null

    is_download?: boolean

    target_segment?: string | null

    /* ------------------------------------------------------------------------
    Semantic / Classification
    ------------------------------------------------------------------------ */

    semantic_schema_version?: string

    semantic_score?: number

    spec_score?: number

    is_ai_pc?: boolean

    ai_summary?: string | null

    target_user?: string | null

    strengths?: string | string[] | null

    weaknesses?: string | string[] | null

    usage_tags?: string | string[] | null

    product_points?: string[]

    /* ------------------------------------------------------------------------
    Semantic Scores
    ------------------------------------------------------------------------ */

    score_cpu?: number

    score_gpu?: number

    score_cost?: number

    score_portable?: number

    score_ai?: number

    /* ------------------------------------------------------------------------
    Spec Runtime State
    ------------------------------------------------------------------------ */

    spec_processed?: boolean

    spec_complete?: boolean

    last_spec_parsed_at?: string | null

    /* ------------------------------------------------------------------------
    Lifecycle
    ------------------------------------------------------------------------ */

    created_at?: string

    updated_at?: string

}

/* ============================================================================
🔥 Compiled Runtime
============================================================================ */

export interface CompiledRuntime {

    specs?: any

    base_type?: string

    cpu_model?: string

    gpu_model?: string | null

    memory_gb?: string

    storage_gb?: string

    display_type?: string | null

    refresh_rate?: string | null

    product_type?: string

    runtime_mode?: string

    runtime_valid?: boolean

    workflows?: any[]

    workflow_tags?: string[]

    primary_workflow?: string

    workflow_score?: number

    reality_labels?: string[]

    reality_scores?: Record<string, number>

    semantic_graph?: any[]

    semantic_groups?: string[]

    semantic_labels?: string[]

    normalized_tokens?: string[]

    semantic_attributes?: string[]

    adaptive_runtime?: any

    semantic_version?: string

    semantic_authority?: string

    reality_workflow_tags?: string[]

}

/* ============================================================================
🔥 Product Semantic Runtime
============================================================================ */

export interface ProductSemanticRuntime {

    semantic_labels?: string[]

    presentation?: {

        title?: string

        subtitle?: string

        description?: string

    }

    workflow_tags?: string[]

    grouped_attributes?:
        Record<string, any[]>

    semantic_summary?: string

    semantic_reasons?: any[]

    related_intents?:
        ProductRelatedIntent[]

}

/* ============================================================================
🔥 Product Detail Data
============================================================================ */

export interface ProductDetailData {

    found: boolean

    product: ProductDetail

    compiled_runtime?: CompiledRuntime

    product_semantic_runtime?:
        ProductSemanticRuntime

}

/* ============================================================================
🔥 Product Detail Runtime
============================================================================ */

export interface ProductDetailRuntimeContract {

    meaning?: ProductDetailMeaning

    seo?: ProductDetailSEO

    data: ProductDetailData

    semantic_schema_version?: number

    authority_version?: string

    semantic_authority?: string

    ready?: boolean

}

/* ============================================================================
🔥 Legacy Compatibility
============================================================================ */

export type ProductDetailRuntime =
    ProductDetailRuntimeContract

export type ProductDetailRuntimeResponse =
    ProductDetailRuntimeContract