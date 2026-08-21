// ============================================================================
// FILE:
// /shared/lib/api/django/pc/consultation/gateway.ts
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
 * ✓ Observability
 *
 * Gateway SHALL NOT
 *
 * ✗ Generate Meaning
 * ✗ Resolve Semantic Requirements
 * ✗ Rebuild Finder
 * ✗ Optimize Candidates
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
🔥 Fetch Consultation Runtime
============================================================================ */

export async function fetchConsultationRuntime(

    request: ConsultationRequest,

): Promise<ConsultationRuntimeContract | null> {

    const endpoint =

        buildEndpoint(

            CONSULTATION_ENDPOINT

        )

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
            request,
            null,
            2
        )
    )

    console.log(
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
    )

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
                        request
                    ),

            }

        )

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