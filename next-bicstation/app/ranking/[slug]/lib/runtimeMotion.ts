// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/[slug]/lib/runtimeMotion.ts
// ============================================================================

/* ============================================================================
🔥 Motion Runtime Type
============================================================================ */

export type RuntimeMotion = {

  duration: string

  easing: string

  hoverScale: string

  hoverTranslateY: string

  glowStrength: string

  blur: string

}

/* ============================================================================
🔥 Motion Runtime Map
============================================================================ */

const MOTION_MAP: Record<
  string,
  RuntimeMotion
> = {

  /* ==========================================================================
  🔥 Cinematic
  ========================================================================== */

  cinematic: {

    duration:
      '0.45s',

    easing:
      'cubic-bezier(0.22, 1, 0.36, 1)',

    hoverScale:
      '1.02',

    hoverTranslateY:
      '-10px',

    glowStrength:
      '0 0 90px rgba(255,255,255,0.12)',

    blur:
      '24px',

  },

  /* ==========================================================================
  🔥 Spotlight
  ========================================================================== */

  spotlight: {

    duration:
      '0.38s',

    easing:
      'ease-out',

    hoverScale:
      '1.015',

    hoverTranslateY:
      '-8px',

    glowStrength:
      '0 0 70px rgba(255,255,255,0.10)',

    blur:
      '20px',

  },

  /* ==========================================================================
  🔥 Balanced
  ========================================================================== */

  balanced: {

    duration:
      '0.30s',

    easing:
      'ease',

    hoverScale:
      '1.01',

    hoverTranslateY:
      '-4px',

    glowStrength:
      '0 0 50px rgba(255,255,255,0.08)',

    blur:
      '18px',

  },

  /* ==========================================================================
  🔥 Premium
  ========================================================================== */

  premium: {

    duration:
      '0.55s',

    easing:
      'cubic-bezier(0.19, 1, 0.22, 1)',

    hoverScale:
      '1.03',

    hoverTranslateY:
      '-12px',

    glowStrength:
      '0 0 120px rgba(255,255,255,0.16)',

    blur:
      '28px',

  },

  /* ==========================================================================
  🔥 Minimal
  ========================================================================== */

  minimal: {

    duration:
      '0.24s',

    easing:
      'linear',

    hoverScale:
      '1',

    hoverTranslateY:
      '-2px',

    glowStrength:
      '0 0 20px rgba(255,255,255,0.05)',

    blur:
      '12px',

  },

}

/* ============================================================================
🔥 Get Runtime Motion
============================================================================ */

export function getRuntimeMotion(
  tone?: string | null
): RuntimeMotion {

  if (!tone) {

    return MOTION_MAP.balanced
  }

  return (
    MOTION_MAP[
      tone
    ]
    ||
    MOTION_MAP.balanced
  )
}