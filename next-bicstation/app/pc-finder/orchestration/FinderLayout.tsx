// FinderLayout.tsx
'use client'

import type {
  ReactNode,
} from 'react'

import styles
  from './FinderLayout.module.css'

/* =========================================
🔥 Props
========================================= */

type Props = {

  children:
    ReactNode
}

/* =========================================
🔥 Finder Layout
========================================= */

export default function
FinderLayout({
  children,
}: Props) {

  return (

    <div
      className={
        styles.layout
      }
    >

      {/* ==================================
      Background Glow
      ================================== */}

      <div
        className={
          styles.backgroundGlow
        }
      />

      {/* ==================================
      Inner
      ================================== */}

      <div
        className={
          styles.inner
        }
      >

        {children}

      </div>

    </div>

  )
}