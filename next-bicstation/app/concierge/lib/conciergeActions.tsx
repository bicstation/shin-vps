'use client'

/* ============================================================================
🔥 Consultation Runtime
============================================================================ */

import {
    getConsultationRuntime,
} from '@/shared/lib/api/django/pc/consultation'

import type {
    ConsultationRequirement,
} from '@/shared/lib/api/django/pc/consultation/contracts'

import type {
    ProjectedConsultationRuntime,
} from '@/shared/lib/api/django/pc/consultation/projection'

/* ============================================================================
🔥 Concierge Runtime Contract
============================================================================ */

export interface ConciergeRuntimeContract {

    message:
    string

    consultation:
    ProjectedConsultationRuntime

    ready:
    boolean

}

/* ============================================================================
🔥 Execute Concierge
============================================================================ */

export async function executeConcierge(

    message: string,

    previousRequirement:
        ConsultationRequirement
        | null = null,

): Promise<ConciergeRuntimeContract> {

    const normalizedMessage =
        message.trim()

    if (!normalizedMessage) {

        throw new Error(
            'Concierge message is empty.',
        )

    }

    /* ========================================================================
    Consultation Request
    ========================================================================

    Conversation

        Previous Requirement
                ↓
        Current User Message
                ↓
        Consultation Adapter
                ↓
        Backend Consultation Runtime

    Concierge does NOT interpret
    or modify the Requirement.
    ======================================================================== */

    const consultation =
        await getConsultationRuntime({

            message:
                normalizedMessage,

            previousRequirement,

        })

    /* ========================================================================
    Concierge Runtime
    ======================================================================== */

    return {

        message:
            normalizedMessage,

        consultation,

        ready:
            consultation.ready,

    }

}

/* ============================================================================
🔥 Default Export
============================================================================ */

export default executeConcierge