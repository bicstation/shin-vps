// /app/concierge/providers/SemanticProvider.tsx

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
} from '@/app/concierge/contracts/semantic/SemanticIntent'

/* =========================================
🔥 Context Type
========================================= */

type SemanticContextType = {

  semanticIntent?: SemanticIntent

  setSemanticIntent?: (
    intent: SemanticIntent
  ) => void
}

/* =========================================
🔥 Default Context
========================================= */

const SemanticContext =
  createContext<SemanticContextType>({})

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
SemanticProvider({
  children,
}: Props) {

  const [
    semanticIntent,
    setSemanticIntent,
  ] = useState<SemanticIntent>()

  return (

    <SemanticContext.Provider

      value={{

        semanticIntent,

        setSemanticIntent,

      }}
    >

      {children}

    </SemanticContext.Provider>

  )
}

/* =========================================
🔥 Hook
========================================= */

export function useSemanticContext() {

  return useContext(
    SemanticContext
  )
}