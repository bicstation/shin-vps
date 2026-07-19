// ============================================================================
// FILE:
// /shared/lib/api/django/pc/products/contracts.ts
// Copyright (c) 2026 Shin Corporation.
// All rights reserved.
// ============================================================================

/**
 * ============================================================================
 * SHIN CORE LINX
 * Products Backend Contract
 * ============================================================================
 *
 * PURPOSE
 *
 * Defines the canonical TypeScript contract that represents the
 * Backend Products Runtime JSON.
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
🔥 Semantic Attribute
============================================================================ */

export interface SemanticAttribute {

    name: string

    slug: string

    icon?: string

    color?: string

}

/* ============================================================================
🔥 Product Item
============================================================================ */

export interface PCProductItem {

    /* ------------------------------------------------------------------------
    Identity
    ------------------------------------------------------------------------ */

    id?: number

    unique_id: string

    site_prefix?: string

    /* ------------------------------------------------------------------------
    Basic
    ------------------------------------------------------------------------ */

    name: string

    maker?: string

    description?: string

    /* ------------------------------------------------------------------------
    Media
    ------------------------------------------------------------------------ */

    image_url?: string

    /* ------------------------------------------------------------------------
    URLs
    ------------------------------------------------------------------------ */

    url?: string

    affiliate_url?: string

    /* ------------------------------------------------------------------------
    Pricing
    ------------------------------------------------------------------------ */

    price?: number

    /* ------------------------------------------------------------------------
    Hardware
    ------------------------------------------------------------------------ */

    cpu_model?: string

    gpu_model?: string

    memory_gb?: number

    storage_gb?: number

    /* ------------------------------------------------------------------------
    Semantic
    ------------------------------------------------------------------------ */

    semantic_score?: number

    semantic_role?: string

    semantic_weight?: number

    recommendation_reason?: string

    confidence?: number

    grouped_attributes?: Record<string, SemanticAttribute[]>

    /* ------------------------------------------------------------------------
    Metadata
    ------------------------------------------------------------------------ */

    created_at?: string

    updated_at?: string

}

/* ============================================================================
🔥 Meaning
============================================================================ */

export interface ProductsMeaning {

    identity?: string

    mission?: string

    user_intent?: string

    meaning_statement?: string

    existence_reason?: string

}

/* ============================================================================
🔥 Presentation
============================================================================ */

export interface ProductsPresentation {

    title?: string

    subtitle?: string

    description?: string

}

/* ============================================================================
🔥 SEO
============================================================================ */

export interface ProductsSEO {

    title?: string

    description?: string

    keywords?: string[]

    canonical?: string

    schema_jsonld?: any

    open_graph?: any

    twitter?: any

}

/* ============================================================================
🔥 Products Data
============================================================================ */

export interface ProductsData {

    count: number

    page: number

    page_size: number

    sort: string

    search: string | null

    has_next: boolean

    products: PCProductItem[]

}

/* ============================================================================
🔥 Products Runtime
============================================================================ */

export interface ProductsRuntimeContract {

    /* ------------------------------------------------------------------------
    Backend Meaning
    ------------------------------------------------------------------------ */

    meaning?: ProductsMeaning

    /* ------------------------------------------------------------------------
    Backend Presentation
    ------------------------------------------------------------------------ */

    presentation?: ProductsPresentation

    /* ------------------------------------------------------------------------
    Backend SEO
    ------------------------------------------------------------------------ */

    seo?: ProductsSEO

    /* ------------------------------------------------------------------------
    Backend Data
    ------------------------------------------------------------------------ */

    data: ProductsData

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

export type ProductsRuntime =
    ProductsRuntimeContract

export type ProductsRuntimeResponse =
    ProductsRuntimeContract