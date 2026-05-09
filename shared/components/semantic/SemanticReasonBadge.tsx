// /home/maya/shin-dev/shin-vps/shared/components/semantic/SemanticReasonBadge.tsx

/* eslint-disable @next/next/no-img-element */
// @ts-nocheck

import styles
  from './SemanticReasonBadge.module.css'

/* =========================================
🔥 Semantic
========================================= */

import {

  resolveSemanticLabel,

  resolveSemanticIcon,

} from '@/shared/lib/semantic'

/* =========================================
🔥 Types
========================================= */

type Props = {

  slug: string

  label?: string

  icon?: string
}

/* =========================================
🔥 Component
========================================= */

export default function
SemanticReasonBadge({

  slug,

  label,

  icon,

}: Props) {

  // ======================================
  // Resolve
  // ======================================

  const resolvedLabel =

    label

    || resolveSemanticLabel(
      slug
    )

  const resolvedIcon =

    icon

    || resolveSemanticIcon(
      slug
    )

  return (

    <div
      className={
        styles.badge
      }
    >

      {/* ==================================
      GLOW
      ================================== */}

      <div
        className={
          styles.glow
        }
      />

      {/* ==================================
      CONTENT
      ================================== */}

      <div
        className={
          styles.content
        }
      >

        {/* ==============================
        ICON
        ============================== */}

        <span
          className={
            styles.icon
          }
        >
          {resolvedIcon}
        </span>

        {/* ==============================
        LABEL
        ============================== */}

        <span
          className={
            styles.label
          }
        >
          {resolvedLabel}
        </span>

      </div>

    </div>

  )
}

