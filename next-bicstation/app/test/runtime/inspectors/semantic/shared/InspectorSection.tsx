// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/next-bicstation/app/test/runtime/inspectors/semantic/shared/InspectorSection.tsx
// ============================================================================

'use client'

/**
 * ============================================================================
 * SHIN CORE LINX
 * Inspector Section
 * ============================================================================
 *
 * PURPOSE:
 *
 * Shared runtime observability section wrapper
 *
 * IMPORTANT:
 *
 * This component exists for:
 *
 * inspector section composition
 *
 * NOT:
 *
 * semantic normalization
 * runtime mutation
 * topology orchestration
 *
 * ============================================================================
 */

import type {

  ReactNode,

} from 'react'

/* ============================================================================
🔥 Props
============================================================================ */

type InspectorSectionProps = {

  title: string

  description?: string

  badge?: string

  children: ReactNode
}

/* ============================================================================
🔥 Inspector Section
============================================================================ */

export default function InspectorSection({

  title,

  description,

  badge,

  children,

}: InspectorSectionProps) {

  /* ==========================================================================
  🔥 Runtime Debug
  ========================================================================== */

  console.log(

    '🧱 INSPECTOR SECTION',

    {

      title,

      badge,
    }
  )

  /* ==========================================================================
  🔥 Render
  ========================================================================== */

  return (

    <section className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-6">

      {/* ================================================================
      🔥 Header
      ================================================================ */}

      <div className="flex items-start justify-between gap-4">

        <div>

          {/* ============================================================
          🔥 Title
          ============================================================ */}

          <h2 className="text-lg font-bold text-zinc-100">

            {title}

          </h2>

          {/* ============================================================
          🔥 Description
          ============================================================ */}

          {

            description && (

              <p className="mt-2 text-sm leading-7 text-zinc-500">

                {description}

              </p>

            )

          }

        </div>

        {/* ==============================================================
        🔥 Badge
        ============================================================== */}

        {

          badge && (

            <div className="rounded-full border border-cyan-900 bg-cyan-950/40 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-cyan-400">

              {badge}

            </div>

          )

        }

      </div>

      {/* ================================================================
      🔥 Body
      ================================================================ */}

      <div className="mt-6 space-y-6">

        {children}

      </div>

    </section>
  )
}