// /app/concierge/state/hooks/useRecommendationEngine.ts

'use client'

/* =========================================
🔥 CONTRACTS
========================================= */

import type { RecommendationPayload } from '../../contracts/recommendation/RecommendationPayload'

/* =========================================
🔥 REACT
========================================= */

import { useState } from 'react'

/* =========================================
🔥 Recommendation Engine Hook
========================================= */

export function useRecommendationEngine(initialRecommendations: RecommendationPayload[] = []) {

  const [recommendations, setRecommendations] = useState<RecommendationPayload[]>(initialRecommendations)

  const addRecommendation = (rec: RecommendationPayload) => {
    setRecommendations(prev => [...prev, rec])
  }

  const resetRecommendations = () => {
    setRecommendations([])
  }

  return {
    recommendations,
    addRecommendation,
    resetRecommendations,
    setRecommendations,
  }
}