// /home/maya/shin-dev/shin-vps/shared/components/semantic/SemanticExplanationList.tsx

/* eslint-disable @next/next/no-img-element */
// @ts-nocheck

import styles
  from './SemanticExplanationList.module.css'

/* =========================================
🔥 Components
========================================= */

import SemanticBadge
  from './SemanticBadge'

/* =========================================
🔥 Types
========================================= */

type Props = {

  slugs: string[]

  title?: string

  className?: string
}

/* =========================================
🔥 Component
========================================= */

export default function
SemanticExplanationList({

  slugs,

  title,

  className = '',

}: Props) {

  // ======================================
  // Empty
  // ======================================

  if (!slugs?.length) {
    return null
  }

  return (

    <div
      className={`
        ${styles.wrapper}
        ${className}
      `}
    >

      {/* ==================================
      TITLE
      ================================== */}

      {!!title && (

        <div
          className={
            styles.title
          }
        >
          {title}
        </div>

      )}

      {/* ==================================
      LIST
      ================================== */}

      <div
        className={
          styles.list
        }
      >

        {slugs.map(
          (
            slug
          ) => (

            <SemanticBadge
              key={slug}

              slug={slug}
            />

          )
        )}

      </div>

    </div>

  )
}

