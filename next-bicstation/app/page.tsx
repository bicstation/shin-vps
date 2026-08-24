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
import HomeRuntimeOrchestrator from './home/orchestration/HomeRuntimeOrchestrator'

export async function generateMetadata(): Promise<Metadata> {
  return toNextMetadata(
    createMetadata({
      canonical: 'https://bicstation.com',
    })
  )
}

export default async function Page() {
  async function measureRuntime<T>(
    name: string,
    runtimePromise: Promise<T>,
  ): Promise<T> {
    const startedAt = performance.now()

    console.log(
      `⏱️ TOP RUNTIME START: ${name}`
    )

    try {
      const result = await runtimePromise
      const elapsed = performance.now() - startedAt

      console.log(
        `⏱️ TOP RUNTIME COMPLETE: ${name} = ${elapsed.toFixed(0)}ms`
      )

      return result
    } catch (error) {
      const elapsed = performance.now() - startedAt

      console.error(
        `⏱️ TOP RUNTIME ERROR: ${name} = ${elapsed.toFixed(0)}ms`,
        error,
      )

      throw error
    }
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🔥 TOP PAGE RUNTIME START')

  const startedAt = performance.now()

  const [navigation, top] = await Promise.all([
    measureRuntime(
      'navigation',
      fetchNavigationRuntime(),
    ),
    measureRuntime(
      'top',
      getTopRuntime(),
    ),
  ])

  const elapsed = performance.now() - startedAt

  console.log(
    `🔥 TOP PAGE RUNTIME COMPLETE = ${elapsed.toFixed(0)}ms`
  )

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  const runtime = {
    navigation,
    top,
  }

  console.log(
    '🔥 TOP PAGE RUNTIME',
    {
      top: !!top,
      navigation: !!navigation,
    }
  )

  return (
    <HomeRuntimeOrchestrator
      runtime={runtime}
    />
  )
}