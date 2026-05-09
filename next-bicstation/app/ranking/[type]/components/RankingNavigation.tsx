// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/[type]/components/RankingNavigation.tsx

/* eslint-disable @next/next/no-img-element */
// @ts-nocheck

import Link
  from 'next/link'

import styles
  from './RankingNavigation.module.css'

/* =========================================
🔥 Types
========================================= */

type NavigationItem = {

  title: string

  description?: string

  href: string

  actionLabel?: string
}

type Props = {

  items: NavigationItem[]
}

/* =========================================
🔥 Component
========================================= */

export default function
RankingNavigation({
  items,
}: Props) {

  // ======================================
  // Empty
  // ======================================

  if (!items?.length) {
    return null
  }

  return (

    <div
      className={
        styles.grid
      }
    >

      {items.map(
        (item) => (

          <Link
            key={item.href}

            href={item.href}

            className={
              styles.card
            }
          >

            {/* =============================
            TITLE
            ============================= */}

            <div
              className={
                styles.title
              }
            >
              {item.title}
            </div>

            {/* =============================
            DESCRIPTION
            ============================= */}

            {!!item.description && (

              <div
                className={
                  styles.description
                }
              >
                {item.description}
              </div>

            )}

            {/* =============================
            ACTION
            ============================= */}

            <div
              className={
                styles.action
              }
            >
              {
                item.actionLabel
                || '比較を続ける →'
              }
            </div>

          </Link>

        )
      )}

    </div>

  )
}

