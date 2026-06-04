// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/[slug]/hooks/useRuntimeTheme.ts
// ============================================================================

'use client'

import {
  useMemo,
} from 'react'

/* ============================================================================
🔥 Runtime Theme Type
============================================================================ */

export type RuntimeTheme = {

  glow: string

  accent: string

  surface: string

  border: string

  text: string

  muted: string

}

/* ============================================================================
🔥 Semantic Runtime Theme Map
============================================================================ */

const RUNTIME_THEMES: Record<
  string,
  RuntimeTheme
> = {

  /* ==========================================================================
  🔥 Gaming
  ========================================================================== */

  gaming: {

    glow:
      'rgba(239,68,68,0.35)',

    accent:
      '#f87171',

    surface:
      'rgba(127,29,29,0.22)',

    border:
      'rgba(248,113,113,0.28)',

    text:
      '#ffffff',

    muted:
      '#fca5a5',

  },

  /* ==========================================================================
  🔥 AI
  ========================================================================== */

  ai: {

    glow:
      'rgba(168,85,247,0.35)',

    accent:
      '#c084fc',

    surface:
      'rgba(88,28,135,0.22)',

    border:
      'rgba(192,132,252,0.28)',

    text:
      '#ffffff',

    muted:
      '#d8b4fe',

  },

  /* ==========================================================================
  🔥 Creator
  ========================================================================== */

  creator: {

    glow:
      'rgba(59,130,246,0.35)',

    accent:
      '#60a5fa',

    surface:
      'rgba(30,64,175,0.22)',

    border:
      'rgba(96,165,250,0.28)',

    text:
      '#ffffff',

    muted:
      '#93c5fd',

  },

  /* ==========================================================================
  🔥 Business
  ========================================================================== */

  business: {

    glow:
      'rgba(16,185,129,0.30)',

    accent:
      '#34d399',

    surface:
      'rgba(6,78,59,0.22)',

    border:
      'rgba(52,211,153,0.28)',

    text:
      '#ffffff',

    muted:
      '#6ee7b7',

  },

  /* ==========================================================================
  🔥 Default
  ========================================================================== */

  default: {

    glow:
      'rgba(59,130,246,0.25)',

    accent:
      '#60a5fa',

    surface:
      'rgba(30,41,59,0.22)',

    border:
      'rgba(148,163,184,0.22)',

    text:
      '#ffffff',

    muted:
      '#94a3b8',

  },

}

/* ============================================================================
🔥 Detect Runtime Theme
============================================================================ */

function detectRuntimeTheme(
  runtime: any
): keyof typeof RUNTIME_THEMES {

  const seoTitle =
    runtime?.seo?.title
      ?.toLowerCase?.()
    || ''

  const seoDescription =
    runtime?.seo?.description
      ?.toLowerCase?.()
    || ''

  const combined =
    `${seoTitle} ${seoDescription}`

  /* ==========================================================================
  🔥 Theme Detection
  ========================================================================== */

  if (
    combined.includes('gaming')
    ||
    combined.includes('ゲーミング')
  ) {

    return 'gaming'
  }

  if (
    combined.includes('ai')
    ||
    combined.includes('生成ai')
  ) {

    return 'ai'
  }

  if (
    combined.includes('creator')
    ||
    combined.includes('クリエイター')
  ) {

    return 'creator'
  }

  if (
    combined.includes('business')
    ||
    combined.includes('ビジネス')
  ) {

    return 'business'
  }

  return 'default'
}

/* ============================================================================
🔥 useRuntimeTheme
============================================================================ */

export default function useRuntimeTheme(
  runtime: any
) {

  return useMemo(() => {

    const themeKey =
      detectRuntimeTheme(runtime)

    const theme =
      RUNTIME_THEMES[
        themeKey
      ]

    return {

      themeKey,

      theme,

    }

  }, [runtime])
}