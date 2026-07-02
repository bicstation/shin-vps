// ============================================================================
// FILE:
// /shared/lib/api/django/pc/discover-detail/contracts.ts
// Copyright (c) 2024 Shin Corporation.
// All rights reserved.
// ============================================================================

/**
 * ============================================================================
 * SHIN CORE LINX
 * Discover Detail Runtime Contract
 * ============================================================================
 *
 * IMPORTANT
 *
 * Backend remains:
 *
 * Semantic Authority
 *
 * Adapter remains:
 *
 * Projection Authority
 *
 * This file represents:
 *
 * Backend Runtime Reality
 *
 * NOT:
 *
 * UI Model
 *
 * ============================================================================
 */

/* ============================================================================
🔥 Meaning
============================================================================ */

export interface DiscoverDetailMeaning {

    identity?: string

    mission?: string

    user_intent?: string

    meaning_statement?: string

    existence_reason?: string
}

/* ============================================================================
🔥 Presentation
============================================================================ */

export interface DiscoverDetailPresentation {

    slug?: string

    name?: string

    title?: string

    subtitle?: string

    description?: string

    seo_title?: string

    seo_description?: string

    canonical_path?: string

    schema_type?: string

    icon_key?: string

    theme_key?: string

    color_key?: string

    og_title?: string

    og_description?: string

    og_image?: string

    priority?: string

    visibility?: string

    is_adult?: string
}

/* ============================================================================
🔥 SEO
============================================================================ */

export interface DiscoverDetailSEO {

    title?: string

    description?: string

    keywords?: string[]

    canonical?: string

    schema_jsonld?: any
}

/* ============================================================================
🔥 Attribute
============================================================================ */

export interface DiscoverDetailAttribute {

    type?: string

    name?: string

    slug?: string

    title?: string

    description?: string

    order?: string

    is_adult?: string

    semantic_role?: string

    semantic_weight?: string

    icon?: string

    color?: string

    is_ranking_enabled?: string
}

/* ============================================================================
🔥 Product
============================================================================ */

export interface DiscoverDetailProduct {

    unique_id: string

    name: string

    maker?: string

    price?: number

    image_url?: string
}

/* ============================================================================
🔥 Runtime Data
============================================================================ */

export interface DiscoverDetailData {

    group_slug: string

    group_name?: string

    type?: string

    parent_group?: string

    icon?: string

    color?: string

    sort_order?: string

    attribute?: DiscoverDetailAttribute

    product_count?: number

    aliases: string[]

    related_groups: string[]

    sample_products: DiscoverDetailProduct[]
}

/* ============================================================================
🔥 Runtime
============================================================================ */

export interface DiscoverDetailRuntime {

    /* =====================================================================
    Status
    ===================================================================== */

    found: boolean

    /* =====================================================================
    Meaning Layer
    ===================================================================== */

    meaning?: DiscoverDetailMeaning

    presentation?: DiscoverDetailPresentation

    seo?: DiscoverDetailSEO

    /* =====================================================================
    Runtime Data
    ===================================================================== */

    data: DiscoverDetailData

    /* =====================================================================
    Runtime Authority
    ===================================================================== */

    semantic_schema_version?: number

    authority_version?: string

    semantic_authority?: string

    ready?: boolean

    /* =====================================================================
    Raw Backup
    ===================================================================== */

    raw?: any
}

/* ============================================================================
🔥 Legacy Compatibility
============================================================================ */

export type DiscoverDetailRuntimeResponse =
    DiscoverDetailRuntime