// /shared/lib/semantic/semanticHeroPolicy.ts

/* =========================================
🔥 Types
========================================= */

export type SemanticHeroPolicy = {

  accent: string

  cta: string

  emphasis: string
}

/* =========================================
🔥 Semantic Hero Visual Policy
========================================= */

export const semanticHeroPolicy:
  Record<
    string,
    SemanticHeroPolicy
  > = {

  // ======================================
  // Usage
  // ======================================

  'usage-gaming': {

    accent:
      'from-green-500/20 to-emerald-500/5',

    cta:
      'bg-green-500 hover:bg-green-400',

    emphasis:
      'ring-2 ring-green-400/30',
  },

  'usage-creator': {

    accent:
      'from-purple-500/20 to-pink-500/5',

    cta:
      'bg-purple-500 hover:bg-purple-400',

    emphasis:
      'ring-2 ring-purple-400/30',
  },

  'usage-business': {

    accent:
      'from-blue-500/20 to-cyan-500/5',

    cta:
      'bg-blue-500 hover:bg-blue-400',

    emphasis:
      'ring-2 ring-blue-400/30',
  },

  'usage-ai': {

    accent:
      'from-orange-500/20 to-red-500/5',

    cta:
      'bg-orange-500 hover:bg-orange-400',

    emphasis:
      'ring-2 ring-orange-400/30',
  },

  // ======================================
  // Device
  // ======================================

  'device-laptop': {

    accent:
      'from-indigo-500/20 to-blue-500/5',

    cta:
      'bg-indigo-500 hover:bg-indigo-400',

    emphasis:
      'ring-2 ring-indigo-400/30',
  },

  'device-desktop': {

    accent:
      'from-slate-500/20 to-zinc-500/5',

    cta:
      'bg-slate-500 hover:bg-slate-400',

    emphasis:
      'ring-2 ring-slate-400/30',
  },

  'device-workstation': {

    accent:
      'from-fuchsia-500/20 to-purple-500/5',

    cta:
      'bg-fuchsia-500 hover:bg-fuchsia-400',

    emphasis:
      'ring-2 ring-fuchsia-400/30',
  },

  'device-server': {

    accent:
      'from-red-500/20 to-rose-500/5',

    cta:
      'bg-red-500 hover:bg-red-400',

    emphasis:
      'ring-2 ring-red-400/30',
  },

  // ======================================
  // Default
  // ======================================

  default: {

    accent:
      'from-white/10 to-white/5',

    cta:
      'bg-orange-500 hover:bg-orange-400',

    emphasis:
      'ring-1 ring-white/10',
  },
}

