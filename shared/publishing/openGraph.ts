// ============================================================================
// FILE:
// /shared/publishing/openGraph.ts
// Copyright (c) 2024 Shin Corporation.
// All rights reserved.
// ============================================================================

/**
 * ============================================================================
 * SHIN CORE LINX
 * Publishing
 * Open Graph Contracts
 * ============================================================================
 *
 * PURPOSE
 *
 * Framework independent Open Graph definitions.
 *
 * This module defines the canonical Publishing contract consumed by
 * Platform adapters.
 *
 * ============================================================================
 */

import {
  DEFAULT_IMAGES,
  DEFAULT_METADATA,
  OPEN_GRAPH,
  SITE,
} from './constants'

/* ============================================================================
🔥 Open Graph Image
============================================================================ */

export interface PublishingOpenGraphImage {

  url: string

  width?: number

  height?: number

  alt?: string

}

/* ============================================================================
🔥 Open Graph
============================================================================ */

export interface PublishingOpenGraph {

  title?: string

  description?: string

  url?: string

  siteName?: string

  type?: string

  locale?: string

  images?: PublishingOpenGraphImage[]

}

/* ============================================================================
🔥 Default Open Graph
============================================================================ */

export const defaultOpenGraph:
PublishingOpenGraph = {

  title:
    DEFAULT_METADATA.TITLE,

  description:
    DEFAULT_METADATA.DESCRIPTION,

  url:
    SITE.URL,

  siteName:
    OPEN_GRAPH.SITE_NAME,

  type:
    OPEN_GRAPH.TYPE,

  locale:
    OPEN_GRAPH.LOCALE,

  images: [

    {

      url:
        DEFAULT_IMAGES.OGP,

    },

  ],

}