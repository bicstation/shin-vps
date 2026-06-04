// /app/concierge/system/context/SystemContext.ts

'use client'

/* =========================================
🔥 REACT
========================================= */

import { createContext, useContext } from 'react'

/* =========================================
🔥 SYSTEM CONTEXT
========================================= */

export interface SystemContextProps {
  apiUrl: string
  semanticSchemaVersion: number
  defaultBudget: number
}

export const SystemContext = createContext<SystemContextProps>({
  apiUrl: 'http://localhost:8000/api',
  semanticSchemaVersion: 1,
  defaultBudget: 250000,
})

export const useSystemContext = () => useContext(SystemContext)