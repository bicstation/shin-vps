// ============================================================================
// FILE:
// /shared/lib/api/django/pc/consultation/runtime.ts
// Copyright (c) 2026 Shin Corporation.
// All rights reserved.
// ============================================================================

/**
 * ============================================================================
 * SHIN CORE LINX
 * PC Consultation Runtime Facade
 * ============================================================================
 *
 * Responsibilities
 *
 * Gateway
 *      ↓
 * Normalize
 *      ↓
 * Projection
 *
 * Consultation Runtime is an Adapter-side orchestration facade.
 *
 * It does NOT:
 *
 * ✗ Resolve semantic requirements
 * ✗ Generate Semantic Groups
 * ✗ Rebuild Finder
 * ✗ Optimize Candidates
 *
 * Backend remains:
 *
 * Semantic / Reality Authority
 *
 * Adapter remains:
 *
 * Translation Authority
 *
 * ============================================================================
 */

import {

    fetchConsultationRuntime,

} from './gateway'

import {

    normalizeConsultationRuntime,

} from './normalize'

import {

    projectConsultationRuntime,

    type ProjectedConsultationRuntime,

} from './projection'

import type {

    ConsultationRequest,

} from './contracts'

/* ============================================================================
🔥 Runtime Facade
============================================================================ */

export async function getConsultationRuntime(

    request: ConsultationRequest,

): Promise<ProjectedConsultationRuntime> {

    /* ------------------------------------------------------------------------
    Gateway
    ------------------------------------------------------------------------ */

    const runtime =

        await fetchConsultationRuntime(

            request

        )

    if (!runtime) {

        console.warn(
            '⚠️ CONSULTATION RUNTIME EMPTY'
        )

        return projectConsultationRuntime(

            normalizeConsultationRuntime()

        )

    }

    /* ------------------------------------------------------------------------
    Normalize
    ------------------------------------------------------------------------ */

    const normalized =

        normalizeConsultationRuntime(

            runtime

        )

    /* ------------------------------------------------------------------------
    Projection
    ------------------------------------------------------------------------ */

    const projected =

        projectConsultationRuntime(

            normalized

        )

    /* ------------------------------------------------------------------------
    Observability
    ------------------------------------------------------------------------ */

    console.log(
        '🔥 CONSULTATION RUNTIME READY'
    )

    console.log({

        resultCount:
            projected.summary.resultCount,

        groupCount:
            projected.summary.groupCount,

        attributeCount:
            projected.summary.attributeCount,

        filterCount:
            projected.summary.filterCount,

        hasResult:
            projected.summary.hasResult,

        ready:
            projected.ready,

    })

    return projected

}

/* ============================================================================
🔥 Legacy Compatibility
============================================================================ */

export const fetchProjectedConsultationRuntime =

    getConsultationRuntime

/* ============================================================================
🔥 Default Export
============================================================================ */

export default getConsultationRuntime