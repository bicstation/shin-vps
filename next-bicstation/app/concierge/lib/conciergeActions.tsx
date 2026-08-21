'use client'

/* ============================================================================
🔥 Consultation Runtime
============================================================================ */

import {
    getConsultationRuntime,
} from '@/shared/lib/api/django/pc/consultation'

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
    ======================================================================== */

    const consultation =
        await getConsultationRuntime({

            message:
                normalizedMessage,

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