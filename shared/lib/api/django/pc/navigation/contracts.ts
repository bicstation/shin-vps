// ============================================================================
// FILE:
// shared/lib/api/django/pc/navigation/contracts.ts
// Copyright (c) 2026 Shin Corporation.
// All rights reserved.
// ============================================================================

/**
 * ============================================================================
 * SHIN CORE LINX
 * Navigation Runtime Contract
 * ============================================================================
 *
 * IMPORTANT
 *
 * This file represents:
 *
 * Backend Reality
 *
 * NOT:
 *
 * UI Model
 * Future Design
 * Projection Model
 *
 * Backend remains:
 *
 * Semantic Authority
 *
 * ============================================================================
 */

/* ============================================================================
🔥 Navigation Attribute
============================================================================ */

export interface NavigationAttribute {

    slug: string

    name: string

    title?: string

    subtitle?: string

    description?: string

    type?: string

    icon?: string

    color?: string

    semantic_role?: string

    semantic_weight?: string | number

    is_ranking_enabled?: string | boolean

}

/* ============================================================================
🔥 Navigation Sibling Group
============================================================================ */

export interface NavigationSiblingGroup {

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
🔥 Navigation Intent
============================================================================ */

export interface NavigationRuntimeItem {

    slug: string

    name: string

    title?: string

    subtitle?: string

    description?: string

    type: string

    parent_group?: string

    icon?: string

    color?: string

    sort_order?: string | number

    product_count?: number

    presentation_name?: string

    presentation_description?: string

    attributes?: NavigationAttribute[]

    sibling_groups?: NavigationSiblingGroup[]

}

/* ============================================================================
🔥 Navigation Runtime
============================================================================ */

export interface NavigationRuntimeContract {

    /* =====================================================================
    Navigation Reality
    ===================================================================== */

    intents: NavigationRuntimeItem[]

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

export type NavigationRuntime =
    NavigationRuntimeContract

export type NavigationRuntimeResponse =
    NavigationRuntimeContract