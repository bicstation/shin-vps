// ============================================================================
// FILE:
// /app/pc-finder/lib/finderActions.ts
// Copyright (c) 2026 Shin Corporation.
// ============================================================================

'use client'

/* ============================================================================
Adapter Runtime
============================================================================ */
import {
    fetchFinderRuntime,
} from '@/shared/lib/api/django/pc/finder/gateway'


import type {
    FinderRuntimeContract,
} from '@/shared/lib/api/django/pc/finder/contracts'



/* ============================================================================
Request
============================================================================ */

export interface FinderRequest {

    groups: string[]

    max_price?: number | null

    attributes?: string[]

}

/* ============================================================================
Execute Finder
============================================================================ */

export async function executeFinder(

    request: FinderRequest,

): Promise<FinderRuntime> {

    return await fetchFinderRuntime({

        groups:

            request.groups,

        max_price:

            request.max_price ?? null,

        attributes:

            request.attributes ?? [],

    })

}