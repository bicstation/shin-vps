// ============================================================================
// FILE:
// /shared/lib/api/django/pc/options/normalize.ts
// Copyright (c) 2026 Shin Corporation.
// All rights reserved.
// ============================================================================

/**
 * ============================================================================
 * SHIN CORE LINX
 * Catalog Options Normalize
 * ============================================================================
 *
 * PURPOSE
 *
 * Convert Backend Catalog Options Runtime JSON into the
 * Canonical Catalog Options Backend Contract.
 *
 * Backend Catalog Options Runtime
 *      ↓
 * Contract Guarantee
 *      ↓
 * Catalog Options Backend Contract
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
 * ✗ Generate Options
 * ✗ Generate Authority
 * ✗ Generate UI
 * ✗ Generate Runtime
 *
 * Backend remains:
 *
 * Reality Authority
 *
 * ============================================================================
 */

import type {
    CatalogOptionsRuntimeContract,
    CatalogOptionsData,
    CatalogOptionItem,
} from './contracts'

/* ============================================================================
🔥 Normalize Catalog Options
============================================================================ */

export function normalizeCatalogOptions(
    runtime?: Partial<CatalogOptionsRuntimeContract>,
): CatalogOptionsRuntimeContract {

    return {

        /* --------------------------------------------------------------------
        Meaning
        -------------------------------------------------------------------- */

        meaning: runtime?.meaning,

        /* --------------------------------------------------------------------
        Options
        -------------------------------------------------------------------- */

        options: normalizeOptions(runtime?.options),

        /* --------------------------------------------------------------------
        Authority
        -------------------------------------------------------------------- */

        semantic_schema_version: runtime?.semantic_schema_version,

        authority_version: runtime?.authority_version,

        semantic_authority: runtime?.semantic_authority,

        ready: runtime?.ready ?? false,

    }

}

/* ============================================================================
🔥 Normalize Options
============================================================================ */

function normalizeOptions(
    options?: Partial<CatalogOptionsData>,
): CatalogOptionsData {

    return {

        maker: (options?.maker ?? []).map(normalizeOption),

        cpu: (options?.cpu ?? []).map(normalizeOption),

        gpu: (options?.gpu ?? []).map(normalizeOption),

        memory: (options?.memory ?? []).map(normalizeOption),

        storage: (options?.storage ?? []).map(normalizeOption),

    }

}

/* ============================================================================
🔥 Normalize Option
============================================================================ */

function normalizeOption(
    option: CatalogOptionItem,
): CatalogOptionItem {

    return {

        value: option.value,

        label: option.label,

        count: option.count,

    }

}

/* ============================================================================
🔥 Legacy Compatibility
============================================================================ */

export const normalizeCatalogOptionsRuntime =
    normalizeCatalogOptions

/* ============================================================================
🔥 Default Export
============================================================================ */

export default normalizeCatalogOptions