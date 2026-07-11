// ============================================================================
// FILE:
// /shared/publishing/twitter.ts
// Copyright (c) 2024 Shin Corporation.
// All rights reserved.
// ============================================================================

/**
 * ============================================================================
 * SHIN CORE LINX
 * Publishing
 * Twitter Contracts
 * ============================================================================
 *
 * PURPOSE
 *
 * Framework independent Twitter Card definitions.
 *
 * This module defines the canonical Twitter publishing contract
 * consumed by Platform adapters.
 *
 * ============================================================================
 */

import {
  DEFAULT_IMAGES,
  DEFAULT_METADATA,
  TWITTER,
} from './constants'

/* ============================================================================
🔥 Twitter Image
============================================================================ */

export interface PublishingTwitterImage {

  url: string

  alt?: string

}

/* ============================================================================
🔥 Twitter
============================================================================ */

export interface PublishingTwitter {

  card?:
    | 'summary'
    | 'summary_large_image'
    | 'app'
    | 'player'

  site?: string

  creator?: string

  title?: string

  description?: string

  images?:
    PublishingTwitterImage[]

}

/* ============================================================================
🔥 Default Twitter
============================================================================ */

export const defaultTwitter:
PublishingTwitter = {

  card:
    TWITTER.CARD,

  title:
    DEFAULT_METADATA.TITLE,

  description:
    DEFAULT_METADATA.DESCRIPTION,

  images: [

    {

      url:
        DEFAULT_IMAGES.OGP,

      alt:
        DEFAULT_METADATA.TITLE,

    },

  ],

}