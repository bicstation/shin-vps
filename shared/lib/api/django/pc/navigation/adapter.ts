// ============================================================================
// FILE:
// /shared/lib/api/django/pc/navigation/adapter.ts
// Copyright (c) 2024 Shin Corporation.
// All rights reserved.
// ============================================================================

/**
 * ============================================================================
 * SHIN CORE LINX
 * Navigation Projection Layer V2
 * ============================================================================
 *
 * PURPOSE
 *
 * Backend Runtime
 *
 * ↓
 *
 * Frontend Projection
 *
 * IMPORTANT
 *
 * Backend remains:
 *
 * Semantic Authority
 *
 * Adapter remains:
 *
 * Projection Authority
 *
 * Projection SHALL
 *
 * ✓ Project Runtime
 * ✓ Project Intent
 * ✓ Preserve Meaning
 *
 * Projection SHALL NOT
 *
 * ✗ Generate Meaning
 * ✗ Generate Runtime
 * ✗ Generate Authority
 * ✗ Generate UI Logic
 *
 * ============================================================================
 */

import type {

    NavigationRuntimeContract,
    NavigationRuntimeItem,
    NavigationAttribute,

} from './contracts'

/* ============================================================================
🔥 Projected Runtime
============================================================================ */

export interface NavigationProjectedRuntime {

    header: {

        title: string

        subtitle: string

        description: string
    }

    summary: {

        total: number
    }

    intents: NavigationIntent[]
}

/* ============================================================================
🔥 Projected Intent
============================================================================ */

export interface NavigationIntent {

    slug: string

    name: string

    title: string

    subtitle: string

    description: string

    type: string

    parentGroup?: string

    icon?: string

    color?: string

    sortOrder?: number | string

    productCount: number

    attributes: NavigationAttribute[]
}

/* ============================================================================
🔥 Runtime Projection
============================================================================ */

export function projectNavigationRuntime(

    runtime: NavigationRuntimeContract

): NavigationProjectedRuntime {

    const intents =

        runtime.intents ?? []

    return {

        /* ================================================================
        Header
        ================================================================ */

        header: {

            title:

                runtime.presentation?.title ?? '',

            subtitle:

                runtime.presentation?.subtitle ?? '',

            description:

                runtime.presentation?.description ?? '',
        },

        /* ================================================================
        Summary
        ================================================================ */

        summary: {

            total:

                intents.length,
        },

        /* ================================================================
        Intents
        ================================================================ */

        intents:

            intents.map(

                projectNavigationIntent
            ),
    }

}

/* ============================================================================
🔥 Intent Projection
============================================================================ */

export function projectNavigationIntent(

    runtime: NavigationRuntimeItem

): NavigationIntent {

    return {

        slug:

            runtime.slug,

        name:

            runtime.name,

        title:

            runtime.title ?? '',

        subtitle:

            runtime.subtitle ?? '',

        description:

            runtime.description ?? '',

        type:

            runtime.type,

        parentGroup:

            runtime.parent_group,

        icon:

            runtime.icon,

        color:

            runtime.color,

        sortOrder:

            runtime.sort_order,

        productCount:

            runtime.product_count ?? 0,

        attributes:

            runtime.attributes ?? [],
    }

}

/* ============================================================================
🔥 Default Export
============================================================================ */

export default projectNavigationRuntime