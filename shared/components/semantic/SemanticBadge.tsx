// /home/maya/shin-vps/shared/components/semantic/SemanticBadge.tsx

'use client'

import Link
  from 'next/link'

import styles
  from './SemanticBadge.module.css'

import type {

  SemanticAttribute,

} from '@/shared/types/semantic'

/* =========================================
🔥 Props
========================================= */

type Props = {

  attribute?:
    SemanticAttribute
    | null
}

/* =========================================
🔥 Component
========================================= */

export default function
SemanticBadge({

  attribute,

}: Props) {

  // ======================================
  // Empty
  // ======================================

  if (!attribute) {
    return null
  }

  // ======================================
  // Safe Values
  // ======================================

  const label =
    attribute.name || ''

  const slug =
    attribute.slug || ''

  // ======================================
  // Href
  // ======================================

  const href =

    slug
      ? `/ranking/${slug}`
      : '#'

  // ======================================
  // Render
  // ======================================

  return (

    <Link
      href={href}
      className={
        styles.badge
      }
    >

      {/* ================================
      LABEL
      ================================= */}

      <span
        className={
          styles.label
        }
      >
        {label}
      </span>

    </Link>
  )
}