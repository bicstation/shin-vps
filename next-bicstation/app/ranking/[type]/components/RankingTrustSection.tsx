// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/[type]/components/RankingTrustSection.tsx

/* eslint-disable @next/next/no-img-element */
// @ts-nocheck

import styles
  from './RankingTrustSection.module.css'

/* =========================================
🔥 Types
========================================= */

type TrustItem = {

  title: string

  description: string

  icon?: string
}

type Props = {

  items: TrustItem[]
}

/* =========================================
🔥 Component
========================================= */

export default function
RankingTrustSection({
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

          <article
            key={item.title}

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

              <p
                className={
                  styles.description
                }
              >
                {item.description}
              </p>

            </div>

          </article>

        )
      )}

    </div>

  )
}

