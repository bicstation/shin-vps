// ============================================================================
// FILE:
// /shared/lib/api/django/pc/discover/contracts.ts
// Copyright (c) 2026 Shin Corporation.
// All rights reserved.
// ============================================================================

/**
 * ============================================================================
 * SHIN CORE LINX
 * Discover Backend Contract
 * ============================================================================
 *
 * PURPOSE
 *
 * Defines the canonical TypeScript contract that represents the
 * Backend Discover JSON.
 *
 * This file mirrors Backend Reality.
 *
 * It does NOT define:
 *
 * ✗ Frontend UI
 * ✗ Projection Models
 * ✗ Runtime Helpers
 * ✗ Exploration Helpers
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

export interface DiscoverMeaning {

    identity?: string

    mission?: string

    user_intent?: string

    meaning_statement?: string

    existence_reason?: string

}

/* ============================================================================
🔥 Presentation
============================================================================ */

export interface DiscoverPresentation {

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

export interface DiscoverSEO {

    title?: string

    description?: string

    keywords?: string[]

    canonical?: string

    schema_jsonld?: any

}

/* ============================================================================
🔥 Attribute
============================================================================ */

export interface DiscoverAttribute {

    type?: string

    name?: string

    slug?: string

    title?: string

    description?: string

    order?: string | number

    is_adult?: string

    semantic_role?: string

    semantic_weight?: string | number

    icon?: string

    color?: string

    is_ranking_enabled?: string | boolean

}

/* ============================================================================
🔥 Sibling Group
============================================================================ */

export interface DiscoverSiblingGroup {

    group_slug: string

    group_name: string

    presentation_name?: string

    presentation_description?: string

    icon?: string

    color?: string

    sort_order?: string | number

    is_current?: boolean

}

/* ============================================================================
🔥 Sample Product
============================================================================ */

export interface DiscoverSampleProduct {

    unique_id: string

    name: string

    maker: string

    price: number

    image_url: string

}

/* ============================================================================
🔥 Discover Data
============================================================================ */

export interface DiscoverData {

    group_slug: string

    group_name?: string

    presentation_name?: string

    presentation_description?: string

    type?: string

    parent_group?: string

    icon?: string

    color?: string

    sort_order?: string | number

    attribute?: DiscoverAttribute

    product_count?: number

    aliases?: string[]

    sibling_groups?: DiscoverSiblingGroup[]

    sample_products?: DiscoverSampleProduct[]

}

/* ============================================================================
🔥 Discover Runtime
============================================================================ */

export interface DiscoverRuntimeContract {

    /* ------------------------------------------------------------------------
    Backend Status
    ------------------------------------------------------------------------ */

    found?: boolean

    /* ------------------------------------------------------------------------
    Backend Meaning
    ------------------------------------------------------------------------ */

    meaning?: DiscoverMeaning

    /* ------------------------------------------------------------------------
    Backend Presentation
    ------------------------------------------------------------------------ */

    presentation?: DiscoverPresentation

    /* ------------------------------------------------------------------------
    Backend SEO
    ------------------------------------------------------------------------ */

    seo?: DiscoverSEO

    /* ------------------------------------------------------------------------
    Backend Data
    ------------------------------------------------------------------------ */

    data: DiscoverData

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

export type DiscoverRuntime =
    DiscoverRuntimeContract

export type DiscoverRuntimeResponse =
    DiscoverRuntimeContract