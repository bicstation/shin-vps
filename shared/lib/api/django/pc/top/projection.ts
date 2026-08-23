// ============================================================================
// FILE:
// /home/maya/shin-vps/shared/lib/api/django/pc/top/projection.ts
// Copyright (c) 2026 Shin Corporation.
// All rights reserved.
// ============================================================================

/**
 * ============================================================================
 * SHIN CORE LINX
 * Semantic Top Runtime Projection
 * ============================================================================
 *
 * PURPOSE
 *
 * Backend Top Runtime Contract
 *      ↓
 * Frontend / Experience View Model
 *
 * Backend
 *      ↓
 * Normalize
 *      ↓
 * Projection
 *      ↓
 * Frontend Experience
 *
 * Projection Responsibilities
 *
 * ✓ Structural Translation
 * ✓ snake_case → camelCase
 * ✓ Backend data flattening
 * ✓ Preserve Backend Reality
 *
 * Projection SHALL NOT
 *
 * ✗ Generate Semantic Meaning
 * ✗ Interpret Semantic Groups
 * ✗ Re-rank Featured Groups
 * ✗ Re-rank Featured Products
 * ✗ Filter Products
 * ✗ Generate SEO
 * ✗ Generate Presentation
 * ✗ Generate Statistics
 * ✗ Invent Product Data
 *
 * ============================================================================
 */

/* ============================================================================
🔥 Contracts
============================================================================ */

import type {

    TopRuntimeContract,
    TopFeaturedGroup,
    TopFeaturedProduct,

} from './contracts'

/* ============================================================================
🔥 Projected Top Runtime
============================================================================ */

export interface ProjectedTopRuntime {

    /* ------------------------------------------------------------------------
    Meaning
    ------------------------------------------------------------------------ */

    meaning: TopRuntimeContract['meaning']

    /* ------------------------------------------------------------------------
    Presentation
    ------------------------------------------------------------------------ */

    presentation?: TopRuntimeContract['presentation']

    /* ------------------------------------------------------------------------
    SEO
    ------------------------------------------------------------------------ */

    seo: TopRuntimeContract['seo']

    /* ------------------------------------------------------------------------
    Stats
    ------------------------------------------------------------------------ */

    stats: {

        productCount: number

        groupCount: number

        attributeCount: number

    }

    /* ------------------------------------------------------------------------
    Featured Groups
    ------------------------------------------------------------------------ */

    featuredGroups: ProjectedTopFeaturedGroup[]

    /* ------------------------------------------------------------------------
    Featured Products
    ------------------------------------------------------------------------ */

    featuredProducts: ProjectedTopFeaturedProduct[]

    /* ------------------------------------------------------------------------
    Backend Authority
    ------------------------------------------------------------------------ */

    semanticSchemaVersion?: number

    authorityVersion?: string

    semanticAuthority?: string

    ready: boolean

}

/* ============================================================================
🔥 Projected Featured Group
============================================================================ */

export interface ProjectedTopFeaturedGroup {

    groupSlug: string

    groupName: string

    presentationName?: string

    presentationDescription?: string

    parentGroup?: string

    type?: string

    icon?: string

    color?: string

    sortOrder?: string

    discoveryPriority?: string

    isActive?: string

    productCount?: number

}

/* ============================================================================
🔥 Projected Featured Product
============================================================================ */

export interface ProjectedTopFeaturedProduct {

    productId?: number

    uniqueId: string

    name: string

    maker?: string

    price?: number

    imageUrl?: string

    cpuModel?: string | null

    gpuModel?: string | null

    memoryGb?: number | null

    storageGb?: number | null

    displayInfo?: string | null

    isAiPc?: boolean

    semanticAttributes?: string[]

    matchedGroups?: string[]

    realityScores?: Record<string, number>

    productType?: string | null

    primaryWorkflow?: string | null

    workflowScore?: number

    semanticScore?: number

    workflowTags?: string[]

    workflows?: any[]

    semanticLabels?: string[]

    adaptiveRuntime?: Record<string, any>

    semanticVersion?: string | null

    semanticAuthority?: string | null

    runtimeValid?: boolean

}

/* ============================================================================
🔥 Projection
============================================================================ */

export function projectTopRuntime(

    runtime: TopRuntimeContract,

): ProjectedTopRuntime {

    return {

        /* --------------------------------------------------------------------
        Meaning
        -------------------------------------------------------------------- */

        meaning:
            runtime.meaning,

        /* --------------------------------------------------------------------
        Presentation
        -------------------------------------------------------------------- */

        presentation:
            runtime.presentation,

        /* --------------------------------------------------------------------
        SEO
        -------------------------------------------------------------------- */

        seo:
            runtime.seo,

        /* --------------------------------------------------------------------
        Stats
        -------------------------------------------------------------------- */

        stats: {

            productCount:
                runtime.data.stats.product_count,

            groupCount:
                runtime.data.stats.group_count,

            attributeCount:
                runtime.data.stats.attribute_count,

        },

        /* --------------------------------------------------------------------
        Featured Groups
        -------------------------------------------------------------------- */

        featuredGroups:

            runtime.data.featured_groups.map(
                projectFeaturedGroup
            ),

        /* --------------------------------------------------------------------
        Featured Products
        -------------------------------------------------------------------- */

        featuredProducts:

            runtime.data.featured_products.map(
                projectFeaturedProduct
            ),

        /* --------------------------------------------------------------------
        Backend Authority
        -------------------------------------------------------------------- */

        semanticSchemaVersion:
            runtime.semantic_schema_version,

        authorityVersion:
            runtime.authority_version,

        semanticAuthority:
            runtime.semantic_authority,

        ready:
            runtime.ready ?? false,

    }

}

/* ============================================================================
🔥 Featured Group Projection
============================================================================ */

function projectFeaturedGroup(

    group: TopFeaturedGroup,

): ProjectedTopFeaturedGroup {

    return {

        groupSlug:
            group.group_slug,

        groupName:
            group.group_name,

        presentationName:
            group.presentation_name,

        presentationDescription:
            group.presentation_description,

        parentGroup:
            group.parent_group,

        type:
            group.type,

        icon:
            group.icon,

        color:
            group.color,

        sortOrder:
            group.sort_order,

        discoveryPriority:
            group.discovery_priority,

        isActive:
            group.is_active,

        productCount:
            group.product_count,

    }

}

/* ============================================================================
🔥 Featured Product Projection
============================================================================ */

function projectFeaturedProduct(

    product: TopFeaturedProduct,

): ProjectedTopFeaturedProduct {

    return {

        productId:
            product.product_id,

        uniqueId:
            product.unique_id,

        name:
            product.name,

        maker:
            product.maker,

        price:
            product.price,

        imageUrl:
            product.image_url,

        cpuModel:
            product.cpu_model,

        gpuModel:
            product.gpu_model,

        memoryGb:
            product.memory_gb,

        storageGb:
            product.storage_gb,

        displayInfo:
            product.display_info,

        isAiPc:
            product.is_ai_pc,

        semanticAttributes:
            product.semantic_attributes,

        matchedGroups:
            product.matched_groups,

        realityScores:
            product.reality_scores,

        productType:
            product.product_type,

        primaryWorkflow:
            product.primary_workflow,

        workflowScore:
            product.workflow_score,

        semanticScore:
            product.semantic_score,

        workflowTags:
            product.workflow_tags,

        workflows:
            product.workflows,

        semanticLabels:
            product.semantic_labels,

        adaptiveRuntime:
            product.adaptive_runtime,

        semanticVersion:
            product.semantic_version,

        semanticAuthority:
            product.semantic_authority,

        runtimeValid:
            product.runtime_valid,

    }

}

/* ============================================================================
🔥 Legacy Compatibility
============================================================================ */

export const projectTop =

    projectTopRuntime

/* ============================================================================
🔥 Default Export
============================================================================ */

export default projectTopRuntime