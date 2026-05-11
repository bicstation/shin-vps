// /app/concierge/providers/ConciergeProvider.tsx

'use client'

import {
  createContext,
  useContext,
  useState,
  ReactNode,
} from 'react'

/* =========================================
🔥 CONTRACTS
========================================= */

import type {
  SemanticIntent,
} from '../contracts/semantic/SemanticIntent'

/* =========================================
🔥 Context Type
========================================= */

type ConciergeContextType = {

  semanticIntent?: SemanticIntent

  setSemanticIntent?: (
    intent: SemanticIntent
  ) => void
}

/* =========================================
🔥 Default Context
========================================= */

const ConciergeContext =
  createContext<ConciergeContextType>({})

/* =========================================
🔥 Props
========================================= */

type Props = {

  children: ReactNode
}

/* =========================================
🔥 Provider
========================================= */

export default function
ConciergeProvider({
  children,
}: Props) {

  const [
    semanticIntent,
    setSemanticIntent,
  ] = useState<SemanticIntent>()

  return (

    <ConciergeContext.Provider

      value={{

        semanticIntent,

        setSemanticIntent,

      }}
    >

      {children}

    </ConciergeContext.Provider>

  )
}

/* =========================================
🔥 Hook
========================================= */

export function useConciergeContext() {

  return useContext(
    ConciergeContext
  )
}