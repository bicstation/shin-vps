// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/[slug]/components/RuntimeBreadcrumbs.tsx
// ============================================================================

'use client'

import Link from 'next/link'

import styles from '../styles/runtime.module.css'

type Props = {
  breadcrumbs?: Array<{
    name?: string
    url?: string
  }>
}

/* ============================================================================
🔥 Runtime Breadcrumbs
============================================================================ */

export default function RuntimeBreadcrumbs({
  breadcrumbs = [],
}: Props) {

  /* ==========================================================================
  🔥 Empty
  ========================================================================== */

  if (!breadcrumbs.length) {

    return null
  }

  /* ==========================================================================
  🔥 Render
  ========================================================================== */

  return (

    <section
      className={
        styles.runtimeBreadcrumbSection
      }
    >

      <nav
        className={
          styles.runtimeBreadcrumbs
        }
        aria-label="Breadcrumb"
      >

        {breadcrumbs.map(
          (
            item,
            index
          ) => {

            const isLast =

              index ===
              breadcrumbs.length - 1

            return (

              <div
                key={
                  `${item?.url}-${index}`
                }
                className={
                  styles.runtimeBreadcrumbItem
                }
              >

                {/* ====================================================
                Link
                ==================================================== */}

                {isLast ? (

                  <span
                    className={
                      styles.runtimeBreadcrumbCurrent
                    }
                  >

                    {item?.name}

                  </span>

                ) : (

                  <Link
                    href={
                      item?.url || '#'
                    }
                    className={
                      styles.runtimeBreadcrumbLink
                    }
                  >

                    {item?.name}

                  </Link>

                )}

                {/* ====================================================
                Separator
                ==================================================== */}

                {!isLast && (

                  <span
                    className={
                      styles.runtimeBreadcrumbSeparator
                    }
                  >

                    →

                  </span>

                )}

              </div>

            )
          }
        )}

      </nav>

    </section>

  )
}