// /home/maya/shin-dev/shin-vps/shared/components/semantic/RecommendationReason.tsx

/* eslint-disable @next/next/no-img-element */
// @ts-nocheck

import styles
  from './RecommendationReason.module.css'

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

  matchedAttributes:
    string[]

  title?: string
}

/* =========================================
🔥 Component
========================================= */

export default function
RecommendationReason({

  matchedAttributes,

  title =
    'この製品をおすすめする理由',

}: Props) {

  // ======================================
  // Empty
  // ======================================

  if (
    !matchedAttributes?.length
  ) {
    return null
  }

  return (

    <div
      className={
        styles.wrapper
      }
    >

      {/* ==================================
      TITLE
      ================================== */}

      <div
        className={
          styles.title
        }
      >
        {title}
      </div>

      {/* ==================================
      REASONS
      ================================== */}

      <div
        className={
          styles.list
        }
      >

        {matchedAttributes.map(
          (
            slug
          ) => (

            <div
              key={slug}

              className={
                styles.reason
              }
            >

              {/* ==========================
              ICON
              ========================== */}

              <span
                className={
                  styles.icon
                }
              >
                {
                  resolveSemanticIcon(
                    slug
                  )
                }
              </span>

              {/* ==========================
              LABEL
              ========================== */}

              <span
                className={
                  styles.label
                }
              >
                {
                  resolveSemanticLabel(
                    slug
                  )
                }
              </span>

            </div>

          )
        )}

      </div>

    </div>

  )
}

