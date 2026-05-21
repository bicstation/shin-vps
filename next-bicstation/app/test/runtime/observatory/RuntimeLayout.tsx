// ============================================================================
// FILE:
// /home/maya/shin-vps/next-bicstation/app/test/runtime/observatory/RuntimeLayout.tsx
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

type RuntimeLayoutProps = {

  children?: ReactNode
}

/* ============================================================================
🔥 Runtime Layout
============================================================================ */

/**
 * Runtime observatory shell layout.
 *
 * Responsibilities:
 *
 * - observatory viewport layout
 * - runtime shell continuity
 * - semantic observability spacing
 * - inspector-safe rendering structure
 */
export function RuntimeLayout({

  children,

}: RuntimeLayoutProps) {

  return (

    <main className="mx-auto max-w-[1800px] px-6 py-10">

      <div className="space-y-8">

        {children}

      </div>

    </main>
  )
}

/* ============================================================================
🔥 Default Export
============================================================================ */

export default RuntimeLayout

