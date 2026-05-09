// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/page.tsx

/* eslint-disable @next/next/no-img-element */
// @ts-nocheck

import Link
  from 'next/link'

import styles
  from './page.module.css'

/* =========================================
🔥 API
========================================= */

import {
  fetchSidebarStats,
} from '@/shared/lib/api/django/pc/stats'

/* =========================================
🔥 PAGE
========================================= */

export const dynamic =
  'force-dynamic'

export default async function
RankingIndexPage() {

  // ======================================
  // Fetch
  // ======================================

  const stats =
    await fetchSidebarStats()

  // ======================================
  // All Keys
  // ======================================

  const keys =

    stats &&
    typeof stats === 'object'

      ? Object.keys(stats)

      : []

  // ======================================
  // Render
  // ======================================

  return (

    <main
      className={
        styles.page
      }
    >

      <div
        className={
          styles.container
        }
      >

        {/* ================================= */}
        {/* TITLE */}
        {/* ================================= */}

        <h1>
          ランキングジャンル一覧
        </h1>

        {/* ================================= */}
        {/* API KEYS */}
        {/* ================================= */}

        <section>

          <h2>
            APIキー一覧
          </h2>

          <ul>

            {keys.map(key => (

              <li key={key}>
                {key}
              </li>

            ))}

          </ul>

        </section>

        {/* ================================= */}
        {/* DYNAMIC GROUPS */}
        {/* ================================= */}

        {keys.map(key => {

          const items =

            Array.isArray(
              stats?.[key]
            )

              ? stats[key]

              : []

          // ------------------------------
          // Empty
          // ------------------------------

          if (!items.length) {
            return null
          }

          return (

            <section
              key={key}
              style={{
                marginTop: '40px',
              }}
            >

              {/* ========================= */}
              {/* Group Title */}
              {/* ========================= */}

              <h2>
                {key}
              </h2>

              {/* ========================= */}
              {/* Item List */}
              {/* ========================= */}

              <ul
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '12px',
                  padding: 0,
                  listStyle: 'none',
                }}
              >

                {items.map(item => {

                  const slug =
                    item?.slug || ''

                  const name =
                    item?.name || ''

                  return (

                    <li
                      key={
                        slug || name
                      }
                    >

                      <Link
                        href={
                          `/ranking/${slug}`
                        }

                        style={{
                          display: 'inline-block',
                          padding:
                            '8px 14px',
                          borderRadius:
                            '999px',
                          background:
                            'rgba(255,255,255,0.06)',
                          border:
                            '1px solid rgba(255,255,255,0.08)',
                          textDecoration:
                            'none',
                          color:
                            '#fff',
                          fontSize:
                            '13px',
                          fontWeight:
                            600,
                        }}
                      >

                        {name}

                      </Link>

                    </li>
                  )
                })}

              </ul>

            </section>
          )
        })}

      </div>

    </main>
  )
}