// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/[type]/components/RecommendedForYou.tsx

/* eslint-disable @next/next/no-img-element */
// @ts-nocheck

import Link
  from 'next/link'

import styles
  from './RecommendedForYou.module.css'

/* =========================================
🔥 Types
========================================= */

type RecommendationItem = {

  title: string

  description?: string

  href: string

  icon?: string
}

type Props = {

  items: RecommendationItem[]
}

/* =========================================
🔥 Component
========================================= */

export default function
RecommendedForYou({
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
            ICON
            ============================= */}

            {!!item.icon && (

              <div
                className={
                  styles.icon
                }
              >
                {item.icon}
              </div>

            )}

            {/* =============================
            BODY
            ============================= */}

            <div
              className={
                styles.body
              }
            >

              <h3
                className={
                  styles.title
                }
              >
                {item.title}
              </h3>

              {!!item.description && (

                <p
                  className={
                    styles.description
                  }
                >
                  {item.description}
                </p>

              )}

            </div>

            {/* =============================
            ACTION
            ============================= */}

            <div
              className={
                styles.action
              }
            >
              詳細を見る →
            </div>

          </Link>

        )
      )}

    </div>

  )
}

