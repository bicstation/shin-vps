// ============================================================================
// FILE:
// /shared/publishing/canonical.ts
// Copyright (c) 2024 Shin Corporation.
// All rights reserved.
// ============================================================================

/**
 * ============================================================================
 * SHIN CORE LINX
 * Publishing
 * Canonical URL Builder
 * ============================================================================
 *
 * PURPOSE
 *
 * Build canonical URLs.
 *
 * This module is framework independent.
 *
 * ============================================================================
 */

import {
  SITE,
} from './constants'

/* ============================================================================
🔥 Normalize Path
============================================================================ */

export function normalizePath(
  path: string = '/',
): string {

  if (!path) {

    return '/'

  }

  return path.startsWith('/')

    ? path

    : `/${path}`

}

/* ============================================================================
🔥 Create Canonical URL
============================================================================ */

export function createCanonical(
  path: string = '/',
): string {

  return `${SITE.URL}${

    normalizePath(
      path
    )

  }`

}

/* ============================================================================
🔥 Create Relative Canonical
============================================================================ */

export function createRelativeCanonical(
  path: string = '/',
): string {

  return normalizePath(
    path
  )

}