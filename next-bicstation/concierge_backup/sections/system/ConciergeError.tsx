// /app/concierge/sections/system/ConciergeError.tsx

'use client'

/* =========================================
🔥 STYLES
========================================= */

import styles
  from './ConciergeError.module.css'

/* =========================================
🔥 Concierge Error
========================================= */

export default function ConciergeError({
  message = '予期せぬエラーが発生しました。',
}: {
  message?: string
}) {

  return (

    <div className={styles.errorContainer}>

      <div className={styles.errorIcon}>
        ⚠️
      </div>

      <h2 className={styles.errorTitle}>
        Concierge Error
      </h2>

      <p className={styles.errorText}>
        {message}
      </p>

    </div>
  )
}