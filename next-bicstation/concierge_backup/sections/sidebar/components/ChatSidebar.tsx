// /app/concierge/sections/sidebar/components/ChatSidebar.tsx

'use client'

/* =========================================
🔥 Props
========================================= */

type Props = {

  children?: React.ReactNode

  collapsed?: boolean
}

/* =========================================
🔥 STYLES
========================================= */

import styles
  from '../SidebarSection.module.css'

/* =========================================
🔥 Chat Sidebar
========================================= */

export default function ChatSidebar({
  children,
  collapsed = false,
}: Props) {

  return (

    <aside
      className={`
        ${styles.sidebar}
        ${collapsed ? styles.collapsed : ''}
      `}
    >

      {children}

    </aside>
  )
}