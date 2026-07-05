// ============================================================================
// FILE:
// /shared/lib/api/django/pc/navigation/normalize.ts
// Copyright (c) 2026 Shin Corporation.
// All rights reserved.
// ============================================================================

/**
 * ============================================================================
 * SHIN CORE LINX
 * Navigation Normalize
 * ============================================================================
 *
 * PURPOSE
 *
 * Convert Backend Navigation JSON into the
 * Canonical Navigation Backend Contract.
 *
 * Backend Navigation Runtime
 *      ↓
 * Contract Guarantee
 *      ↓
 * Navigation Backend Contract
 *
 * Normalize Responsibilities
 *
 * ✓ Preserve Backend Reality
 * ✓ Guarantee Contract Safety
 * ✓ Null Safety
 * ✓ Array Safety
 *
 * Normalize SHALL NOT
 *
 * ✗ Generate Meaning
 * ✗ Generate Presentation
 * ✗ Generate Authority
 * ✗ Generate UI
 * ✗ Generate Runtime
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
🔥 Normalize Navigation
============================================================================ */

export function normalizeNavigation(

    runtime?: Partial<NavigationRuntimeContract>

): NavigationRuntimeContract {

    return {

        /* --------------------------------------------------------------------
        Navigation
        -------------------------------------------------------------------- */

        intents:

            (runtime?.intents ?? []).map(

                normalizeIntent

            ),

        /* --------------------------------------------------------------------
        Authority
        -------------------------------------------------------------------- */

        semantic_schema_version:

            runtime?.semantic_schema_version,

        authority_version:

            runtime?.authority_version,

        semantic_authority:

            runtime?.semantic_authority,

        ready:

            runtime?.ready ?? false,

    }

}

/* ============================================================================
🔥 Normalize Intent
============================================================================ */

function normalizeIntent(

    intent: NavigationRuntimeItem

): NavigationRuntimeItem {

    return {

        ...intent,

        attributes:

            (intent.attributes ?? []).map(

                normalizeAttribute

            ),

        sibling_groups:

            (intent.sibling_groups ?? []).map(

                normalizeSiblingGroup

            ),

    }

}

/* ============================================================================
🔥 Normalize Attribute
============================================================================ */

function normalizeAttribute(

    attribute: NavigationAttribute

): NavigationAttribute {

    return {

        ...attribute,

    }

}

/* ============================================================================
🔥 Normalize Sibling Group
============================================================================ */

function normalizeSiblingGroup(

    sibling: NavigationSiblingGroup

): NavigationSiblingGroup {

    return {

        ...sibling,

    }

}

/* ============================================================================
🔥 Legacy Compatibility
============================================================================ */

export const normalizeNavigationRuntime =

    normalizeNavigation

/* ============================================================================
🔥 Default Export
============================================================================ */

export default normalizeNavigation