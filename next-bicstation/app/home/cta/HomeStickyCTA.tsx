// /home/maya/shin-vps/next-bicstation/app/components/home/cta/HomeStickyCTA.tsx

'use client'

import Link from 'next/link'
import styles from '../styles/cta.module.css'

export default function HomeStickyCTA() {
  return (
    <div className={styles.stickyCTA}>
      <Link
        href="/ranking"
        className={styles.stickyPrimary}
      >
        🔥 人気ランキングを見る
      </Link>

      <Link
        href="/pc-finder"
        className={styles.stickySecondary}
      >
        🎯 用途からPCを探す
      </Link>
    </div>
  )
}