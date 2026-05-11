// /app/concierge/sections/suggestions/SuggestionSection.tsx

'use client'

/* =========================================
🔥 Props
========================================= */

type SuggestionItem = {

  label: string

  value: string
}

type Props = {

  title?: string

  suggestions?: SuggestionItem[]

  onSelect?: (
    value: string
  ) => void
}

/* =========================================
🔥 STYLES
========================================= */

import styles
  from './SuggestionSection.module.css'

/* =========================================
🔥 Suggestion Section
========================================= */

export default function
SuggestionSection({
  title = 'Suggestion',
  suggestions = [],
  onSelect,
}: Props) {

  // ======================================
  // Empty
  // ======================================

  if (
    !suggestions.length
  ) {

    return null
  }

  // ======================================
  // Render
  // ======================================

  return (

    <section
      className={
        styles.suggestionSection
      }
    >

      {/* ==================================
      Header
      ================================== */}

      <div
        className={
          styles.suggestionHeader
        }
      >

        {title}

      </div>

      {/* ==================================
      Chips
      ================================== */}

      <div
        className={
          styles.suggestionChips
        }
      >

        {suggestions.map(
          (
            suggestion,
            index
          ) => (

            <button
              key={index}

              className={
                styles.suggestionChip
              }

              onClick={() =>
                onSelect?.(
                  suggestion.value
                )
              }
            >

              {suggestion.label}

            </button>

          )
        )}

      </div>

    </section>
  )
}