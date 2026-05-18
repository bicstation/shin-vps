// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/next-bicstation/app/product/components/common/RuntimeSection.tsx
// ============================================================================

'use client'

/**
 * ============================================================================
 * 🔥 SHIN CORE LINX
 * Runtime Section
 * ============================================================================
 *
 * PURPOSE:
 *   - semantic runtime layout wrapper
 *   - reusable discovery section container
 *   - cinematic spacing orchestration
 *
 * IMPORTANT:
 *   - semantic authority remains backend
 *   - frontend orchestrates layout hierarchy only
 *
 * ============================================================================
 */

import type {
  ReactNode,
} from 'react'

import styles from '../../styles/product-runtime.module.css'

/* ============================================================================
🔥 Props
============================================================================ */

type Props = {

  children: ReactNode

  className?: string
}

/* ============================================================================
🔥 Component
============================================================================ */

export default function RuntimeSection({

  children,

  className = '',

}: Props) {

  /* ==========================================================================
  🔥 Classes
  ========================================================================== */

  const classes = [

    styles.runtimeSection,

    className,

  ]
    .filter(Boolean)
    .join(' ')

  /* ==========================================================================
  🔥 Render
  ========================================================================== */

  return (

    <section className={classes}>

      {children}

    </section>

  )
}