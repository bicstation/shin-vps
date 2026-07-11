// ============================================================================
// FILE:
// /shared/publishing/metadata.ts
// Copyright (c) 2024 Shin Corporation.
// All rights reserved.
// ============================================================================

/**
 * ============================================================================
 * SHIN CORE LINX
 * Publishing
 * Metadata Contracts
 * ============================================================================
 *
 * PURPOSE
 *
 * Framework independent metadata definitions.
 *
 * This module defines the canonical Publishing Metadata contract
 * consumed by Platform adapters (Next.js, future frameworks, etc.).
 *
 * This module SHALL:
 *
 * ✓ Define Publishing metadata contracts
 * ✓ Define default metadata
 * ✓ Merge metadata safely
 *
 * This module SHALL NOT:
 *
 * ✗ Depend on Next.js
 * ✗ Generate Runtime
 * ✗ Generate SEO
 * ✗ Generate JSON-LD
 *
 * ============================================================================
 */

import {
  DEFAULT_METADATA,
} from './constants'

import {
  defaultOpenGraph,
  type PublishingOpenGraph,
} from './openGraph'

import {
  defaultTwitter,
  type PublishingTwitter,
} from './twitter'

import {
  defaultRobots,
  type PublishingRobots,
} from './robots'

/* ============================================================================
🔥 JSON-LD
============================================================================ */

export type PublishingJsonLd =
  Record<string, unknown>

/* ============================================================================
🔥 Metadata
============================================================================ */

export interface PublishingMetadata {

  title?: string

  description?: string

  keywords?: readonly string[]

  canonical?: string

  openGraph?: PublishingOpenGraph

  twitter?: PublishingTwitter

  robots?: PublishingRobots

  /**
   * Structured Data
   *
   * Framework adapters are responsible
   * for rendering this object.
   */
  jsonLd?: PublishingJsonLd

}

/* ============================================================================
🔥 Metadata Options
============================================================================ */

export interface PublishingMetadataOptions
  extends PublishingMetadata {

}

/* ============================================================================
🔥 Default Metadata
============================================================================ */

export const defaultMetadata:
PublishingMetadata = {

  title:
    DEFAULT_METADATA.TITLE,

  description:
    DEFAULT_METADATA.DESCRIPTION,

  keywords:
    DEFAULT_METADATA.KEYWORDS,

  openGraph:
    defaultOpenGraph,

  twitter:
    defaultTwitter,

  robots:
    defaultRobots,

}

/* ============================================================================
🔥 Metadata Builder
============================================================================ */

export function createMetadata(

  options:
    PublishingMetadataOptions = {},

): PublishingMetadata {

  return {

    ...defaultMetadata,

    ...options,

    openGraph: {

      ...defaultOpenGraph,

      ...options.openGraph,

    },

    twitter: {

      ...defaultTwitter,

      ...options.twitter,

    },

    robots: {

      ...defaultRobots,

      ...options.robots,

    },

    jsonLd:
      options.jsonLd,

  }

}