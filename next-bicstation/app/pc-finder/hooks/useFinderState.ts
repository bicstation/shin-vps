// /hooks/useFinderState.ts

'use client'

/* =========================================
🔥 React
========================================= */

import {
  useCallback,
  useMemo,
  useState,
} from 'react'

/* =========================================
🔥 Semantic
========================================= */

import {

  resolveSemanticUsage,

  resolveSemanticLabel,

  resolveSemanticDescription,

} from '../semantic/finderSemantic'

/* =========================================
🔥 Types
========================================= */

import type {

  FinderPurpose,

  FinderProduct,

} from '../types/finder'

/* =========================================
🔥 Hook
========================================= */

export function
useFinderState() {

  // ======================================
  // Purpose
  // ======================================

  const [purpose, setPurpose] =

    useState<FinderPurpose>(
      'gaming'
    )

  // ======================================
  // Budget
  // ======================================

  const [budget, setBudget] =

    useState(250000)

  // ======================================
  // Loading
  // ======================================

  const [loading, setLoading] =

    useState(false)

  // ======================================
  // Error
  // ======================================

  const [error, setError] =

    useState<any>(null)

  // ======================================
  // Results
  // ======================================

  const [results, setResults] =

    useState<
      FinderProduct[]
    >([])

  // ======================================
  // Semantic Usage
  // ======================================

  const semanticUsage =

    useMemo(
      () => (

        resolveSemanticUsage(
          purpose
        )

      ),
      [purpose]
    )

  // ======================================
  // Semantic Label
  // ======================================

  const semanticLabel =

    useMemo(
      () => (

        resolveSemanticLabel(
          purpose
        )

      ),
      [purpose]
    )

  // ======================================
  // Semantic Description
  // ======================================

  const semanticDescription =

    useMemo(
      () => (

        resolveSemanticDescription(
          purpose
        )

      ),
      [purpose]
    )

  // ======================================
  // Reset Results
  // ======================================

  const resetResults =

    useCallback(
      () => {

        setResults([])

        setError(null)
      },
      []
    )

  // ======================================
  // Reset All
  // ======================================

  const resetFinder =

    useCallback(
      () => {

        setPurpose(
          'gaming'
        )

        setBudget(
          250000
        )

        setResults([])

        setError(null)

        setLoading(false)

      },
      []
    )

  // ======================================
  // Debug
  // ======================================

  console.log(
    '🔥 useFinderState',
    {

      purpose,

      budget,

      loading,

      resultCount:
        results.length,

      semanticUsage,

    }
  )

  // ======================================
  // Return
  // ======================================

  return {

    /* ====================================
    State
    ==================================== */

    purpose,

    setPurpose,

    budget,

    setBudget,

    loading,

    setLoading,

    error,

    setError,

    results,

    setResults,

    semanticUsage,

    semanticLabel,

    semanticDescription,

    /* ====================================
    Actions
    ==================================== */

    resetResults,

    resetFinder,

  }
}