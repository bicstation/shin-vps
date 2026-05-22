// /home/maya/shin-vps/next-bicstation/app/components/home/hooks/useHomeCompare.ts

'use client'

import { useMemo }
  from 'react'

import {
  HOME_QUICK_COMPARE,
  HOME_TOP_PICK_POINTS,
} from '../data/compare'

export function useHomeCompare() {

  const quickCompareItems = useMemo(
    () => HOME_QUICK_COMPARE,
    [],
  )

  const topPickPoints = useMemo(
    () => HOME_TOP_PICK_POINTS,
    [],
  )

  return {
    quickCompareItems,
    topPickPoints,
  }
}