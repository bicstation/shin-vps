// /home/maya/shin-vps/next-bicstation/app/components/home/hooks/useHomeRecommendations.ts

'use client'

import { useMemo }
  from 'react'

import {
  HOME_RECOMMENDATION_PATHS,
  INTENT_NAV,
} from '../data/recommendation'

import {
  HOME_CAPABILITIES,
} from '../data/capability'

import {
  HOME_TRUST_POINTS,
  HOME_TRUST_BADGES,
} from '../data/trust'

export function useHomeRecommendations() {

  /* ========================================================
  🔥 RECOMMENDATION PATHS
  ======================================================== */

  const recommendationPaths = useMemo(
    () => HOME_RECOMMENDATION_PATHS,
    [],
  )

  /* ========================================================
  🔥 INTENT NAVIGATION
  ======================================================== */

  const intentNavigation = useMemo(
    () => INTENT_NAV,
    [],
  )

  /* ========================================================
  🔥 CAPABILITIES
  ======================================================== */

  const capabilities = useMemo(
    () => HOME_CAPABILITIES,
    [],
  )

  /* ========================================================
  🔥 TRUST POINTS
  ======================================================== */

  const trustPoints = useMemo(
    () => HOME_TRUST_POINTS,
    [],
  )

  /* ========================================================
  🔥 TRUST BADGES
  ======================================================== */

  const trustBadges = useMemo(
    () => HOME_TRUST_BADGES,
    [],
  )

  return {
    recommendationPaths,
    intentNavigation,
    capabilities,
    trustPoints,
    trustBadges,
  }
}