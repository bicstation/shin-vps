// ============================================================================
// FILE:
// /shared/publishing/robots.ts
// Copyright (c) 2024 Shin Corporation.
// All rights reserved.
// ============================================================================

/**
 * ============================================================================
 * SHIN CORE LINX
 * Publishing
 * Robots Contracts
 * ============================================================================
 *
 * PURPOSE
 *
 * Framework independent Robots policy definitions.
 *
 * This module defines the canonical Robots contract consumed by
 * Platform adapters.
 *
 * ============================================================================
 */

import {
  ROBOTS,
} from './constants'

/* ============================================================================
🔥 Google Bot
============================================================================ */

export interface PublishingGoogleBot {

  index?: boolean

  follow?: boolean

  noimageindex?: boolean

  maxSnippet?: number

  maxImagePreview?:
    'none'
    | 'standard'
    | 'large'

  maxVideoPreview?: number

}

/* ============================================================================
🔥 Robots
============================================================================ */

export interface PublishingRobots {

  index?: boolean

  follow?: boolean

  noarchive?: boolean

  nocache?: boolean

  nosnippet?: boolean

  googleBot?:
    PublishingGoogleBot

}

/* ============================================================================
🔥 Default Robots
============================================================================ */

export const defaultRobots:
PublishingRobots = {

  index:
    ROBOTS.INDEX,

  follow:
    ROBOTS.FOLLOW,

  googleBot: {

    index:
      ROBOTS.INDEX,

    follow:
      ROBOTS.FOLLOW,

  },

}