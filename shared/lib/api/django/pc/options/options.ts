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
🔥 Fetch Catalog Options Runtime
============================================================================ */

export async function fetchCatalogOptions(
): Promise<CatalogOptionsRuntimeContract> {

    const endpoint = buildEndpoint(
        OPTIONS_ENDPOINT
    )

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🔥 FETCH CATALOG OPTIONS')
    console.log({ endpoint })
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    const payload =
        await safeFetch<CatalogOptionsRuntimeContract>(
            endpoint
        )

    console.log('🔥 OPTIONS RAW', payload)

    if (!payload) {

        console.warn('⚠️ OPTIONS EMPTY')

        return normalizeCatalogOptions()

    }

    const options =
        normalizeCatalogOptions(payload)

    console.log('🔥 OPTIONS CONTRACT', {

        maker:
            options.options.maker.length,

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

    })

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

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