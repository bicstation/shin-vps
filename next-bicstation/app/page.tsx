// ============================================================================
// FILE:
// /app/page.tsx
// Copyright (c) 2026 Shin Corporation.
// ============================================================================

import type { Metadata } from 'next'

import { createMetadata } from '@/shared/publishing'
import { toNextMetadata } from './publishing/next'

import { fetchNavigationRuntime } from '@/shared/lib/api/django/pc/navigation'
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

  const [
    navigation,
    top,
  ] = await Promise.all([
    fetchNavigationRuntime(),
    getTopRuntime(),
  ])

  // ========================================================================
  // Runtime
  // ========================================================================

  const runtime = {
    navigation,
    top,
  }

  return (
    <HomeRuntimeOrchestrator
      runtime={runtime}
    />
  )
}