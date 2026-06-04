// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/next-bicstation/app/test/runtime/inspectors/contracts/transport.ts
// ============================================================================

/**
 * SHIN CORE LINX
 * Runtime Transport Observatory Contracts
 *
 * IMPORTANT:
 * This file defines:
 *
 * transport observability contracts
 *
 * NOT:
 *
 * transport authority
 *
 * Canonical transport authority lives in:
 *
 * runtime/transport/
 *
 * Backend remains:
 *
 * - runtime transport authority
 * - API authority
 * - transport semantics
 *
 * Frontend transport contracts exist ONLY for:
 *
 * - transport observability
 * - telemetry visualization
 * - runtime-safe inspection
 * - transport stabilization
 */

/* ============================================================================
🔥 Transport Runtime
============================================================================ */

export type TransportRuntime =

  | 'SSR'
  | 'CSR'

/* ============================================================================
🔥 Transport Method
============================================================================ */

export type TransportMethod =

  | 'GET'
  | 'POST'
  | 'PUT'
  | 'PATCH'
  | 'DELETE'

/* ============================================================================
🔥 Runtime Transport Status
============================================================================ */

export type RuntimeTransportStatus = {

  success: boolean

  status?: number | null

  status_text?: string | null

  error?: string | null

}

/* ============================================================================
🔥 Runtime Transport Timing
============================================================================ */

export type RuntimeTransportTiming = {

  started_at?: string | null

  finished_at?: string | null

  duration_ms?: number | null

  timeout_ms?: number | null

}

/* ============================================================================
🔥 Runtime Transport Request
============================================================================ */

export type RuntimeTransportRequest = {

  endpoint: string

  method?: TransportMethod

  runtime?: TransportRuntime

  cache_strategy?: string | null

  request_headers?: Record<
    string,
    string
  >

}

/* ============================================================================
🔥 Runtime Transport Response
============================================================================ */

export type RuntimeTransportResponse = {

  payload_size?: number | null

  payload_type?: string | null

  payload_keys?: string[]

  semantic_schema_version?: string | null

}

/* ============================================================================
🔥 Runtime Transport Telemetry
============================================================================ */

export type RuntimeTransportTelemetry = {

  transport_layer?: string | null

  transport_role?: string | null

  observability_enabled?: boolean

  telemetry_enabled?: boolean

  runtime_pipeline?: string | null

}

/* ============================================================================
🔥 Runtime Transport Integrity
============================================================================ */

export type RuntimeTransportIntegrity = {

  transport_safe?: boolean

  payload_safe?: boolean

  traversal_safe?: boolean

  shallow_payload?: boolean

  recursive_protection?: boolean

}

/* ============================================================================
🔥 Runtime Transport Observatory
============================================================================ */

export type RuntimeTransportObservatory =

  RuntimeTransportStatus
  &

  RuntimeTransportTiming
  &

  RuntimeTransportRequest
  &

  RuntimeTransportResponse
  &

  RuntimeTransportTelemetry
  &

  RuntimeTransportIntegrity

/* ============================================================================
🔥 Transport Inspector Props
============================================================================ */

export type TransportInspectorProps = {

  runtime: {

    endpoint?: string

    success?: boolean

    fetched_at?: string

    duration_ms?: number

    payload_size?: number

    payload_type?: string

    payload_keys?: string[]

    semantic_schema_version?: string | null

  } | null

}

/* ============================================================================
🔥 Runtime Transport Rules
============================================================================ */

/**
 * IMPORTANT:
 *
 * Frontend transport contracts:
 *
 * ❌ must NOT mutate transport meaning
 * ❌ must NOT rewrite runtime payloads
 * ❌ must NOT infer transport semantics
 * ❌ must NOT bypass runtime pipeline
 *
 * Allowed:
 *
 * ✅ transport observability
 * ✅ telemetry visualization
 * ✅ transport-safe rendering
 * ✅ runtime pipeline inspection
 */

/* ============================================================================
🔥 Default Export
============================================================================ */

export default RuntimeTransportObservatory