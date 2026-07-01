// ============================================================================
// FILE:
// shared/lib/api/django/pc/navigation/contracts.ts
// ============================================================================

/* ============================================================================
🔥 Meaning
============================================================================ */

export interface NavigationMeaning {

    identity?: string

    mission?: string

    user_intent?: string

    meaning_statement?: string

    existence_reason?: string
}

/* ============================================================================
🔥 Presentation
============================================================================ */

export interface NavigationPresentation {

    title?: string

    subtitle?: string

    description?: string
}

/* ============================================================================
🔥 SEO
============================================================================ */

export interface NavigationSEO {

    title?: string

    description?: string

    keywords?: string[]

    canonical?: string

    schema_jsonld?: any
}

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

    semantic_weight?: number | string

    is_ranking_enabled?: boolean | string
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

    sort_order?: number | string

    product_count?: number

    attributes?: NavigationAttribute[]
}

/* ============================================================================
🔥 Navigation Runtime Contract
============================================================================ */

export interface NavigationRuntimeContract {

    // =========================
    // STATUS
    // =========================

    success?: boolean

    // =========================
    // MEANING
    // =========================

    meaning?: NavigationMeaning

    // =========================
    // PRESENTATION
    // =========================

    presentation?: NavigationPresentation

    // =========================
    // SEO
    // =========================

    seo?: NavigationSEO

    // =========================
    // DATA
    // =========================

    intents: NavigationRuntimeItem[]

    // =========================
    // AUTHORITY
    // =========================

    semantic_schema_version?: number

    authority_version?: string

    semantic_authority?: string

    ready?: boolean

    // =========================
    // RAW BACKUP
    // =========================

    raw?: any
}

/* ============================================================================
🔥 Legacy Compatibility
============================================================================ */

export type NavigationRuntime =
    NavigationRuntimeContract

export type NavigationRuntimeResponse =
    NavigationRuntimeContract