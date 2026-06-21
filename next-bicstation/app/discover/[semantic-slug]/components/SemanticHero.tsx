// ============================================================================
// FILE:
// /app/discover/[semantic-slug]/components/SemanticHero.tsx
// ============================================================================

'use client'

/* ============================================================================
🔥 Runtime
============================================================================ */

import type {

  DiscoverDetailRuntime,

} from '@/shared/lib/api/django/pc/discover-detail'

/* ============================================================================
🔥 Styles
============================================================================ */

import styles
  from '../styles/discover-detail.module.css'

/* ============================================================================
🔥 Props
============================================================================ */

type Props = {

  runtime:
    DiscoverDetailRuntime

}

/* ============================================================================
🔥 Semantic Hero
============================================================================ */

export default function SemanticHero({

  runtime,

}: Props) {

  return (

    <section
      className={
        styles.semanticHero
      }
    >

      {/* ==========================================================
      TITLE
      ========================================================== */}

      <h1
        className={
          styles.semanticHeroTitle
        }
      >

        {

          runtime.group_name

        }

      </h1>

      {/* ==========================================================
      DESCRIPTION
      ========================================================== */}

      {

        runtime.description && (

          <p
            className={
              styles.semanticHeroDescription
            }
          >

            {

              runtime.description

            }

          </p>

        )

      }

      {/* ==========================================================
      PRODUCT COUNT
      ========================================================== */}

      <div
        className={
          styles.semanticHeroMeta
        }
      >

        {

          runtime.product_count ?? 0

        }

        {' '}

        Products

      </div>

    </section>

  )

}