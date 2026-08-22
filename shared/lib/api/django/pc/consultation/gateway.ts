// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/shared/lib/api/django/pc/consultation/gateway.ts
// Copyright (c) 2026 Shin Corporation.
// All rights reserved.
// ============================================================================

/**
 * ============================================================================
 * SHIN CORE LINX
 * PC Consultation Runtime Gateway
 * ============================================================================
 *
 * PURPOSE
 *
 * POST /api/pc/consultation/
 *
 * Frontend
 *      ↓
 * Gateway
 *      ↓
 * Backend Consultation Runtime
 *
 * Gateway Responsibilities
 *
 * ✓ Transport
 * ✓ HTTP Contract Translation
 * ✓ Observability
 *
 * Gateway SHALL NOT
 *
 * ✗ Generate Meaning
 * ✗ Resolve Semantic Requirements
 * ✗ Rebuild Finder
 * ✗ Optimize Candidates
 * ✗ Merge Requirements
 * ✗ Interpret Semantic Groups
 * ✗ Project Runtime
 *
 * ============================================================================
 */

import type {

    ConsultationRuntimeContract,
    ConsultationRequest,

} from './contracts'

import {

    buildEndpoint,

} from '../utils/buildEndpoint'

import {

    safeFetch,

} from '../utils/safeFetch'

/* ============================================================================
🔥 Endpoint
============================================================================ */

const CONSULTATION_ENDPOINT =

    '/pc/consultation/'

/* ============================================================================
🔥 Backend Request Contract
============================================================================ */

/**
 * Translate the Adapter Request Contract into the
 * Backend HTTP Request Contract.
 *
 * Frontend / Adapter:
 *
 * previousRequirement
 *
 * Backend:
 *
 * previous_requirement
 *
 * No semantic transformation is performed here.
 */

interface ConsultationBackendRequest {

    message: string

    previous_requirement?:

        ConsultationRequest['previousRequirement']

}

/* ============================================================================
🔥 Fetch Consultation Runtime
============================================================================ */

export async function fetchConsultationRuntime(

    request: ConsultationRequest,

): Promise<ConsultationRuntimeContract | null> {

    const endpoint =

        buildEndpoint(

            CONSULTATION_ENDPOINT

        )

    /* ------------------------------------------------------------------------
    Backend HTTP Request
    ------------------------------------------------------------------------ */

    const backendRequest:

        ConsultationBackendRequest = {

            message:
                request.message,

            ...(request.previousRequirement !== undefined

                ? {

                    previous_requirement:
                        request.previousRequirement,

                }

                : {}),

        }

    /* ------------------------------------------------------------------------
    Observability
    ------------------------------------------------------------------------ */

    console.log(
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
    )

    console.log(
        '🔥 FETCH CONSULTATION RUNTIME'
    )

    console.log(
        'ENDPOINT',
        endpoint
    )

    console.log(
        'REQUEST',
        JSON.stringify(
            backendRequest,
            null,
            2
        )
    )

    console.log(
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
    )

    /* ------------------------------------------------------------------------
    Transport
    ------------------------------------------------------------------------ */

    const payload =

        await safeFetch<ConsultationRuntimeContract>(

            endpoint,

            {

                method: 'POST',

                headers: {

                    'Content-Type':
                        'application/json',

                },

                body:

                    JSON.stringify(
                        backendRequest
                    ),

            }

        )

    /* ------------------------------------------------------------------------
    RAW Backend Runtime
    ------------------------------------------------------------------------ */

    console.log(
        '🔥 CONSULTATION RAW PAYLOAD',
        payload
    )

    return payload

}

/* ============================================================================
🔥 Legacy Compatibility
============================================================================ */

export const fetchConsultation =

    fetchConsultationRuntime

/* ============================================================================
🔥 Default Export
============================================================================ */

export default fetchConsultationRuntime