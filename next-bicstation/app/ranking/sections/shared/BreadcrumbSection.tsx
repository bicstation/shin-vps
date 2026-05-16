// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/sections/shared/BreadcrumbSection.tsx

/* eslint-disable @next/next/no-img-element */
// @ts-nocheck

import Link
  from 'next/link'

/* =========================================
🔥 Types
========================================= */

type BreadcrumbItem = {

  name?: string

  href?: string
}

type Props = {

  items?: BreadcrumbItem[]
}

/* =========================================
🔥 Section
========================================= */

export default function
BreadcrumbSection({

  items = [],

}: Props) {

  /* ======================================
  🔥 Empty
  ====================================== */

  if (
    !Array.isArray(items)
    || !items.length
  ) {
    return null
  }

  /* ======================================
  🔥 Render
  ====================================== */

  return (

    <section
      style={{
        padding:
          '28px 24px 0',
      }}
    >

      <div
        style={{
          maxWidth: '1440px',

          margin: '0 auto',
        }}
      >

        {/* ==================================
        BREADCRUMB
        ================================== */}

        <nav
          aria-label="Breadcrumb"
        >

          <ol
            style={{
              display: 'flex',

              flexWrap: 'wrap',

              alignItems: 'center',

              gap: '10px',

              listStyle: 'none',

              padding: 0,

              margin: 0,
            }}
          >

            {items.map(
              (
                item,
                index
              ) => {

                const isLast =

                  index
                  === items.length - 1

                const label =

                  item?.name
                  || 'Untitled'

                const href =

                  item?.href
                  || '/'

                return (

                  <li
                    key={
                      `${label}-${index}`
                    }

                    style={{
                      display: 'flex',

                      alignItems: 'center',

                      gap: '10px',
                    }}
                  >

                    {/* =====================
                    LINK
                    ===================== */}

                    {!isLast ? (

                      <Link
                        href={href}

                        style={{
                          fontSize: '13px',

                          color:
                            'rgba(255,255,255,0.68)',

                          textDecoration:
                            'none',
                        }}
                      >
                        {label}
                      </Link>

                    ) : (

                      <span
                        style={{
                          fontSize: '13px',

                          fontWeight: 700,

                          color:
                            '#ffffff',
                        }}
                      >
                        {label}
                      </span>

                    )}

                    {/* =====================
                    SEPARATOR
                    ===================== */}

                    {!isLast && (

                      <span
                        style={{
                          fontSize: '12px',

                          opacity: 0.4,
                        }}
                      >
                        /
                      </span>

                    )}

                  </li>

                )

              }
            )}

          </ol>

        </nav>

      </div>

    </section>

  )
}