// ============================================================================
// FILE:
// /app/ranking/types/ranking.ts
// Copyright (c) 2024 Shin Corporation.
// All rights reserved.
// ============================================================================

/**
 * ============================================================================
 * SHIN CORE LINX
 * Ranking Experience V2
 * ============================================================================
 *
 * Frontend Experience Types
 *
 * Backend
 * ↓
 * Adapter
 * ↓
 * Frontend
 *
 * Frontend SHALL consume the Navigation Runtime directly.
 *
 * ============================================================================
 */

/* ============================================================================
🔥 Navigation Runtime
============================================================================ */

import type {

    NavigationRuntime,
    NavigationRuntimeItem,

} from '@/shared/lib/api/django/pc/navigation/contracts'

/* ============================================================================
🔥 Ranking Runtime
============================================================================ */

export type RankingRuntime =

    NavigationRuntime

/* ============================================================================
🔥 Ranking Item
============================================================================ */

export type RankingItem =

    NavigationRuntimeItem