// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/page.tsx

/* eslint-disable @next/next/no-img-element */
// @ts-nocheck

import styles from './page.module.css'

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
  // DEBUG LOG
  // ======================================

  console.log(
    '\n🔥 ====================================='
  )

  console.log(
    '🔥 SIDEBAR STATS RAW PAYLOAD'
  )

  console.log(
    JSON.stringify(
      stats,
      null,
      2
    )
  )

  console.log(
    '🔥 =====================================\n'
  )

  // ======================================
  // ALL KEYS
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
        {/* DEBUG KEYS */}
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
          // skip empty
          // ------------------------------

          if (!items.length) {
            return null
          }

          return (

            <section key={key}>

              <h2>
                {key}
              </h2>

              <ul>

                {items.map(item => (

                  <li
                    key={
                      item.slug
                      || item.name
                    }
                  >

                    <a
                      href={
                        `/ranking/${
                          item.slug
                        }`
                      }
                    >

                      {item.name}

                    </a>

                  </li>

                ))}

              </ul>

            </section>
          )
        })}

      </div>

    </main>
  )
}