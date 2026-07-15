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

     getFinderRuntime,

} from '@/shared/lib/api/django/pc/finder'

/* ============================================================================
Types
============================================================================ */

import type {

    FinderRequest,

} from '@/shared/lib/api/django/pc/finder/contracts'

/* ============================================================================
Execute Finder
============================================================================ */

export async function executeFinder(

    request: FinderRequest,

) {

    return await  getFinderRuntime(request)

}