// /app/concierge/sections/sidebar/SidebarSection.tsx

'use client'

/* =========================================
🔥 Props
========================================= */

type Props = {

  children?: React.ReactNode

  title?: string
}

/* =========================================
🔥 STYLES
========================================= */

import styles
  from './SidebarSection.module.css'

/* =========================================
🔥 Sidebar Section
========================================= */

export default function SidebarSection({
  children,
  title,
}: Props) {

  return (

    <section className={styles.sidebar}>

      {title && (
        <div className={styles.sidebarHeader}>
          {title}
        </div>
      )}

      {children}

    </section>
  )
}