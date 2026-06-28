// ============================================================================
// FILE:
// /app/ranking/[slug]/observatory/types.ts
// Copyright (c) 2024 Shin Corporation.
// All rights reserved.
// ============================================================================

/* ============================================================================
🔥 Runtime Coverage
============================================================================ */

export interface RuntimeCoverageItem {

    label: string

    value:

        string

        | number

        | boolean

}

/* ============================================================================
🔥 Runtime Consumption
============================================================================ */

export interface RuntimeConsumptionItem {

    runtime: string

    available: boolean

    consumers: string[]

}

/* ============================================================================
🔥 Runtime Diagnostics
============================================================================ */

export type RuntimeDiagnosticLevel =

    'OK'

    | 'INFO'

    | 'WARNING'

    | 'ERROR'

export interface RuntimeDiagnosticItem {

    level: RuntimeDiagnosticLevel

    title: string

    message: string

}

/* ============================================================================
🔥 Runtime Inspector Section
============================================================================ */

export interface RuntimeInspectorSection {

    title: string

    description?: string

}

/* ============================================================================
🔥 Runtime Inspector Props
============================================================================ */

export interface RuntimeInspectorProps {

    enabled?: boolean

}