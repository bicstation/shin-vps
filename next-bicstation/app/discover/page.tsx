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
 * ✓ Pass Runtime to Frontend
 *
 * This module SHALL NOT:
 *
 * ✗ Render UI
 * ✗ Manage State
 * ✗ Generate Meaning
 * ✗ Apply Presentation Logic
 *
 * ============================================================================
 */

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

    semantic_runtime:
      true,

    adaptive_runtime:
      true,

  }

  // ==========================================================================
  // Render
  // ==========================================================================

  return (

    <DiscoverRuntimeOrchestrator

      runtime={

        runtime

      }

    />

  )

}