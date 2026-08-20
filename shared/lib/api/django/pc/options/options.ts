// ============================================================================
// FILE:
// /shared/lib/api/django/pc/options/options.ts
// Copyright (c) 2026 Shin Corporation.
// All rights reserved.
// ============================================================================

import type { CatalogOptionsRuntimeContract } from './contracts'
import { buildEndpoint } from '../utils/buildEndpoint'
import { safeFetch } from '../utils/safeFetch'
import { normalizeCatalogOptions } from './normalize'

/* ============================================================================
🔥 Endpoint
============================================================================ */

const OPTIONS_ENDPOINT = '/pc/options/'

/* ============================================================================
🔥 Catalog Options Filters
============================================================================ */

export type CatalogOptionsFilters = {

    maker?: string

    brand?: string

    series?: string

    cpu?: string

    gpu?: string

    memory?: string | number

    storage?: string | number

}

/* ============================================================================
🔥 Fetch Catalog Options Runtime
============================================================================ */

export async function fetchCatalogOptions(
    filters: CatalogOptionsFilters = {},
): Promise<CatalogOptionsRuntimeContract> {

    const params =
        new URLSearchParams()

    /* ------------------------------------------------------------------------
    Maker
    ------------------------------------------------------------------------ */

    if (filters.maker !== undefined) {

        params.set(
            'maker',
            String(filters.maker),
        )

    }

    /* ------------------------------------------------------------------------
    Brand
    ------------------------------------------------------------------------ */

    if (filters.brand !== undefined) {

        params.set(
            'brand',
            String(filters.brand),
        )

    }

    /* ------------------------------------------------------------------------
    Series
    ------------------------------------------------------------------------ */

    if (filters.series !== undefined) {

        params.set(
            'series',
            String(filters.series),
        )

    }

    /* ------------------------------------------------------------------------
    CPU
    ------------------------------------------------------------------------ */

    if (filters.cpu !== undefined) {

        params.set(
            'cpu',
            String(filters.cpu),
        )

    }

    /* ------------------------------------------------------------------------
    GPU
    ------------------------------------------------------------------------ */

    if (filters.gpu !== undefined) {

        params.set(
            'gpu',
            String(filters.gpu),
        )

    }

    /* ------------------------------------------------------------------------
    Memory
    ------------------------------------------------------------------------ */

    if (filters.memory !== undefined) {

        params.set(
            'memory',
            String(filters.memory),
        )

    }

    /* ------------------------------------------------------------------------
    Storage
    ------------------------------------------------------------------------ */

    if (filters.storage !== undefined) {

        params.set(
            'storage',
            String(filters.storage),
        )

    }

    /* ------------------------------------------------------------------------
    Endpoint
    ------------------------------------------------------------------------ */

    const query =
        params.toString()

    const endpoint =
        buildEndpoint(
            query
                ? `${OPTIONS_ENDPOINT}?${query}`
                : OPTIONS_ENDPOINT
        )

    console.log(
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
    )

    console.log(
        '🔥 FETCH CATALOG OPTIONS'
    )

    console.log({

        endpoint,

        filters,

    })

    console.log(
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
    )

    /* ------------------------------------------------------------------------
    Fetch
    ------------------------------------------------------------------------ */

    const payload =
        await safeFetch<CatalogOptionsRuntimeContract>(
            endpoint
        )

    console.log(
        '🔥 OPTIONS RAW',
        payload
    )

    /* ------------------------------------------------------------------------
    Empty
    ------------------------------------------------------------------------ */

    if (!payload) {

        console.warn(
            '⚠️ OPTIONS EMPTY'
        )

        return normalizeCatalogOptions()

    }

    /* ------------------------------------------------------------------------
    Normalize
    ------------------------------------------------------------------------ */

    const options =
        normalizeCatalogOptions(
            payload
        )

    /* ------------------------------------------------------------------------
    Contract Observability
    ------------------------------------------------------------------------ */

    console.log(
        '🔥 OPTIONS CONTRACT',
        {

            maker:
                options.options.maker.length,

            brand:
                options.options.brand.length,

            series:
                options.options.series.length,

            cpu:
                options.options.cpu.length,

            gpu:
                options.options.gpu.length,

            memory:
                options.options.memory.length,

            storage:
                options.options.storage.length,

            semantic_schema_version:
                options.semantic_schema_version,

            authority_version:
                options.authority_version,

            semantic_authority:
                options.semantic_authority,

            ready:
                options.ready,

        }
    )

    console.log(
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
    )

    return options

}

/* ============================================================================
🔥 Legacy Compatibility
============================================================================ */

export const fetchCatalogOptionsRuntime =
    fetchCatalogOptions

/* ============================================================================
🔥 Default Export
============================================================================ */

export default fetchCatalogOptions