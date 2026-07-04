// ============================================================================
// FILE:
// /shared/lib/api/django/pc/navigation/projection.ts
// Copyright (c) 2026 Shin Corporation.
// All rights reserved.
// ============================================================================

/**
 * ============================================================================
 * SHIN CORE LINX
 * Navigation Projection
 * ============================================================================
 *
 * PURPOSE
 *
 * Backend Reality
 *      ↓
 * Frontend Projection
 *
 * Projection Responsibilities
 *
 * ✓ UI Translation
 * ✓ Naming Translation
 * ✓ Lightweight View Model
 *
 * Projection SHALL NOT
 *
 * ✗ Generate Meaning
 * ✗ Generate Runtime
 * ✗ Generate Authority
 *
 * Backend remains:
 *
 * Semantic Authority
 *
 * ============================================================================
 */

import type {

    NavigationRuntimeContract,
    NavigationRuntimeItem,
    NavigationAttribute,
    NavigationSiblingGroup,

} from './contracts'

/* ============================================================================
🔥 Projected Runtime
============================================================================ */

export interface ProjectedNavigationRuntime {

    intents: ProjectedNavigationIntent[]

}

/* ============================================================================
🔥 Projected Intent
============================================================================ */

export interface ProjectedNavigationIntent {

    slug: string

    name: string

    title?: string

    subtitle?: string

    description?: string

    type: string

    parentGroup?: string

    icon?: string

    color?: string

    sortOrder?: string | number

    productCount?: number

    presentationName?: string

    presentationDescription?: string

    attributes: ProjectedNavigationAttribute[]

    siblingGroups: ProjectedNavigationSiblingGroup[]

}

/* ============================================================================
🔥 Projected Attribute
============================================================================ */

export interface ProjectedNavigationAttribute {

    slug: string

    name: string

    title?: string

    subtitle?: string

    description?: string

    type?: string

    icon?: string

    color?: string

    semanticRole?: string

    semanticWeight?: string | number

    rankingEnabled: boolean

}

/* ============================================================================
🔥 Projected Sibling Group
============================================================================ */

export interface ProjectedNavigationSiblingGroup {

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

export function projectNavigation(

    runtime: NavigationRuntimeContract

): ProjectedNavigationRuntime {

    return {

        intents:

            (runtime.intents ?? []).map(

                projectIntent

            ),

    }

}

/* ============================================================================
🔥 Intent Projection
============================================================================ */

function projectIntent(

    intent: NavigationRuntimeItem

): ProjectedNavigationIntent {

    return {

        slug:

            intent.slug,

        name:

            intent.name,

        title:

            intent.title,

        subtitle:

            intent.subtitle,

        description:

            intent.description,

        type:

            intent.type,

        parentGroup:

            intent.parent_group,

        icon:

            intent.icon,

        color:

            intent.color,

        sortOrder:

            intent.sort_order,

        productCount:

            intent.product_count,

        presentationName:

            intent.presentation_name,

        presentationDescription:

            intent.presentation_description,

        attributes:

            (intent.attributes ?? []).map(

                projectAttribute

            ),

        siblingGroups:

            (intent.sibling_groups ?? []).map(

                projectSiblingGroup

            ),

    }

}

/* ============================================================================
🔥 Attribute Projection
============================================================================ */

function projectAttribute(

    attribute: NavigationAttribute

): ProjectedNavigationAttribute {

    return {

        slug:

            attribute.slug,

        name:

            attribute.name,

        title:

            attribute.title,

        subtitle:

            attribute.subtitle,

        description:

            attribute.description,

        type:

            attribute.type,

        icon:

            attribute.icon,

        color:

            attribute.color,

        semanticRole:

            attribute.semantic_role,

        semanticWeight:

            attribute.semantic_weight,

        rankingEnabled:

            attribute.is_ranking_enabled === true ||

            attribute.is_ranking_enabled === 'TRUE',

    }

}

/* ============================================================================
🔥 Sibling Projection
============================================================================ */

function projectSiblingGroup(

    sibling: NavigationSiblingGroup

): ProjectedNavigationSiblingGroup {

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

export const projectNavigationRuntime =

    projectNavigation

/* ============================================================================
🔥 Default Export
============================================================================ */

export default projectNavigation