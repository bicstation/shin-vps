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

  }

}