// /app/concierge/sections/debug/DebugSection.tsx

'use client'

/* =========================================
🔥 Props
========================================= */

type Props = {

  header?: string

  content?: any
}

/* =========================================
🔥 STYLES
========================================= */

import styles
  from './DebugSection.module.css'

/* =========================================
🔥 Debug Section
========================================= */

export default function DebugSection({
  header = 'DEBUG SECTION',
  content,
}: Props) {

  return (

    <section
      className={styles.debugSection}
    >

      <div className={styles.debugHeader}>
        {header}
      </div>

      <div className={styles.debugContent}>
        <pre className={styles.debugCard}>
          {JSON.stringify(content, null, 2)}
        </pre>
      </div>

    </section>
  )
}