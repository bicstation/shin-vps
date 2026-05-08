// /home/maya/shin-vps/next-bicstation/app/components/HomeStickyCTA.tsx

'use client'

import Link
  from 'next/link'

import styles
  from '../page.module.css'

export default function HomeStickyCTA() {

  return (

    <div
      className={
        styles.stickyCTA
      }
    >

      {/* ================================
      PRIMARY CTA
      ================================ */}

      <Link
        href="/ranking/score"

        className={
          styles.stickyPrimary
        }
      >
        🔥 おすすめランキングを見る
      </Link>

      {/* ================================
      SECONDARY CTA
      ================================ */}

      <Link
        href="/pc-finder"

        className={
          styles.stickySecondary
        }
      >
        🎯 自分に合うPCを探す
      </Link>

    </div>

  )
}