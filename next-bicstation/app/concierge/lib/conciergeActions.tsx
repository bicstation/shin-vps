// ============================================================================
// FILE:
// /app/concierge/lib/conciergeActions.tsx
// Copyright (c) 2026 Shin Corporation.
// ============================================================================

'use client'

/* ============================================================================
🔥 Intent Adapter
============================================================================ */

import {
    resolveIntent,
} from '@/shared/lib/api/django/pc/intent'

import type {
    IntentRuntime,
} from '@/shared/lib/api/django/pc/intent'

/* ============================================================================
🔥 Finder Runtime
============================================================================ */

import {
    getFinderRuntime,
} from '@/shared/lib/api/django/pc/finder'

/* ============================================================================
🔥 Finder Request
============================================================================ */

import type {
    FinderRequest,
} from '@/shared/lib/api/django/pc/finder/contracts'

/* ============================================================================
🔥 Finder Projection
============================================================================ */

import type {
    ProjectedFinderRuntime,
} from '@/shared/lib/api/django/pc/finder/projection'

/* ============================================================================
🔥 Concierge Runtime Contract
============================================================================ */

export interface ConciergeRuntimeContract {

    intent:
        IntentRuntime

    finder:
        ProjectedFinderRuntime
        | null

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
    STEP 1
    Japanese Text
        ↓
    Intent Adapter
        ↓
    Backend Intent Runtime
    ======================================================================== */

    const intent =
        await resolveIntent(
            normalizedMessage,
        )

    /* ========================================================================
    STEP 2
    Unknown Intent
    ======================================================================== */

    if (!intent.intent) {

        return {

            intent,

            finder:
                null,

            ready:
                true,

        }
    }

    /* ========================================================================
    STEP 3
    Backend Resolved Intent
        ↓
    Finder Request
    ======================================================================== */

    const request:
        FinderRequest = {

        groups:
            intent.matched_groups,

    }

    /* ========================================================================
    STEP 4
    Existing Finder Runtime
    ======================================================================== */

    const finder =
        await getFinderRuntime(
            request,
        )

    /* ========================================================================
    STEP 5
    Concierge Runtime
    ======================================================================== */

    return {

        intent,

        finder,

        ready:
            true,

    }
}