// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/shared/lib/api/django/pc/consultation/index.ts
// Copyright (c) 2026 Shin Corporation.
// All rights reserved.
// ============================================================================

/**
 * ============================================================================
 * SHIN CORE LINX
 * PC Consultation Adapter
 * ============================================================================
 *
 * PURPOSE
 *
 * Public Adapter entry point for the Consultation Runtime.
 *
 * Backend remains:
 *
 * Semantic Authority
 * Reality Authority
 *
 * Adapter remains:
 *
 * Translation Authority
 *
 * ============================================================================
 */

/* ============================================================================
🔥 Gateway
============================================================================ */

export {

    fetchConsultationRuntime,

    fetchConsultation,

} from './gateway'

/* ============================================================================
🔥 Normalize
============================================================================ */

export {

    normalizeConsultationRuntime,

    normalizeConsultation,

} from './normalize'

/* ============================================================================
🔥 Projection
============================================================================ */

export {

    projectConsultationRuntime,

    projectConsultation,

} from './projection'

/* ============================================================================
🔥 Runtime
============================================================================ */

export {

    getConsultationRuntime,

    fetchProjectedConsultationRuntime,

} from './runtime'

/* ============================================================================
🔥 Backend Contracts
============================================================================ */

export type {

    ConsultationRequest,

    ConsultationRequirement,

    ConsultationMeaning,

    ConsultationPresentation,

    ConsultationSEO,

    ConsultationQuery,

    ConsultationSummary,

    ConsultationProduct,

    ConsultationData,

    ConsultationRuntimeContract,

    ConsultationRuntime,

    ConsultationRuntimeResponse,

} from './contracts'

/* ============================================================================
🔥 Projected Contracts
============================================================================ */

export type {

    ProjectedConsultationRuntime,

    ProjectedConsultationProduct,

} from './projection'