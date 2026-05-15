// /app/concierge/sections/system/ConciergeLoading.tsx

'use client'

/* =========================================
🔥 STYLES
========================================= */

import styles
  from './ConciergeLoading.module.css'

/* =========================================
🔥 Concierge Loading
========================================= */

export default function ConciergeLoading() {

  return (

    <div className={styles.loadingContainer}>

      <div className={styles.spinner} />

      <p className={styles.loadingText}>
        Concierge AI 解析中...
      </p>

    </div>
  )
}