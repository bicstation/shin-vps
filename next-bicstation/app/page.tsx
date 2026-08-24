// ============================================================================
// FILE:
// /app/page.tsx
// Copyright (c) 2026 Shin Corporation.
// ============================================================================

import type { Metadata } from 'next'

import { createMetadata } from '@/shared/publishing'
import { toNextMetadata } from './publishing/next'

import { getTopRuntime } from '@/shared/lib/api/django/pc/top'

import HomeRuntimeOrchestrator
  from './home/orchestration/HomeRuntimeOrchestrator'


// ============================================================================
// Metadata
// ============================================================================

export async function generateMetadata(): Promise<Metadata> {
  return toNextMetadata(
    createMetadata({
      canonical: 'https://bicstation.com',
    })
  )
}


// ============================================================================
// Home Page
// ============================================================================

export default async function Page() {

  console.log(
    '🔥 HOME PAGE EXECUTE',
    new Date().toISOString(),
  )

  // ========================================================================
  // TOP ONLY — Navigation Runtime disabled for verification
  // ========================================================================

  const top = await getTopRuntime()

  // ========================================================================
  // Runtime
  // ========================================================================

  const runtime = {
    navigation: null,
    top,
  }

  console.log(
    '🔥 HOME TOP ONLY',
    {
      top: !!top,
      navigation: false,
    }
  )

  return (
    <HomeRuntimeOrchestrator
      runtime={runtime}
    />
  )
}