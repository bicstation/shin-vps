// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/next-bicstation/app/test/runtime/inspectors/semantic/shared/RawJsonInspector.tsx
// ============================================================================

'use client'

/**
 * ============================================================================
 * SHIN CORE LINX
 * Raw JSON Inspector
 * ============================================================================
 *
 * PURPOSE:
 *
 * Raw runtime payload observability
 *
 * IMPORTANT:
 *
 * This component exists for:
 *
 * backend authority payload inspection
 *
 * NOT:
 *
 * payload normalization
 * semantic transformation
 * runtime mutation
 *
 * ============================================================================
 */

/* ============================================================================
🔥 Shared
============================================================================ */

import InspectorSection
from './InspectorSection'

/* ============================================================================
🔥 Props
============================================================================ */

type RawJsonInspectorProps = {

  title?: string

  description?: string

  badge?: string

  payload?: any
}

/* ============================================================================
🔥 Safe JSON Stringify
============================================================================ */

function safeStringify(

  payload: any

): string {

  try {

    return JSON.stringify(

      payload,

      null,

      2
    )

  } catch (

    error

  ) {

    console.error(

      '🔥 RAW JSON STRINGIFY FAILURE',

      error
    )

    return JSON.stringify(

      {

        error:
          'Failed to stringify runtime payload',
      },

      null,

      2
    )
  }
}

/* ============================================================================
🔥 Raw JSON Inspector
============================================================================ */

export default function RawJsonInspector({

  title =
    'Raw Runtime Payload',

  description =
    'Backend authority payload observability and raw semantic runtime inspection.',

  badge =
    'runtime/raw-json',

  payload,

}: RawJsonInspectorProps) {

  /* ==========================================================================
  🔥 JSON Payload
  ========================================================================== */

  const json =

    safeStringify(
      payload
    )

  /* ==========================================================================
  🔥 Payload Stats
  ========================================================================== */

  const payloadSize =

    new Blob([json]).size

  const payloadType =

    typeof payload

  const payloadKeys =

    payload
    && typeof payload === 'object'

      ? Object.keys(payload)

      : []

  /* ==========================================================================
  🔥 Runtime Debug
  ========================================================================== */

  console.log(

    '🧾 RAW JSON INSPECTOR',

    {

      payloadType,

      payloadSize,

      payloadKeys:

        payloadKeys.length,
    }
  )

  /* ==========================================================================
  🔥 Render
  ========================================================================== */

  return (

    <InspectorSection

      title={title}

      description={description}

      badge={badge}

    >

      {/* ================================================================
      🔥 Payload Metadata
      ================================================================ */}

      <div className="grid gap-4 md:grid-cols-3">

        <div className="rounded-xl border border-zinc-800 bg-black p-4">

          <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">

            Payload Type

          </div>

          <div className="mt-3 text-sm text-zinc-100">

            {payloadType}

          </div>

        </div>

        <div className="rounded-xl border border-zinc-800 bg-black p-4">

          <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">

            Payload Size

          </div>

          <div className="mt-3 text-sm text-zinc-100">

            {payloadSize.toLocaleString()} bytes

          </div>

        </div>

        <div className="rounded-xl border border-zinc-800 bg-black p-4">

          <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">

            Payload Keys

          </div>

          <div className="mt-3 text-sm text-zinc-100">

            {payloadKeys.length}

          </div>

        </div>

      </div>

      {/* ================================================================
      🔥 Raw JSON
      ================================================================ */}

      <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-black">

        <div className="border-b border-zinc-800 px-4 py-3 text-xs uppercase tracking-[0.2em] text-cyan-400">

          Raw Runtime JSON

        </div>

        <pre className="overflow-x-auto p-6 font-mono text-xs leading-7 text-cyan-300">

{json}

        </pre>

      </div>

    </InspectorSection>
  )
}