// /app/concierge/orchestration/layout/ConciergeLayout.tsx

'use client'

/* =========================================
🔥 STYLES
========================================= */

import styles
  from './ConciergeLayout.module.css'

/* =========================================
🔥 Props
========================================= */

type Props = {

  children:
    React.ReactNode

  sidebar?:
    React.ReactNode

  header?:
    React.ReactNode

  footer?:
    React.ReactNode
}

/* =========================================
🔥 Concierge Layout
========================================= */

export default function
ConciergeLayout({
  children,
  sidebar,
  header,
  footer,
}: Props) {

  return (

    <div
      className={
        styles.layout
      }
    >

      {/* ==================================
      Header
      ================================== */}

      {header && (

        <header
          className={
            styles.header
          }
        >

          {header}

        </header>

      )}

      {/* ==================================
      Body
      ================================== */}

      <div
        className={
          styles.body
        }
      >

        {/* ================================
        Main
        ================================ */}

        <main
          className={
            styles.main
          }
        >

          {children}

        </main>

        {/* ================================
        Sidebar
        ================================ */}

        {sidebar && (

          <aside
            className={
              styles.sidebar
            }
          >

            {sidebar}

          </aside>

        )}

      </div>

      {/* ==================================
      Footer
      ================================== */}

      {footer && (

        <footer
          className={
            styles.footer
          }
        >

          {footer}

        </footer>

      )}

    </div>
  )
}