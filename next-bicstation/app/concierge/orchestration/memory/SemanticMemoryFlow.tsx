// /app/concierge/orchestration/memory/SemanticMemoryFlow.tsx

'use client'

import {
  useEffect,
  useMemo,
  useState,
} from 'react'

/* =========================================
🔥 CONTRACTS
========================================= */

import type {
  SemanticIntent,
} from '../contracts/semantic/SemanticIntent'

/* =========================================
🔥 DOMAIN
========================================= */

import MemoryDomain
  from '../domain/memory/memoryDomain'

/* =========================================
🔥 HELPERS
========================================= */

import {
  randomId,
} from '../lib/core/helpers'

/* =========================================
🔥 FORMATTER
========================================= */

import {
  formatSemanticSummary,
} from '../lib/formatter/formatter'

/* =========================================
🔥 Props
========================================= */

type Props = {

  semanticIntent?:
    SemanticIntent

  sessionKey?: string

  onRestore?: (
    semanticIntent:
      SemanticIntent
  ) => void
}

/* =========================================
🔥 Semantic Memory Flow
========================================= */

export default function
SemanticMemoryFlow({
  semanticIntent,
  sessionKey = 'semantic-memory',
  onRestore,
}: Props) {

  // ======================================
  // Runtime State
  // ======================================

  const [
    restored,
    setRestored,
  ] = useState(false)

  // ======================================
  // Semantic Summary
  // ======================================

  const summary =

    useMemo(() => (

      formatSemanticSummary(
        semanticIntent
      )

    ), [semanticIntent])

  // ======================================
  // Restore Semantic Memory
  // ======================================

  useEffect(() => {

    if (
      restored
    ) {

      return
    }

    try {

      const raw =

        localStorage.getItem(
          sessionKey
        )

      if (
        raw
      ) {

        const parsed =
          JSON.parse(raw)

        const restoredIntent =

          parsed
            ?.memory
            ?.semanticIntent

        if (
          restoredIntent
        ) {

          onRestore?.(
            restoredIntent
          )
        }
      }

    } catch (error) {

      console.error(
        '🔥 Semantic Memory Restore'
      )

      console.error(error)

    } finally {

      setRestored(true)
    }

  }, [

    restored,
    sessionKey,
    onRestore,

  ])

  // ======================================
  // Persist Semantic Intent
  // ======================================

  useEffect(() => {

    if (
      !restored
    ) {

      return
    }

    const memory =

      MemoryDomain
        .saveSemanticIntent({

          memory:

            MemoryDomain
              .createMemory(),

          semanticIntent:
            semanticIntent || {},

        })

    const payload = {

      id:
        randomId(),

      sessionKey,

      summary,

      memory,

      updated_at:
        new Date()
          .toISOString(),

    }

    try {

      localStorage.setItem(

        sessionKey,

        JSON.stringify(
          payload
        )

      )

    } catch (error) {

      console.error(
        '🔥 Semantic Memory Save'
      )

      console.error(error)
    }

  }, [

    restored,
    sessionKey,
    semanticIntent,
    summary,

  ])

  // ======================================
  // Metrics
  // ======================================

  const metrics = {

    restored,

    usage:
      semanticIntent
        ?.usage || null,

    budget:
      semanticIntent
        ?.budget || null,

    gpu:
      semanticIntent
        ?.gpu || null,

    ai:
      semanticIntent
        ?.ai || false,

  }

  // ======================================
  // Debug
  // ======================================

  console.log(
    '🔥 Semantic Memory Flow'
  )

  console.log({

    summary,

    metrics,

  })

  // ======================================
  // Render
  // ======================================

  return (

    <div
      style={{

        display:
          'none',

      }}
    >

      semantic_memory_ready

    </div>

  )
}