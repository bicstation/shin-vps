// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/next-bicstation/app/test/runtime/inspectors/semantic/shared/InspectorCard.tsx
// ============================================================================

'use client'

/**
 * ============================================================================
 * SHIN CORE LINX
 * Inspector Card
 * ============================================================================
 *
 * PURPOSE:
 *
 * Shared observability primitive
 *
 * IMPORTANT:
 *
 * This component exists for:
 *
 * runtime-safe inspector rendering
 *
 * NOT:
 *
 * semantic normalization
 * runtime mutation
 * topology interpretation
 *
 * ============================================================================
 */

/* ============================================================================
🔥 Props
============================================================================ */

type InspectorCardProps = {

  title: string

  value?: any

  description?: string

  badge?: string

  mono?: boolean

  emptyLabel?: string
}

/* ============================================================================
🔥 Normalize Display Value
============================================================================ */

function normalizeDisplayValue(

  value: any,

  emptyLabel = '-'

): string {

  // ================================================================
  // Boolean
  // ================================================================

  if (

    typeof value ===
    'boolean'

  ) {

    return value
      ? 'TRUE'
      : 'FALSE'
  }

  // ================================================================
  // Empty
  // ================================================================

  if (

    value === undefined
    || value === null
    || value === ''

  ) {

    return emptyLabel
  }

  // ================================================================
  // Object
  // ================================================================

  if (

    typeof value ===
    'object'

  ) {

    try {

      return JSON.stringify(
        value,
        null,
        2
      )

    } catch {

      return '[object]'
    }
  }

  // ================================================================
  // Primitive
  // ================================================================

  return String(value)
}

/* ============================================================================
🔥 Inspector Card
============================================================================ */

export default function InspectorCard({

  title,

  value,

  description,

  badge,

  mono = false,

  emptyLabel = '-',

}: InspectorCardProps) {

  /* ==========================================================================
  🔥 Display Value
  ========================================================================== */

  const displayValue =

    normalizeDisplayValue(
      value,
      emptyLabel
    )

  /* ==========================================================================
  🔥 Runtime Debug
  ========================================================================== */

  console.log(

    '🧩 INSPECTOR CARD',

    {

      title,

      badge,

      mono,

      valueType:

        typeof value,
    }
  )

  /* ==========================================================================
  🔥 Render
  ========================================================================== */

  return (

    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">

      {/* ================================================================
      🔥 Header
      ================================================================ */}

      <div className="flex items-start justify-between gap-4">

        <div>

          <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">

            {title}

          </div>

          {

            description && (

              <div className="mt-2 text-xs leading-6 text-zinc-600">

                {description}

              </div>

            )

          }

        </div>

        {

          badge && (

            <div className="rounded-full border border-cyan-900 bg-cyan-950/40 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-cyan-400">

              {badge}

            </div>

          )

        }

      </div>

      {/* ================================================================
      🔥 Value
      ================================================================ */}

      <div

        className={

          mono

            ? (
                'mt-4 overflow-x-auto rounded-lg border border-zinc-800 bg-black p-4 font-mono text-xs leading-6 text-cyan-300'
              )

            : (
                'mt-4 break-words text-sm leading-7 text-zinc-100'
              )
        }

      >

        {

          mono

            ? (

                <pre>

{displayValue}

                </pre>

              )

            : (

                displayValue
              )
        }

      </div>

    </div>
  )
}