// /app/concierge/state/runtime/conciergeStore.ts

'use client'

/* =========================================
🔥 CONTRACTS
========================================= */

import type { SemanticIntent } from '../../contracts/semantic/SemanticIntent'

/* =========================================
🔥 REACT
========================================= */

import { useState } from 'react'

/* =========================================
🔥 Concierge Store Hook
========================================= */

export function useConciergeStore(initialIntent: SemanticIntent = {}) {

  const [semanticIntent, setSemanticIntent] = useState<SemanticIntent>(initialIntent)

  const updateIntent = (updates: Partial<SemanticIntent>) => {
    setSemanticIntent(prev => ({
      ...prev,
      ...updates,
    }))
  }

  const resetIntent = () => {
    setSemanticIntent({})
  }

  return {
    semanticIntent,
    updateIntent,
    resetIntent,
    setSemanticIntent,
  }
}