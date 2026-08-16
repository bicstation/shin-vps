// ============================================================================
// FILE:
// /shared/lib/api/django/pc/product-detail/projection.ts
// Copyright (c) 2026 Shin Corporation.
// All rights reserved.
// ============================================================================

/**
 * ============================================================================
 * SHIN CORE LINX
 * Product Detail Projection
 * ============================================================================
 *
 * Backend Contract
 *      ↓
 * Frontend View Model
 *
 * Projection = Translation Authority
 *
 * Responsibilities
 *
 * ✓ Naming Translation
 * ✓ Contract Translation
 * ✓ Backend Response Preservation
 *
 * IMPORTANT
 *
 * Projection SHALL NOT discard Backend Runtime information.
 *
 * It may translate field names from snake_case to camelCase,
 * but Backend Reality must remain available to Frontend.
 *
 * Projection SHALL NOT:
 *
 * ✗ Generate Meaning
 * ✗ Generate Runtime
 * ✗ Generate Authority
 * ✗ Modify Backend Reality
 * ✗ Discard Backend Runtime information
 *
 * ============================================================================
 */

import type {
    ProductDetailRuntimeContract,
    ProductDetailMeaning,
    ProductDetailSEO,
    ProductDetail,
    ProductObservationRuntime,
    ProductRelatedIntent,
    CompiledRuntime,
    ProductSemanticRuntime,
} from './contracts'

/* ============================================================================
🔥 Projected Meaning
============================================================================ */

export interface ProjectedProductDetailMeaning {

    identity?: string

    mission?: string

    userIntent?: string

    meaningStatement?: string

    existenceReason?: string

}

/* ============================================================================
🔥 Projected SEO
============================================================================ */

export interface ProjectedProductDetailSEO {

    title?: string

    description?: string

    keywords?: string[]

    canonical?: string

    schemaJsonld?: any

    openGraph?: any

    twitter?: any

}

/* ============================================================================
🔥 Projected Breadcrumb
============================================================================ */

export interface ProjectedProductBreadcrumb {

    name: string

    url: string

}

/* ============================================================================
🔥 Projected Related Intent
============================================================================ */

export interface ProjectedRelatedIntent {

    slug: string

    title: string

    description?: string | null

}

/* ============================================================================
🔥 Product Detail View Model
============================================================================ */

export interface ProjectedProductDetailRuntime {

    meaning?: ProjectedProductDetailMeaning

    seo?: ProjectedProductDetailSEO

    found: boolean

    product: ProjectedProduct

    compiledRuntime?: ProjectedCompiledRuntime

    semanticRuntime?: ProjectedSemanticRuntime

    semanticSchemaVersion?: number

    authorityVersion?: string

    semanticAuthority?: string

    ready?: boolean

}

/* ============================================================================
🔥 Product View Model
============================================================================ */

export interface ProjectedProduct {

    /* ------------------------------------------------------------------------
    Identity
    ------------------------------------------------------------------------ */

    id?: number

    uniqueId: string

    sitePrefix?: string

    maker?: string

    brand?: string

    series?: string

    collaboration?: string

    model?: string

    productNo?: string

    pcId?: string

    rawGenre?: string

    unifiedGenre?: string

    name: string

    productType?: string

    /* ------------------------------------------------------------------------
    Navigation
    ------------------------------------------------------------------------ */

    breadcrumbs: ProjectedProductBreadcrumb[]

    /* ------------------------------------------------------------------------
    Commercial
    ------------------------------------------------------------------------ */

    price?: number

    url?: string

    affiliateUrl?: string

    affiliateUpdatedAt?: string | null

    stockStatus?: string

    isPosted?: boolean

    isActive?: boolean

    /* ------------------------------------------------------------------------
    Media
    ------------------------------------------------------------------------ */

    imageUrl?: string

    /* ------------------------------------------------------------------------
    Description
    ------------------------------------------------------------------------ */

    description?: string

    /* ------------------------------------------------------------------------
    Observation
    ------------------------------------------------------------------------ */

    observationRuntime?:
        string | ProductObservationRuntime

    /* ------------------------------------------------------------------------
    Hardware
    ------------------------------------------------------------------------ */

    cpuModel?: string

    gpuModel?: string

    normalizedGpu?: string

    memoryGb?: number

    storageGb?: number

    weightKg?: number | null

    npuTops?: number | null

    displayInfo?: string

    cpuSocket?: string | null

    motherboardChipset?: string | null

    ramType?: string | null

    powerRecommendation?: string | null

    /* ------------------------------------------------------------------------
    Operating / Software
    ------------------------------------------------------------------------ */

    osSupport?: string | null

    licenseTerm?: string | null

    deviceCount?: number | null

    edition?: string | null

    isDownload?: boolean

    targetSegment?: string | null

    /* ------------------------------------------------------------------------
    Semantic / Classification
    ------------------------------------------------------------------------ */

    semanticSchemaVersion?: string

    semanticScore?: number

    specScore?: number

    isAiPc?: boolean

    aiSummary?: string | null

    targetUser?: string | null

    strengths?: string | string[] | null

    weaknesses?: string | string[] | null

    usageTags?: string | string[] | null

    /* ------------------------------------------------------------------------
    Semantic Scores
    ------------------------------------------------------------------------ */

    scoreCpu?: number

    scoreGpu?: number

    scoreCost?: number

    scorePortable?: number

    scoreAi?: number

    /* ------------------------------------------------------------------------
    Spec Runtime State
    ------------------------------------------------------------------------ */

    specProcessed?: boolean

    specComplete?: boolean

    lastSpecParsedAt?: string | null

    /* ------------------------------------------------------------------------
    Lifecycle
    ------------------------------------------------------------------------ */

    createdAt?: string

    updatedAt?: string

}

/* ============================================================================
🔥 Compiled Runtime View Model
============================================================================ */

export interface ProjectedCompiledRuntime {

    specs?: any

    baseType?: string

    cpuModel?: string

    gpuModel?: string | null

    memoryGb?: string

    storageGb?: string

    displayType?: string | null

    refreshRate?: string | null

    productType?: string

    runtimeMode?: string

    runtimeValid?: boolean

    workflows?: any[]

    workflowTags?: string[]

    primaryWorkflow?: string

    workflowScore?: number

    realityLabels?: string[]

    realityScores?: Record<string, number>

    semanticGraph?: any[]

    semanticGroups?: string[]

    semanticLabels?: string[]

    normalizedTokens?: string[]

    semanticAttributes?: string[]

    adaptiveRuntime?: any

    semanticVersion?: string

    semanticAuthority?: string

    realityWorkflowTags?: string[]

}

/* ============================================================================
🔥 Semantic Runtime View Model
============================================================================ */

export interface ProjectedSemanticRuntime {

    semanticLabels?: string[]

    presentation?: any

    workflowTags?: string[]

    groupedAttributes?: Record<string, any[]>

    semanticSummary?: string

    semanticReasons?: any[]

    relatedIntents?: ProjectedRelatedIntent[]

}

/* ============================================================================
🔥 Projection
============================================================================ */

export function projectProductDetail(
    contract: ProductDetailRuntimeContract,
): ProjectedProductDetailRuntime {

    return {

        meaning:
            contract.meaning
                ? projectMeaning(contract.meaning)
                : undefined,

        seo:
            contract.seo
                ? projectSEO(contract.seo)
                : undefined,

        found:
            contract.data.found,

        product:
            projectProduct(
                contract.data.product
            ),

        compiledRuntime:
            contract.data.compiled_runtime
                ? projectCompiledRuntime(
                    contract.data.compiled_runtime
                )
                : undefined,

        semanticRuntime:
            contract.data.product_semantic_runtime
                ? projectSemanticRuntime(
                    contract.data.product_semantic_runtime
                )
                : undefined,

        semanticSchemaVersion:
            contract.semantic_schema_version,

        authorityVersion:
            contract.authority_version,

        semanticAuthority:
            contract.semantic_authority,

        ready:
            contract.ready,

    }

}

/* ============================================================================
🔥 Meaning Projection
============================================================================ */

function projectMeaning(
    meaning: ProductDetailMeaning,
): ProjectedProductDetailMeaning {

    return {

        identity:
            meaning.identity,

        mission:
            meaning.mission,

        userIntent:
            meaning.user_intent,

        meaningStatement:
            meaning.meaning_statement,

        existenceReason:
            meaning.existence_reason,

    }

}

/* ============================================================================
🔥 SEO Projection
============================================================================ */

function projectSEO(
    seo: ProductDetailSEO,
): ProjectedProductDetailSEO {

    return {

        title:
            seo.title,

        description:
            seo.description,

        keywords:
            seo.keywords,

        canonical:
            seo.canonical,

        schemaJsonld:
            seo.schema_jsonld,

        openGraph:
            seo.open_graph,

        twitter:
            seo.twitter,

    }

}

/* ============================================================================
🔥 Product Projection
============================================================================ */

function projectProduct(
    product: ProductDetail,
): ProjectedProduct {

    return {

        id:
            product.id,

        uniqueId:
            product.unique_id,

        sitePrefix:
            product.site_prefix,

        maker:
            product.maker,

        brand:
            product.brand,

        series:
            product.series,

        collaboration:
            product.collaboration,

        model:
            product.model,

        productNo:
            product.product_no,

        pcId:
            product.pc_id,

        rawGenre:
            product.raw_genre,

        unifiedGenre:
            product.unified_genre,

        name:
            product.name,

        productType:
            product.product_type,

        /* --------------------------------------------------------------------
        Breadcrumb
        -------------------------------------------------------------------- */

        breadcrumbs:
            product.breadcrumbs?.map(
                breadcrumb => ({

                    name:
                        breadcrumb.name,

                    url:
                        breadcrumb.url,

                })
            ) ?? [],

        price:
            product.price,

        url:
            product.url,

        affiliateUrl:
            product.affiliate_url,

        affiliateUpdatedAt:
            product.affiliate_updated_at,

        stockStatus:
            product.stock_status,

        isPosted:
            product.is_posted,

        isActive:
            product.is_active,

        imageUrl:
            product.image_url,

        description:
            product.description,

        observationRuntime:
            product.observation_runtime,

        cpuModel:
            product.cpu_model,

        gpuModel:
            product.gpu_model,

        normalizedGpu:
            product.normalized_gpu,

        memoryGb:
            product.memory_gb,

        storageGb:
            product.storage_gb,

        weightKg:
            product.weight_kg,

        npuTops:
            product.npu_tops,

        displayInfo:
            product.display_info,

        cpuSocket:
            product.cpu_socket,

        motherboardChipset:
            product.motherboard_chipset,

        ramType:
            product.ram_type,

        powerRecommendation:
            product.power_recommendation,

        osSupport:
            product.os_support,

        licenseTerm:
            product.license_term,

        deviceCount:
            product.device_count,

        edition:
            product.edition,

        isDownload:
            product.is_download,

        targetSegment:
            product.target_segment,

        semanticSchemaVersion:
            product.semantic_schema_version,

        semanticScore:
            product.semantic_score,

        specScore:
            product.spec_score,

        isAiPc:
            product.is_ai_pc,

        aiSummary:
            product.ai_summary,

        targetUser:
            product.target_user,

        strengths:
            product.strengths,

        weaknesses:
            product.weaknesses,

        usageTags:
            product.usage_tags,

        scoreCpu:
            product.score_cpu,

        scoreGpu:
            product.score_gpu,

        scoreCost:
            product.score_cost,

        scorePortable:
            product.score_portable,

        scoreAi:
            product.score_ai,

        specProcessed:
            product.spec_processed,

        specComplete:
            product.spec_complete,

        lastSpecParsedAt:
            product.last_spec_parsed_at,

        createdAt:
            product.created_at,

        updatedAt:
            product.updated_at,

    }

}

/* ============================================================================
🔥 Compiled Runtime Projection
============================================================================ */

function projectCompiledRuntime(
    runtime: CompiledRuntime,
): ProjectedCompiledRuntime {

    return {

        specs:
            runtime.specs,

        baseType:
            runtime.base_type,

        cpuModel:
            runtime.cpu_model,

        gpuModel:
            runtime.gpu_model,

        memoryGb:
            runtime.memory_gb,

        storageGb:
            runtime.storage_gb,

        displayType:
            runtime.display_type,

        refreshRate:
            runtime.refresh_rate,

        productType:
            runtime.product_type,

        runtimeMode:
            runtime.runtime_mode,

        runtimeValid:
            runtime.runtime_valid,

        workflows:
            runtime.workflows,

        workflowTags:
            runtime.workflow_tags,

        primaryWorkflow:
            runtime.primary_workflow,

        workflowScore:
            runtime.workflow_score,

        realityLabels:
            runtime.reality_labels,

        realityScores:
            runtime.reality_scores,

        semanticGraph:
            runtime.semantic_graph,

        semanticGroups:
            runtime.semantic_groups,

        semanticLabels:
            runtime.semantic_labels,

        normalizedTokens:
            runtime.normalized_tokens,

        semanticAttributes:
            runtime.semantic_attributes,

        adaptiveRuntime:
            runtime.adaptive_runtime,

        semanticVersion:
            runtime.semantic_version,

        semanticAuthority:
            runtime.semantic_authority,

        realityWorkflowTags:
            runtime.reality_workflow_tags,

    }

}

/* ============================================================================
🔥 Related Intent Projection
============================================================================ */

function projectRelatedIntent(
    intent: ProductRelatedIntent,
): ProjectedRelatedIntent {

    return {

        slug:
            intent.slug,

        title:
            intent.title,

        description:
            intent.description,

    }

}

/* ============================================================================
🔥 Semantic Runtime Projection
============================================================================ */

function projectSemanticRuntime(
    runtime: ProductSemanticRuntime,
): ProjectedSemanticRuntime {

    return {

        semanticLabels:
            runtime.semantic_labels,

        presentation:
            runtime.presentation,

        workflowTags:
            runtime.workflow_tags,

        groupedAttributes:
            runtime.grouped_attributes,

        semanticSummary:
            runtime.semantic_summary,

        semanticReasons:
            runtime.semantic_reasons,

        relatedIntents:
            runtime.related_intents
                ?.map(
                    projectRelatedIntent
                ),

    }

}

/* ============================================================================
🔥 Legacy Compatibility
============================================================================ */

export const projectProductDetailRuntime =
    projectProductDetail

/* ============================================================================
🔥 Default Export
============================================================================ */

export default projectProductDetail