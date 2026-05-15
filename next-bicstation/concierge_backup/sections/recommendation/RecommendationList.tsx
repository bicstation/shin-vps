// /app/concierge/sections/recommendation/RecommendationList.tsx

'use client'

import React from 'react'

import RecommendationCard
  from './components/RecommendationCard'

import styles
  from './RecommendationList.module.css'

/* =========================================
🔥 TYPES
========================================= */

export type RecommendationItem = {
  id: string

  name: string

  description?: string

  image_url?: string

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

        <RecommendationCard
          key={item.id}

          item={item}

          onClick={() =>
            onSelect?.(item)
          }
        />

      ))}

    </div>

  )
}