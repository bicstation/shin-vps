// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/shared/lib/api/django/pc/consultation/projection.ts
// Copyright (c) 2026 Shin Corporation.
// All rights reserved.
// ============================================================================

/**
 * ============================================================================
 * SHIN CORE LINX
 * PC Consultation Runtime Projection
 * ============================================================================
 *
 * PURPOSE
 *
 * Translate the Backend Consultation Runtime into a lightweight
 * Frontend / Concierge View Model.
 *
 * Backend
 *      ↓
 * Normalize
 *      ↓
 * Backend Contract
 *      ↓
 * Projection
 *      ↓
 * Concierge View Model
 *
 * Projection SHALL NOT
 *
 * ✗ Generate Semantic Meaning
 * ✗ Resolve Requirements
 * ✗ Rebuild Finder
 * ✗ Optimize Candidates
 * ✗ Invent Product Data
 * ✗ Modify Requirement Groups
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
 * ============================================================================
 */

import type {

    ConsultationRuntimeContract,
    ConsultationProduct,

} from './contracts'

/* ============================================================================
🔥 Projected Consultation Runtime
============================================================================ */

export interface ProjectedConsultationRuntime {

    /* ------------------------------------------------------------------------
    Backend Response
    ------------------------------------------------------------------------ */

    response: string

    /* ------------------------------------------------------------------------
    Backend Requirement
    ------------------------------------------------------------------------ */

    /**
     * Backend-resolved Conversation Requirement.
     *
     * This value can be retained by the Frontend as
     * Conversation Context and supplied on the next request
     * through `previousRequirement`.
     *
     * Adapter SHALL NOT:
     *
     * ✗ interpret
     * ✗ merge
     * ✗ modify
     * ✗ regenerate
     *
     * the semantic content.
     */

    requirement?: {

        message: string

        groups: string[]

        /**
         * Backend-resolved Requirement Constraints.
         *
         * Adapter SHALL preserve these values without
         * interpreting or regenerating them.
         */

        constraints: Record<string, any>

        ready: boolean

    }

    /* ------------------------------------------------------------------------
    Meaning
    ------------------------------------------------------------------------ */

    meaning?:
        ConsultationRuntimeContract['meaning']

    /* ------------------------------------------------------------------------
    Presentation
    ------------------------------------------------------------------------ */

    presentation?:
        ConsultationRuntimeContract['presentation']

    /* ------------------------------------------------------------------------
    SEO
    ------------------------------------------------------------------------ */

    seo?:
        ConsultationRuntimeContract['seo']

    /* ------------------------------------------------------------------------
    Query
    ------------------------------------------------------------------------ */

    query: {

        selectedGroups: string[]

        selectedAttributes: string[]

        filters: string[]

        maxPrice: number | null

    }

    /* ------------------------------------------------------------------------
    Summary
    ------------------------------------------------------------------------ */

    summary: {

        groupCount: number

        attributeCount: number

        filterCount: number

        resultCount: number

        hasResult: boolean

    }

    /* ------------------------------------------------------------------------
    Products
    ------------------------------------------------------------------------ */

    products:
        ProjectedConsultationProduct[]

    /* ------------------------------------------------------------------------
    Authority
    ------------------------------------------------------------------------ */

    semanticSchemaVersion?: number

    authorityVersion?: string

    semanticAuthority?: string

    ready: boolean

}

/* ============================================================================
🔥 Projected Consultation Product
============================================================================ */

export interface ProjectedConsultationProduct {

    score: number

    productId: number

    uniqueId: string

    name: string

    maker: string

    price: number

    imageUrl: string

    cpuModel?: string | null

    gpuModel?: string | null

    memoryGb?: number | null

    storageGb?: number | null

    displayInfo?: string | null

    isAiPc?: boolean

    semanticAttributes: string[]

    matchedGroups: string[]

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

export function projectConsultationRuntime(

    runtime: ConsultationRuntimeContract,

): ProjectedConsultationRuntime {

    return {

        /* --------------------------------------------------------------------
        Backend Response
        -------------------------------------------------------------------- */

        response:
            runtime.response ?? '',

        /* --------------------------------------------------------------------
        Backend Requirement
        -------------------------------------------------------------------- */

        requirement:

            runtime.requirement

                ? {

                    message:
                        runtime.requirement.message,

                    groups:
                        runtime.requirement.groups,

                    constraints:
                        runtime.requirement.constraints ?? {},

                    ready:
                        runtime.requirement.ready,

                }

                : undefined,

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
        Query
        -------------------------------------------------------------------- */

        query: {

            selectedGroups:
                runtime.data.query.selected_groups,

            selectedAttributes:
                runtime.data.query.selected_attributes,

            filters:
                runtime.data.query.filters,

            maxPrice:
                runtime.data.query.max_price ?? null,

        },

        /* --------------------------------------------------------------------
        Summary
        -------------------------------------------------------------------- */

        summary: {

            groupCount:
                runtime.data.summary.group_count,

            attributeCount:
                runtime.data.summary.attribute_count,

            filterCount:
                runtime.data.summary.filter_count,

            resultCount:
                runtime.data.summary.result_count,

            hasResult:
                runtime.data.summary.has_result,

        },

        /* --------------------------------------------------------------------
        Products
        -------------------------------------------------------------------- */

        products:

            runtime.data.products.map(
                projectProduct
            ),

        /* --------------------------------------------------------------------
        Authority
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
🔥 Product Projection
============================================================================ */

function projectProduct(

    product: ConsultationProduct,

): ProjectedConsultationProduct {

    return {

        score:
            product.score,

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

export const projectConsultation =
    projectConsultationRuntime

/* ============================================================================
🔥 Default Export
============================================================================ */

export default projectConsultationRuntime