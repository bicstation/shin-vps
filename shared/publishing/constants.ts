// ============================================================================
// FILE:
// /shared/publishing/constants.ts
// Copyright (c) 2024 Shin Corporation.
// All rights reserved.
// ============================================================================

/**
 * ============================================================================
 * SHIN CORE LINX
 * Publishing Constants
 * ============================================================================
 *
 * PURPOSE
 *
 * Canonical publishing definitions shared across the Publishing Layer.
 *
 * This module SHALL:
 *
 * ✓ Define publishing constants
 * ✓ Remain framework independent
 *
 * This module SHALL NOT:
 *
 * ✗ Import Next.js
 * ✗ Fetch APIs
 * ✗ Generate Metadata
 * ✗ Generate Runtime
 *
 * ============================================================================
 */

/* ============================================================================
🔥 Site
============================================================================ */

export const SITE = {

  NAME:
    'BIC STATION',

  URL:
    'https://bicstation.com',

  DOMAIN:
    'bicstation.com',

  LANGUAGE:
    'ja',

  LOCALE:
    'ja_JP',

} as const

/* ============================================================================
🔥 Application
============================================================================ */

export const APPLICATION = {

  NAME:
    SITE.NAME,

  CATEGORY:
    'technology',

} as const

/* ============================================================================
🔥 Default Metadata
============================================================================ */

export const DEFAULT_METADATA = {

  TITLE:
    '用途から探せるおすすめPC｜BIC STATION',

  DESCRIPTION:
    'AI画像生成、ゲーム、動画編集、仕事、普段使いまで。用途からおすすめPCを比較・検索できるPC選びサポートサイト。',

  KEYWORDS: [

    'おすすめPC',

    'ノートパソコン',

    'ゲーミングPC',

    'AI画像生成PC',

    '動画編集PC',

    'BTOパソコン',

  ],

} as const

/* ============================================================================
🔥 Open Graph
============================================================================ */

export const OPEN_GRAPH = {

  TYPE:
    'website',

  SITE_NAME:
    SITE.NAME,

  LOCALE:
    SITE.LOCALE,

} as const

/* ============================================================================
🔥 Twitter
============================================================================ */

export const TWITTER = {

  CARD:
    'summary_large_image',

} as const

/* ============================================================================
🔥 Robots
============================================================================ */

export const ROBOTS = {

  INDEX:
    true,

  FOLLOW:
    true,

} as const

/* ============================================================================
🔥 Default Images
============================================================================ */

export const DEFAULT_IMAGES = {

  OGP:
    '/images/ogp/default.webp',

  LOGO:
    '/images/logo/logo.webp',

} as const

/* ============================================================================
🔥 Search
============================================================================ */

export const SEARCH = {

  PATH:
    '/search',

} as const

/* ============================================================================
🔥 Organization
============================================================================ */

export const ORGANIZATION = {

  NAME:
    SITE.NAME,

  URL:
    SITE.URL,

  LOGO:
    `${SITE.URL}${DEFAULT_IMAGES.LOGO}`,

  DESCRIPTION:
    DEFAULT_METADATA.DESCRIPTION,

  SAME_AS: [

    // 将来追加
    // 'https://x.com/...',
    // 'https://github.com/...',
    // 'https://www.youtube.com/...',

  ],

} as const