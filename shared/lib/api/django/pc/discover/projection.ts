// ============================================================================
// FILE:
// /shared/lib/api/django/pc/discover/projection.ts
// Copyright (c) 2026 Shin Corporation.
// All rights reserved.
// ============================================================================

/**
 * ============================================================================
 * SHIN CORE LINX
 * Discover Projection
 * ============================================================================
 *
 * PURPOSE
 *
 * Translate the Discover Backend Contract into a lightweight
 * Frontend View Model.
 *
 * Backend JSON
 *      ↓
 * Normalize
 *      ↓
 * Discover Backend Contract
 *      ↓
 * Projection
 *      ↓
 * Discover View Model
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
 * Semantic Authority
 *
 * Adapter remains:
 *
 * Translation Authority
 *
 * ============================================================================
 */

import type {

    DiscoverRuntimeContract,
    DiscoverSampleProduct,

} from './contracts'

/* ============================================================================
🔥 Discover View Model
============================================================================ */

export interface ProjectedDiscoverRuntime {

    found: boolean

    header: {

        title: string

        subtitle?: string

        description?: string

    }

    seo: {

        title?: string

        description?: string

        keywords?: string[]

    }

    data: {

        groupSlug: string

        groupName?: string

        presentationName?: string

        presentationDescription?: string

        productCount?: number

        aliases: string[]

        siblingGroups: ProjectedDiscoverSiblingGroup[]

    }

    products: ProjectedDiscoverProduct[]

}

/* ============================================================================
🔥 Product View Model
============================================================================ */

export interface ProjectedDiscoverProduct {

    uniqueId: string

    name: string

    maker: string

    price: number

    imageUrl: string

}

/* ============================================================================
🔥 Sibling Group View Model
============================================================================ */

export interface ProjectedDiscoverSiblingGroup {

    slug: string

    name: string

    presentationName?: string

    presentationDescription?: string

    icon?: string

    color?: string

    sortOrder?: string | number

    isCurrent: boolean

}

/* ============================================================================
🔥 Projection
============================================================================ */

export function projectDiscover(

    contract: DiscoverRuntimeContract

): ProjectedDiscoverRuntime {

    return {

        found:

            contract.found ?? false,

        header: {

            title:

                contract.presentation?.title ?? '',

            subtitle:

                contract.presentation?.subtitle,

            description:

                contract.presentation?.description,

        },

        seo: {

            title:

                contract.seo?.title,

            description:

                contract.seo?.description,

            keywords:

                contract.seo?.keywords ?? [],

        },

        data: {

            groupSlug:

                contract.data.group_slug,

            groupName:

                contract.data.group_name,

            presentationName:

                contract.data.presentation_name,

            presentationDescription:

                contract.data.presentation_description,

            productCount:

                contract.data.product_count,

            aliases:

                contract.data.aliases ?? [],

            siblingGroups:

                (contract.data.sibling_groups ?? []).map(

                    projectSiblingGroup

                ),

        },

        products:

            (contract.data.sample_products ?? []).map(

                projectProduct

            ),

    }

}

/* ============================================================================
🔥 Product Projection
============================================================================ */

function projectProduct(

    product: DiscoverSampleProduct

): ProjectedDiscoverProduct {

    return {

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

    }

}

/* ============================================================================
🔥 Sibling Projection
============================================================================ */

function projectSiblingGroup(

    sibling: NonNullable<
        DiscoverRuntimeContract['data']['sibling_groups']
    >[number]

): ProjectedDiscoverSiblingGroup {

    return {

        slug:

            sibling.group_slug,

        name:

            sibling.group_name,

        presentationName:

            sibling.presentation_name,

        presentationDescription:

            sibling.presentation_description,

        icon:

            sibling.icon,

        color:

            sibling.color,

        sortOrder:

            sibling.sort_order,

        isCurrent:

            sibling.is_current ?? false,

    }

}

/* ============================================================================
🔥 Legacy Compatibility
============================================================================ */

export const projectDiscoverRuntime =

    projectDiscover

/* ============================================================================
🔥 Default Export
============================================================================ */

export default projectDiscover