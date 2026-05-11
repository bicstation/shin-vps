// /app/concierge/state/hooks/useSemanticRouting.ts

'use client'

/* =========================================
🔥 CONTRACTS
========================================= */

import type { SemanticFinderQuery } from '@/app/concierge/contracts/semantic/SemanticFinderQuery'

/* =========================================
🔥 REACT
========================================= */

import { useState } from 'react'

/* =========================================
🔥 Semantic Routing Hook
========================================= */

export function useSemanticRouting(initialQuery: SemanticFinderQuery = {}) {

  const [query, setQuery] = useState<SemanticFinderQuery>(initialQuery)

  const updateQuery = (updates: Partial<SemanticFinderQuery>) => {
    setQuery(prev => ({
      ...prev,
      ...updates,
    }))
  }

  const resetQuery = () => {
    setQuery({})
  }

  return {
    query,
    updateQuery,
    resetQuery,
    setQuery,
  }
}