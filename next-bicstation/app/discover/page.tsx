// ============================================================================
// FILE:
// /app/discover/page.tsx
// Copyright (c) 2024 Shin Corporation.
// All rights reserved.
// ============================================================================

import type {
  Metadata,
} from 'next'

/* ============================================================================
🔥 Publishing
============================================================================ */

import {

  buildDiscoverMetadata,

} from '@/shared/publishing'

import {

  toNextMetadata,

} from '@/app/publishing/next'

/* ============================================================================
🔥 Discover Runtime
============================================================================ */

import {

  fetchSemanticRuntime,

} from '@/shared/lib/api/django/pc/semantics'

/* ============================================================================
🔥 Frontend Orchestrator
============================================================================ */

import DiscoverRuntimeOrchestrator
  from './orchestration/DiscoverRuntimeOrchestrator'

/* ============================================================================
🔥 Metadata
============================================================================ */

export const metadata: Metadata =

  toNextMetadata(

    buildDiscoverMetadata(

      undefined,

      {

        title:
          'Discover｜用途・性能・ブランドからPCを探す｜BIC STATION',

        description:
          '用途・GPU・CPU・メーカーなど様々な切り口からPCを探せるDiscoverページです。',

      },

    ),

  )

/* ============================================================================
🔥 Discover Page
============================================================================ */

export default async function Page() {

  // ==========================================================================
  // Runtime Fetch
  // ==========================================================================

  const semantic =

    await fetchSemanticRuntime()

  // ==========================================================================
  // Platform Runtime
  // ==========================================================================

  const runtime = {

    semantic,

    semantic_runtime: true,

    adaptive_runtime: true,

  }

  // ==========================================================================
  // Render
  // ==========================================================================

  return (

    <DiscoverRuntimeOrchestrator

      runtime={runtime}

    />

  )

}