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
🔥 Product
============================================================================ */

export interface ProductDetail {

    id?: number

    unique_id: string

    site_prefix?: string

    maker?: string

    raw_genre?: string

    unified_genre?: string

    name: string

    description?: string

    image_url?: string

    url?: string

    affiliate_url?: string

    affiliate_updated_at?: string

    price?: number

    stock_status?: string

    is_posted?: boolean

    is_active?: boolean

    created_at?: string

    updated_at?: string

    cpu_model?: string

    gpu_model?: string

    memory_gb?: number

    storage_gb?: number

    semantic_schema_version?: string

    product_type?: string

    semantic_score?: number

}

/* ============================================================================
🔥 Compiled Runtime
============================================================================ */

export interface CompiledRuntime {

    specs?: any

    base_type?: string

    cpu_model?: string

    gpu_model?: string

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

    semantic_groups?: string[]

    semantic_labels?: string[]

    semantic_attributes?: string[]

    adaptive_runtime?: any

    semantic_version?: string

    semantic_authority?: string

}

/* ============================================================================
🔥 Product Semantic Runtime
============================================================================ */

export interface ProductSemanticRuntime {

    presentation?: any

    grouped_attributes?: Record<string, any[]>

    semantic_summary?: string

    semantic_labels?: string[]

    semantic_reasons?: any[]

    workflow_tags?: string[]

    related_intents?: any[]

}

/* ============================================================================
🔥 Product Detail Data
============================================================================ */

export interface ProductDetailData {

    found: boolean

    product: ProductDetail

    compiled_runtime?: CompiledRuntime

    product_semantic_runtime?: ProductSemanticRuntime

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