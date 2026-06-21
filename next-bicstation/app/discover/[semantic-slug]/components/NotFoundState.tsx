// ============================================================================
// FILE:
// /app/discover/[semantic-slug]/components/NotFoundState.tsx
// ============================================================================

'use client'

/* ============================================================================
🔥 Styles
============================================================================ */

import styles
  from '../styles/discover-detail.module.css'

/* ============================================================================
🔥 Not Found State
============================================================================ */

export default function NotFoundState() {

  return (

    <section
      className={
        styles.notFoundState
      }
    >

      <h1>

        Attribute not found

      </h1>

      <p>

        The requested semantic group
        does not exist.

      </p>

    </section>

  )

}