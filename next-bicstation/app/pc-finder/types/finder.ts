// ============================================================================
// FILE:
// /app/pc-finder/types/finder.ts
// Copyright (c) 2026 Shin Corporation.
// ============================================================================

/* ============================================================================
Meaning
============================================================================ */

export interface FinderMeaning {

    identity: string

    mission: string

    user_intent: string

    meaning_statement: string

    existence_reason: string

}

/* ============================================================================
Presentation
============================================================================ */

export interface FinderPresentation {

    title: string

    subtitle: string

    description: string

}

/* ============================================================================
SEO
============================================================================ */

export interface FinderSEO {

    title: string

    description: string

    keywords: string[]

    canonical: string

}

/* ============================================================================
Query
============================================================================ */

export interface FinderQuery {

    selected_groups: string[]

    selected_attributes: string[]

    filters: string[]

    max_price: number | null

}

/* ============================================================================
Summary
============================================================================ */

export interface FinderSummary {

    group_count: number

    attribute_count: number

    filter_count: number

    result_count: number

    has_result: boolean

}

/* ============================================================================
Workflow
============================================================================ */

export interface FinderWorkflow {

    workflow: string

    confidence: number

    score_bonus: number

    semantic_role: string

}

/* ============================================================================
Adaptive Runtime
============================================================================ */

export interface FinderAdaptiveRuntime {

    focus: string

    ui_mode: string

    primary_specs: (string | number | null)[]

    interaction_hint: string

}

/* ============================================================================
Product
============================================================================ */

export interface FinderProduct {

    product_id: number

    unique_id: string

    name: string

    maker: string

    image_url: string

    price: number

    score: number

    semantic_score: number

    product_type: string

    primary_workflow: string | null

    workflow_score: number

    semantic_labels: string[]

    workflow_tags: string[]

    adaptive_runtime: FinderAdaptiveRuntime

    workflows: FinderWorkflow[]

}

/* ============================================================================
Data
============================================================================ */

export interface FinderData {

    query: FinderQuery

    summary: FinderSummary

    products: FinderProduct[]

}

/* ============================================================================
Runtime
============================================================================ */

export interface FinderRuntime {

    meaning: FinderMeaning

    presentation: FinderPresentation

    seo: FinderSEO

    data: FinderData

    semantic_schema_version: number

    authority_version: string

    semantic_authority: string

    ready: boolean

}