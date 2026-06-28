// ============================================================================
// Finder Public API Entry Point V2
// ============================================================================

import {

    fetchFinderRuntime

} from './gateway'

import {

    normalizeFinder

} from './normalize'

import {

    projectFinderRuntime

} from './projection'

import type {

    FinderRuntimeContract,

    FinderRequest

} from './contracts'

/* ============================================================================
🔥 Public API
============================================================================ */

export async function getFinder(

    request: FinderRequest

) {

    /* --------------------------------
    1. FETCH (Gateway)
    -------------------------------- */
    const raw = await fetchFinderRuntime(request)

    /* --------------------------------
    2. NORMALIZE
    -------------------------------- */
    const runtime: FinderRuntimeContract =
        normalizeFinder(raw)

    /* --------------------------------
    3. PROJECT (UI)
    -------------------------------- */
    const view = projectFinderRuntime(runtime)

    /* --------------------------------
    4. RETURN
    -------------------------------- */
    return {

        raw,        // Backend Reality
        runtime,    // Safe Runtime V2
        view        // UI Ready
    }
}

/* ============================================================================
🔥 Default Export
============================================================================ */

export default getFinder