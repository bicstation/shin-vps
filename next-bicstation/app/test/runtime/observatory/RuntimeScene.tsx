// ============================================================================
// FILE:
// /home/maya/shin-vps/next-bicstation/app/test/runtime/observatory/RuntimeScene.tsx
// ============================================================================

'use client'

/* ============================================================================
🔥 React
============================================================================ */

import type {

  ReactNode,

} from 'react'

/* ============================================================================
🔥 Types
============================================================================ */

type RuntimeSceneProps = {

  title?: string

  subtitle?: string

  children?: ReactNode
}

/* ============================================================================
🔥 Runtime Scene
============================================================================ */

/**
 * Semantic runtime observatory scene shell.
 *
 * Responsibilities:
 *
 * - scene continuity
 * - semantic observatory framing
 * - runtime cinematic structure
 * - inspector-safe rendering hierarchy
 */
export function RuntimeScene({

  title,

  subtitle,

  children,

}: RuntimeSceneProps) {

  return (

    <section className="space-y-8">

      {/* =============================================================== */}
      {/* Scene Header */}
      {/* =============================================================== */}

      <div className="space-y-3">

        <div className="text-4xl font-black tracking-tight text-white">

          {title}

        </div>

        <div className="max-w-4xl text-sm text-zinc-500">

          {subtitle}

        </div>

      </div>

      {/* =============================================================== */}
      {/* Scene Body */}
      {/* =============================================================== */}

      <div className="space-y-8">

        {children}

      </div>

    </section>
  )
}

/* ============================================================================
🔥 Default Export
============================================================================ */

export default RuntimeScene

