// /home/maya/shin-dev/shin-vps/next-bicstation/app/concierge/page.tsx

/* eslint-disable @next/next/no-img-element */
// /app/concierge/page.tsx

import styles
  from './styles/concierge.module.css'

/* =========================================
🔥 ORCHESTRATION
========================================= */

import ConciergeLayout
  from './orchestration/layout/ConciergeLayout'

import ConciergeSemanticFlow
  from './orchestration/semantic/ConciergeSemanticFlow'

import ConciergeConversationFlow
  from './orchestration/conversation/ConciergeConversationFlow'

import ConciergeRecommendationFlow
  from './orchestration/recommendation/ConciergeRecommendationFlow'

/* =========================================
🔥 SYSTEM
========================================= */

import ConciergeLoading
  from './sections/system/ConciergeLoading'

import ConciergeError
  from './sections/system/ConciergeError'

/* =========================================
🔥 DUMMY
========================================= */

import {
  conciergeMessages,
} from './dummy/conciergeMessages'

import {
  conciergeRecommendations,
} from './dummy/conciergeRecommendations'

/* =========================================
🔥 META
========================================= */

export const metadata = {

  title:
    'AI Concierge | SHIN CORE LINX',

  description:
    'semantic AI concierge system',
}

/* =========================================
🔥 ISR
========================================= */

export const revalidate = 60

/* =========================================
🔥 PAGE
========================================= */

export default async function
ConciergePage() {

  // ======================================
  // Runtime Boot
  // ======================================

  let messages = []

  let recommendations = []

  let runtimeError =
    false

  try {

    // ====================================
    // Dummy Boot
    // ====================================

    messages =
      conciergeMessages

    recommendations =
      conciergeRecommendations

  } catch (error) {

    runtimeError = true

    console.error(
      '🔥 CONCIERGE RUNTIME ERROR'
    )

    console.error(error)
  }

  // ======================================
  // Debug
  // ======================================

  console.log(
    '\n🔥 ====================================='
  )

  console.log(
    '🔥 SHIN CORE LINX'
  )

  console.log(
    '🔥 AI CONCIERGE RUNTIME'
  )

  console.log({

    messageCount:
      messages?.length || 0,

    recommendationCount:
      recommendations?.length || 0,

    runtimeError,

  })

  console.log(
    '🔥 =====================================\n'
  )

  // ======================================
  // Runtime Error
  // ======================================

  if (
    runtimeError
  ) {

    return (
      <ConciergeError />
    )
  }

  // ======================================
  // Loading
  // ======================================

  if (
    !messages
  ) {

    return (
      <ConciergeLoading />
    )
  }

  // ======================================
  // Render
  // ======================================

  return (

    <main
      className={
        styles.page
      }
    >

      <ConciergeLayout>

        {/* ==================================
        SEMANTIC ORCHESTRATION
        semantic authority layer
        ================================== */}

        <ConciergeSemanticFlow />

        {/* ==================================
        CONVERSATION ORCHESTRATION
        conversational runtime layer
        ================================== */}

        <ConciergeConversationFlow

          messages={
            messages
          }

        />

        {/* ==================================
        RECOMMENDATION ORCHESTRATION
        commerce conversion layer
        ================================== */}

        <ConciergeRecommendationFlow

          recommendations={
            recommendations
          }

        />

      </ConciergeLayout>

    </main>
  )
}