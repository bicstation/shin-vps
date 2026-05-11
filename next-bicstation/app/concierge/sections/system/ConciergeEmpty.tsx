// /app/concierge/sections/system/ConciergeEmpty.tsx

'use client'

/* =========================================
🔥 STYLES
========================================= */

import styles
  from './ConciergeEmpty.module.css'

/* =========================================
🔥 Concierge Empty
========================================= */

export default function ConciergeEmpty() {

  return (

    <div className={styles.emptyContainer}>

      <div className={styles.emptyIcon}>
        🤖
      </div>

      <h2 className={styles.emptyTitle}>
        Concierge AI Standby
      </h2>

      <p className={styles.emptyText}>
        何か質問すると、最適なPCや
        semantic recommendationを
        提案します。
      </p>

    </div>
  )
}