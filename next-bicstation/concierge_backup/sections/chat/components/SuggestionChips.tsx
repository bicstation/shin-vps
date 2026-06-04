// /app/concierge/sections/chat/components/SuggestionChips.tsx

'use client'

/* =========================================
🔥 CONTRACTS
========================================= */

import type {
  SemanticIntent,
} from '../../../contracts/semantic/SemanticIntent'

/* =========================================
🔥 STYLES
========================================= */

import styles
  from './SuggestionChips.module.css'

/* =========================================
🔥 Props
========================================= */

type Props = {

  suggestions?: SemanticIntent[]

  onClick?: (
    slug: string
  ) => void
}

/* =========================================
🔥 Suggestion Chips
========================================= */

export default function
SuggestionChips({
  suggestions = [],
  onClick,
}: Props) {

  return (

    <div
      className={styles.chipContainer}
    >

      {suggestions.map((s, idx) => (

        <button
          key={idx}
          className={styles.chip}
          onClick={() =>
            onClick?.(s.slug || '')
          }
        >

          {s.name}

        </button>

      ))}

    </div>

  )
}