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
 * PURPOSE
 *
 * Adapter-side Consultation Runtime orchestration.
 *
 * Pipeline
 *
 * Frontend / Concierge
 *      ↓
 * ConsultationRequest
 *      ↓
 * Gateway
 *      ↓
 * Backend Consultation Runtime
 *      ↓
 * Normalize
 *      ↓
 * Projection
 *      ↓
 * ProjectedConsultationRuntime
 *      ↓
 * Frontend / Concierge
 *
 * Responsibilities
 *
 * ✓ Runtime Orchestration
 * ✓ Gateway Invocation
 * ✓ Runtime Normalization
 * ✓ Runtime Projection
 * ✓ Observability
 *
 * This facade does NOT:
 *
 * ✗ Resolve semantic requirements
 * ✗ Generate Semantic Groups
 * ✗ Interpret natural language
 * ✗ Merge Requirements
 * ✗ Modify previousRequirement
 * ✗ Rebuild Finder
 * ✗ Optimize Candidates
 * ✗ Generate UI Meaning
 *
 * Backend remains:
 *
 * Semantic Authority
 * Reality Authority
 * Requirement Authority
 *
 * Adapter remains:
 *
 * Translation Authority
 *
 * Concierge remains:
 *
 * Experience Authority
 *
 * ============================================================================
 */

/* ============================================================================
🔥 Gateway
============================================================================ */

import {

    fetchConsultationRuntime,

} from './gateway'

/* ============================================================================
🔥 Normalize
============================================================================ */

import {

    normalizeConsultationRuntime,

} from './normalize'

/* ============================================================================
🔥 Projection
============================================================================ */

import {

    projectConsultationRuntime,

    type ProjectedConsultationRuntime,

} from './projection'

/* ============================================================================
🔥 Contracts
============================================================================ */

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

    /* ------------------------------------------------------------------------
    Empty Runtime Protection
    ------------------------------------------------------------------------ */

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

        requirement:

            projected.requirement
                ? {

                    groups:
                        projected.requirement.groups,

                    constraints:
                        projected.requirement.constraints,

                    ready:
                        projected.requirement.ready,

                }
                : null,

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