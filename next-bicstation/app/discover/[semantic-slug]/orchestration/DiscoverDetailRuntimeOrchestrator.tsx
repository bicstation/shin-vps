// ============================================================================
// FILE:
// /app/discover/[semantic-slug]/orchestration/DiscoverDetailRuntimeOrchestrator.tsx
// Copyright (c) 2024 Shin Corporation.
// All rights reserved.
// ============================================================================

'use client'

/**
 * ============================================================================
 * SHIN CORE LINX
 * Discover Detail Runtime Orchestrator
 * ============================================================================
 *
 * PURPOSE
 *
 * Frontend Experience Orchestrator.
 *
 * This module SHALL:
 *
 * ✓ Compose Discover Experience
 * ✓ Render Frontend Components
 * ✓ Manage Experience Flow
 *
 * This module SHALL NOT:
 *
 * ✗ Fetch Runtime
 * ✗ Fetch Dictionary
 * ✗ Generate Metadata
 * ✗ Generate Meaning
 *
 * ============================================================================
 */

import Hero
  from '../components/Hero'

import About
  from '../components/About'

import Elements
  from '../components/Elements'

import RepresentativeProducts
  from '../components/RepresentativeProducts'

import RelatedWorlds
  from '../components/RelatedWorlds'

import ContinueDiscovery
  from '../components/ContinueDiscovery'

import type {

  DiscoverDetailRuntime,

} from '@/shared/lib/api/django/pc/discover-detail'

import type {

  ExperienceDictionary,

} from '../types/experience'

/* ============================================================================
Props
============================================================================ */

interface DiscoverDetailRuntimeOrchestratorProps {

  runtime: {

    semantic: DiscoverDetailRuntime

    dictionary: ExperienceDictionary

    semantic_runtime: boolean

    adaptive_runtime: boolean

  }

}

/* ============================================================================
Runtime Orchestrator
============================================================================ */

export default function DiscoverDetailRuntimeOrchestrator(

  {

    runtime,

  }: DiscoverDetailRuntimeOrchestratorProps,

) {

  const {

    semantic,

    dictionary,

  } = runtime

  return (

    <main>

      <Hero

        runtime={semantic}

        dictionary={dictionary.hero}

      />

      <About

        dictionary={dictionary.about}

      />

      <Elements

        runtime={semantic}

        dictionary={dictionary.elements}

      />

      <RepresentativeProducts

        runtime={semantic}

        dictionary={dictionary.products}

      />

      <RelatedWorlds

        runtime={semantic}

        dictionary={dictionary.related}

      />

      <ContinueDiscovery

        dictionary={dictionary.continue}

      />

    </main>

  )

}