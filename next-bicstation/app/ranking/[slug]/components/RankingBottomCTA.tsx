// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/[type]/components/RankingBottomCTA.tsx

/* eslint-disable @next/next/no-img-element */
// @ts-nocheck

import Link
  from 'next/link'

import styles
  from './RankingBottomCTA.module.css'

/* =========================================
🔥 Types
========================================= */

type Props = {

  primaryHref?: string

  secondaryHref?: string

  primaryLabel?: string

  secondaryLabel?: string

  trustItems?: string[]
}

/* =========================================
🔥 Component
========================================= */

export default function
RankingBottomCTA({

  primaryHref =
    '/ranking',

  secondaryHref =
    '/pc-finder',

  primaryLabel =
    'おすすめランキングを見る',

  secondaryLabel =
    'PC診断を試す',

  trustItems = [],
}: Props) {

  return (

    <div
      className={
        styles.card
      }
    >

      {/* ==================================
      TRUST
      ================================== */}

      {!!trustItems?.length && (

        <div
          className={
            styles.trust
          }
        >

          {trustItems.map(
            (item) => (

              <div
                key={item}

                className={
                  styles.trustItem
                }
              >
                ✔ {item}
              </div>
            )
          )}

        </div>

      )}

      {/* ==================================
      ACTIONS
      ================================== */}

      <div
        className={
          styles.actions
        }
      >

        <Link
          href={primaryHref}

          className={
            styles.primary
          }
        >
          {primaryLabel}
        </Link>

        <Link
          href={secondaryHref}

          className={
            styles.secondary
          }
        >
          {secondaryLabel}
        </Link>

      </div>

    </div>

  )
}