// ============================================================================
// FILE:
// /home/maya/shin-vps/next-bicstation/app/product/[unique_id]/components/common/ProductBreadcrumb.tsx
// ============================================================================

'use client'

import Link from 'next/link'

import styles
  from './breadcrumb.module.css'

type BreadcrumbItem = {

  name: string

  url?: string
}

type Props = {

  breadcrumbs?: BreadcrumbItem[]
}

/* ============================================================================
🔥 COMPONENT
============================================================================ */

export default function ProductBreadcrumb({
  breadcrumbs = [],
}: Props) {

  // ==========================================================================
  // Empty
  // ==========================================================================

  if (
    !Array.isArray(
      breadcrumbs
    )
    || breadcrumbs.length === 0
  ) {

    return null

  }

  // ==========================================================================
  // Render
  // ==========================================================================

  return (

    <nav
      aria-label="Breadcrumb"

      className={
        styles.breadcrumb
      }
    >

      {
        breadcrumbs.map(
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
                  `${item.name}-${index}`
                }

                className={
                  styles.breadcrumbItem
                }
              >

                {/* ==========================================
                LINK
                ========================================== */}

                {
                  item.url
                  && !isLast
                    ? (

                      <Link
                        href={item.url}

                        className={
                          styles.breadcrumbLink
                        }
                      >

                        {item.name}

                      </Link>

                    )
                    : (

                      <span
                        className={
                          styles.breadcrumbCurrent
                        }
                      >

                        {item.name}

                      </span>

                    )
                }

                {/* ==========================================
                SEPARATOR
                ========================================== */}

                {
                  !isLast && (

                    <span
                      className={
                        styles.breadcrumbSeparator
                      }
                    >

                      /

                    </span>

                  )
                }

              </div>

            )

          }
        )
      }

    </nav>

  )
}