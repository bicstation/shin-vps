// ============================================================================
// FILE:
// /app/discover/page.tsx
// Copyright (c) 2024 Shin Corporation.
// All rights reserved.
// ============================================================================

/**
 * ============================================================================
 * SHIN CORE LINX
 * Discover Page
 * ============================================================================
 *
 * PURPOSE
 *
 * Platform Runtime Entry.
 *
 * This module SHALL:
 *
 * ✓ Fetch Discover Runtime
 * ✓ Compose Platform Runtime
 * ✓ Generate Metadata
 * ✓ Pass Runtime to Frontend
 *
 * This module SHALL NOT:
 *
 * ✗ Render UI
 * ✗ Manage State
 * ✗ Generate Meaning
 * ✗ Build Experience Components
 *
 * ============================================================================
 */

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
🔥 Frontend
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
          '用途・GPU・CPU・メーカー・ブランド・価格帯など、さまざまな切り口から最適なPCを探せるDiscoverページです。',

      },

    ),

  )

/* ============================================================================
🔥 Discover Page
============================================================================ */

export default async function Page() {

  /* --------------------------------------------------------------------------
  Semantic Runtime
  -------------------------------------------------------------------------- */

  const semantic =

    await fetchSemanticRuntime()

  /* --------------------------------------------------------------------------
  Platform Runtime
  -------------------------------------------------------------------------- */

  const runtime = {

    semantic,

    semantic_runtime: true,

    adaptive_runtime: true,

  }

  /* --------------------------------------------------------------------------
  Render
  -------------------------------------------------------------------------- */

  return (

    <DiscoverRuntimeOrchestrator

      runtime={runtime}

    />

  )

}