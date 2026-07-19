// ============================================================================
// FILE:
// /shared/lib/api/django/pc/products/projection.ts
// Copyright (c) 2026 Shin Corporation.
// All rights reserved.
// ============================================================================

/**
 * ============================================================================
 * SHIN CORE LINX
 * Products Projection
 * ============================================================================
 *
 * PURPOSE
 *
 * Translate the Products Backend Contract into a lightweight
 * Frontend View Model.
 *
 * Backend JSON
 *      ↓
 * Normalize
 *      ↓
 * Products Backend Contract
 *      ↓
 * Projection
 *      ↓
 * Products View Model
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
    ProductsRuntimeContract,
    ProductsData,
    PCProductItem,
} from './contracts'

/* ============================================================================
🔥 Products View Model
============================================================================ */

export interface ProjectedProductsRuntime {

    data: ProjectedProductsData

}

/* ============================================================================
🔥 Products Data View Model
============================================================================ */

export interface ProjectedProductsData {

    count: number

    page: number

    pageSize: number

    sort: string

    search: string | null

    hasNext: boolean

    products: ProjectedProduct[]

}

/* ============================================================================
🔥 Product View Model
============================================================================ */

export interface ProjectedProduct {

    id?: number

    uniqueId: string

    sitePrefix?: string

    name: string

    maker?: string

    description?: string

    imageUrl?: string

    url?: string

    affiliateUrl?: string

    price?: number

    cpuModel?: string

    gpuModel?: string

    memoryGb?: number

    storageGb?: number

    semanticScore?: number

    semanticRole?: string

    semanticWeight?: number

    recommendationReason?: string

    confidence?: number

    groupedAttributes?: PCProductItem['grouped_attributes']

    createdAt?: string

    updatedAt?: string

}

/* ============================================================================
🔥 Projection
============================================================================ */

export function projectProducts(
    contract: ProductsRuntimeContract,
): ProjectedProductsRuntime {

    return {

        data: projectData(contract.data),

    }

}

/* ============================================================================
🔥 Data Projection
============================================================================ */

function projectData(
    data: ProductsData,
): ProjectedProductsData {

    return {

        count: data.count,

        page: data.page,

        pageSize: data.page_size,

        sort: data.sort,

        search: data.search,

        hasNext: data.has_next,

        products: data.products.map(projectProduct),

    }

}

/* ============================================================================
🔥 Product Projection
============================================================================ */

function projectProduct(
    product: PCProductItem,
): ProjectedProduct {

    return {

        id: product.id,

        uniqueId: product.unique_id,

        sitePrefix: product.site_prefix,

        name: product.name,

        maker: product.maker,

        description: product.description,

        imageUrl: product.image_url,

        url: product.url,

        affiliateUrl: product.affiliate_url,

        price: product.price,

        cpuModel: product.cpu_model,

        gpuModel: product.gpu_model,

        memoryGb: product.memory_gb,

        storageGb: product.storage_gb,

        semanticScore: product.semantic_score,

        semanticRole: product.semantic_role,

        semanticWeight: product.semantic_weight,

        recommendationReason: product.recommendation_reason,

        confidence: product.confidence,

        groupedAttributes: product.grouped_attributes,

        createdAt: product.created_at,

        updatedAt: product.updated_at,

    }

}

/* ============================================================================
🔥 Legacy Compatibility
============================================================================ */

export const projectProductsRuntime = projectProducts

/* ============================================================================
🔥 Default Export
============================================================================ */

export default projectProducts