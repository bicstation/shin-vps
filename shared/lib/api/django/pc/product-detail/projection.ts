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
 * PURPOSE
 *
 * Translate the Product Detail Backend Contract into a lightweight
 * Frontend View Model.
 *
 * Backend JSON
 *      ↓
 * Normalize
 *      ↓
 * Product Detail Backend Contract
 *      ↓
 * Projection
 *      ↓
 * Product Detail View Model
 *
 * Projection Responsibilities
 *
 * ✓ Naming Translation
 * ✓ UI Translation
 * ✓ Lightweight View Model
 *
 * Projection SHALL NOT
 *
 * ✗ Generate Meaning
 * ✗ Generate Runtime
 * ✗ Generate Authority
 * ✗ Modify Backend Reality
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

import type {

    ProductDetailRuntimeContract,
    ProductDetail,
    CompiledRuntime,
    ProductSemanticRuntime,

} from './contracts'

/* ============================================================================
🔥 Product Detail View Model
============================================================================ */

export interface ProjectedProductDetailRuntime {

    found: boolean

    product: ProjectedProduct

    compiledRuntime?: ProjectedCompiledRuntime

    semanticRuntime?: ProjectedSemanticRuntime

}

/* ============================================================================
🔥 Product View Model
============================================================================ */

export interface ProjectedProduct {

    id?: number

    uniqueId: string

    sitePrefix?: string

    maker?: string

    name: string

    description?: string

    imageUrl?: string

    url?: string

    affiliateUrl?: string

    price?: number

    stockStatus?: string

    cpuModel?: string

    gpuModel?: string

    memoryGb?: number

    storageGb?: number

    semanticScore?: number

    productType?: string

}

/* ============================================================================
🔥 Compiled Runtime View Model
============================================================================ */

export interface ProjectedCompiledRuntime {

    runtimeMode?: string

    runtimeValid?: boolean

    productType?: string

    primaryWorkflow?: string

    workflowScore?: number

    workflowTags: string[]

    semanticLabels: string[]

    semanticAttributes: string[]

    semanticGroups: string[]

    realityLabels: string[]

    realityScores?: Record<string, number>

    adaptiveRuntime?: any

}

/* ============================================================================
🔥 Semantic Runtime View Model
============================================================================ */

export interface ProjectedSemanticRuntime {

    presentation?: any

    semanticSummary?: string

    groupedAttributes?: Record<string, any[]>

    semanticReasons?: any[]

    workflowTags: string[]

    semanticLabels: string[]

    relatedIntents?: any[]

}

/* ============================================================================
🔥 Projection
============================================================================ */

export function projectProductDetail(

    contract: ProductDetailRuntimeContract

): ProjectedProductDetailRuntime {

    return {

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

    }

}

/* ============================================================================
🔥 Product Projection
============================================================================ */

function projectProduct(

    product: ProductDetail

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

        name:

            product.name,

        description:

            product.description,

        imageUrl:

            product.image_url,

        url:

            product.url,

        affiliateUrl:

            product.affiliate_url,

        price:

            product.price,

        stockStatus:

            product.stock_status,

        cpuModel:

            product.cpu_model,

        gpuModel:

            product.gpu_model,

        memoryGb:

            product.memory_gb,

        storageGb:

            product.storage_gb,

        semanticScore:

            product.semantic_score,

        productType:

            product.product_type,

    }

}

/* ============================================================================
🔥 Compiled Runtime Projection
============================================================================ */

function projectCompiledRuntime(

    runtime: CompiledRuntime

): ProjectedCompiledRuntime {

    return {

        runtimeMode:

            runtime.runtime_mode,

        runtimeValid:

            runtime.runtime_valid,

        productType:

            runtime.product_type,

        primaryWorkflow:

            runtime.primary_workflow,

        workflowScore:

            runtime.workflow_score,

        workflowTags:

            runtime.workflow_tags ?? [],

        semanticLabels:

            runtime.semantic_labels ?? [],

        semanticAttributes:

            runtime.semantic_attributes ?? [],

        semanticGroups:

            runtime.semantic_groups ?? [],

        realityLabels:

            runtime.reality_labels ?? [],

        realityScores:

            runtime.reality_scores,

        adaptiveRuntime:

            runtime.adaptive_runtime,

    }

}

/* ============================================================================
🔥 Semantic Runtime Projection
============================================================================ */

function projectSemanticRuntime(

    runtime: ProductSemanticRuntime

): ProjectedSemanticRuntime {

    return {

        presentation:

            runtime.presentation,

        semanticSummary:

            runtime.semantic_summary,

        groupedAttributes:

            runtime.grouped_attributes,

        semanticReasons:

            runtime.semantic_reasons,

        workflowTags:

            runtime.workflow_tags ?? [],

        semanticLabels:

            runtime.semantic_labels ?? [],

        relatedIntents:

            runtime.related_intents,

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