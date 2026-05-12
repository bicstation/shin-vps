// /app/concierge/state/hooks/useSemanticConversation.ts

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
🔥 Semantic Conversation Hook
========================================= */

export function useSemanticConversation(initialIntent: SemanticIntent = {}) {

  const [semanticIntent, setSemanticIntent] = useState<SemanticIntent>(initialIntent)

  const updateSemanticIntent = (intent: Partial<SemanticIntent>) => {
    setSemanticIntent(prev => ({
      ...prev,
      ...intent,
    }))
  }

  const resetSemanticIntent = () => {
    setSemanticIntent({})
  }

  return {
    semanticIntent,
    updateSemanticIntent,
    resetSemanticIntent,
    setSemanticIntent,
  }
}