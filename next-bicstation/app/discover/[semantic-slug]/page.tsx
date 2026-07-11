// ============================================================================
// FILE:
// /app/discover/[semantic-slug]/page.tsx
// Copyright (c) 2024 Shin Corporation.
// All rights reserved.
// ============================================================================

/**
 * ============================================================================
 * SHIN CORE LINX
 * Discover Detail Page
 * ============================================================================
 *
 * PURPOSE
 *
 * Platform Runtime Entry.
 *
 * This module SHALL:
 *
 * ✓ Fetch Discover Detail Runtime
 * ✓ Fetch Experience Dictionary
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

import {
  notFound,
} from 'next/navigation'

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
🔥 Runtime
============================================================================ */

import {

  fetchDiscoverDetailRuntime,

} from '@/shared/lib/api/django/pc/discover-detail'

/* ============================================================================
🔥 Dictionary
============================================================================ */

import {

  getExperienceDictionary,

} from './services/dictionary'

/* ============================================================================
🔥 Frontend
============================================================================ */

import DiscoverDetailRuntimeOrchestrator
  from './orchestration/DiscoverDetailRuntimeOrchestrator'

/* ============================================================================
Props
============================================================================ */

interface DiscoverPageProps {

  params: Promise<{

    'semantic-slug': string

  }>

}

/* ============================================================================
Metadata
============================================================================ */

/* ============================================================================
Metadata
============================================================================ */

export async function generateMetadata(

  {

    params,

  }: DiscoverPageProps,

): Promise<Metadata> {

  const {

    'semantic-slug': groupSlug,

  } = await params

  /* --------------------------------------------------------------------------
  Semantic Runtime
  -------------------------------------------------------------------------- */

  const semantic =

    await fetchDiscoverDetailRuntime(

      groupSlug,

    )

  if (

    !semantic ||

    !semantic.found

  ) {

    return {}

  }

  /* --------------------------------------------------------------------------
  Metadata
  -------------------------------------------------------------------------- */

  return toNextMetadata(

    buildDiscoverMetadata(

      groupSlug,

      {

        title:

          semantic.seo?.title ??

          semantic.presentation?.seo_title ??

          semantic.presentation?.title ??

          semantic.data.presentation_name ??

          semantic.data.group_name ??

          'Discover | BIC STATION',

        description:

          semantic.seo?.description ??

          semantic.presentation?.seo_description ??

          semantic.presentation?.description ??

          semantic.data.presentation_description,

        keywords:

          semantic.seo?.keywords,

        ...(semantic.seo?.canonical && {

          canonical:

            semantic.seo.canonical,

        }),

      },

    ),

  )

}

/* ============================================================================
Page
============================================================================ */

export default async function Page(

  {

    params,

  }: DiscoverPageProps,

) {

  const {

    'semantic-slug': groupSlug,

  } = await params

  /* --------------------------------------------------------------------------
  Semantic Runtime
  -------------------------------------------------------------------------- */

  const semantic =

    await fetchDiscoverDetailRuntime(

      groupSlug,

    )

  if (

    !semantic ||

    !semantic.found

  ) {

    notFound()

  }

  /* --------------------------------------------------------------------------
  Experience Dictionary
  -------------------------------------------------------------------------- */

  const dictionary =

    await getExperienceDictionary(

      semantic.data.group_slug,

    )

  /* --------------------------------------------------------------------------
  Platform Runtime
  -------------------------------------------------------------------------- */

  const runtime = {

    semantic,

    dictionary,

    semantic_runtime: true,

    adaptive_runtime: true,

  }

    /* --------------------------------------------------------------------------
  Render
  -------------------------------------------------------------------------- */

  return (

    <DiscoverDetailRuntimeOrchestrator

      runtime={runtime}

    />

  )

}