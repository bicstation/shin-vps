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
 */

export {

    fetchConsultationRuntime,
    fetchConsultation,

} from './gateway'

export {

    normalizeConsultationRuntime,
    normalizeConsultation,

} from './normalize'

export {

    projectConsultationRuntime,
    projectConsultation,

} from './projection'

export {

    getConsultationRuntime,
    fetchProjectedConsultationRuntime,

} from './runtime'

export type {

    ConsultationRequest,
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

export type {

    ProjectedConsultationRuntime,
    ProjectedConsultationProduct,

} from './projection'