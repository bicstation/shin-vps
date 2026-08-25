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

  const top = await getTopRuntime()

  const seo =
    top?.seo ?? {}

  return toNextMetadata(
    createMetadata({
      title:
        seo?.title,

      description:
        seo?.description,

      keywords:
        seo?.keywords,

      canonical:
        seo?.canonical ||
        'https://bicstation.com',

      openGraph:
        seo?.open_graph,

      twitter:
        seo?.twitter,

      jsonLd:
        seo?.schema_jsonld,
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

  const top = await getTopRuntime()

  const runtime = {
    top,
  }

  console.log(
    '🔥 HOME TOP ONLY',
    {
      top: !!top,
    }
  )

  return (
    <HomeRuntimeOrchestrator
      runtime={runtime}
    />
  )
}