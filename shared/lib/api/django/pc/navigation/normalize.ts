// ============================================================================
// FILE:
// /shared/lib/api/django/pc/navigation/normalize.ts
// Copyright (c) 2026 Shin Corporation.
// All rights reserved.
// ============================================================================

/**
 * ============================================================================
 * SHIN CORE LINX
 * Navigation Runtime Normalize
 * ============================================================================
 *
 * PURPOSE
 *
 * Backend Runtime
 *      ↓
 * Runtime Contract
 *
 * Normalize Responsibilities
 *
 * ✓ Preserve Backend Reality
 * ✓ Guarantee Runtime Contract
 * ✓ Null Safety
 * ✓ Array Safety
 * ✓ Preserve Raw Runtime
 *
 * Normalize SHALL NOT
 *
 * ✗ Generate Meaning
 * ✗ Generate Presentation
 * ✗ Generate Authority
 * ✗ Generate UI
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
🔥 Normalize Runtime
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

        /* --------------------------------------------------------------------
        Raw Backup
        -------------------------------------------------------------------- */

        raw:

            runtime ?? null,

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