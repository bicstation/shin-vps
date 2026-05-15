// /app/concierge/orchestration/recommendation/RecommendationList.tsx

'use client'

import React from 'react'
import styles from './RecommendationList.module.css'

/* =========================================
🔥 TYPES
========================================= */

export type RecommendationItem = {
  id: string
  title: string
  description?: string
  imageUrl?: string
  score?: number
}

/* =========================================
🔥 Props
========================================= */

type RecommendationListProps = {
  items?: RecommendationItem[]

  onSelect?: (
    item: RecommendationItem
  ) => void
}

/* =========================================
🔥 Recommendation List
========================================= */

export default function
RecommendationList({

  items = [],
  onSelect,

}: RecommendationListProps) {

  // ======================================
  // Safe Items
  // ======================================

  const safeItems =

    Array.isArray(items)
      ? items
      : []

  // ======================================
  // Empty
  // ======================================

  if (!safeItems.length) {

    return (

      <div
        className={
          styles.emptyState
        }
      >
        推薦候補がありません。
      </div>

    )
  }

  // ======================================
  // Render
  // ======================================

  return (

    <div
      className={
        styles.listWrapper
      }
    >

      {safeItems.map((item) => (

        <button
          key={item.id}

          type="button"

          className={
            styles.card
          }

          onClick={() =>
            onSelect?.(item)
          }
        >

          {/* ===============================
          IMAGE
          =============================== */}

          {item.imageUrl && (

            <div
              className={
                styles.imageWrapper
              }
            >

              <img
                src={item.imageUrl}

                alt={item.title}

                className={
                  styles.image
                }
              />

            </div>

          )}

          {/* ===============================
          CONTENT
          =============================== */}

          <div
            className={
              styles.content
            }
          >

            <h3
              className={
                styles.title
              }
            >
              {item.title}
            </h3>

            {item.description && (

              <p
                className={
                  styles.description
                }
              >
                {item.description}
              </p>

            )}

            {typeof item.score
              === 'number' && (

              <div
                className={
                  styles.score
                }
              >
                Score:
                {' '}
                {item.score}
              </div>

            )}

          </div>

        </button>

      ))}

    </div>

  )
}