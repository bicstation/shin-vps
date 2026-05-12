// /app/concierge/state/hooks/useConciergeState.ts

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
🔥 Concierge State Hook
========================================= */

export function useConciergeState() {

  const [semanticIntent, setSemanticIntent] = useState<SemanticIntent>({})

  const updateIntent = (intent: Partial<SemanticIntent>) => {
    setSemanticIntent(prev => ({
      ...prev,
      ...intent,
    }))
  }

  const resetIntent = () => {
    setSemanticIntent({})
  }

  return {
    semanticIntent,
    updateIntent,
    resetIntent,
  }
}