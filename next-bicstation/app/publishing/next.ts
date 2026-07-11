// ============================================================================
// FILE:
// /app/publishing/next.ts
// Copyright (c) 2024 Shin Corporation.
// All rights reserved.
// ============================================================================

/**
 * ============================================================================
 * SHIN CORE LINX
 * Publishing
 * Next.js Adapter
 * ============================================================================
 *
 * PURPOSE
 *
 * Convert Publishing contracts into Next.js Metadata.
 *
 * This module SHALL:
 *
 * ✓ Convert PublishingMetadata
 * ✓ Remain framework adapter
 *
 * This module SHALL NOT:
 *
 * ✗ Generate Meaning
 * ✗ Generate SEO
 * ✗ Generate Open Graph
 * ✗ Generate JSON-LD
 * ✗ Fetch Runtime
 *
 * ============================================================================
 */

import type {
  Metadata,
} from 'next'

import type {
  PublishingMetadata,
} from '@shared/publishing'

/* ============================================================================
🔥 Next Metadata Adapter
============================================================================ */

export function toNextMetadata(

  publishing:
    PublishingMetadata,

): Metadata {

  return {

    title:
      publishing.title,

    description:
      publishing.description,

    keywords:
      publishing.keywords,

    alternates: {

      canonical:
        publishing.canonical,

    },

    openGraph:
      publishing.openGraph,

    twitter:
      publishing.twitter,

    robots:
      publishing.robots,

    other:
      publishing.other,

  }

}