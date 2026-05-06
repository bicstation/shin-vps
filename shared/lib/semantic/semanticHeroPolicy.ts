// /shared/lib/semantic/semanticHeroPolicy.ts

export const semanticHeroPolicy = {

  gaming: {

    accent:
      'from-green-500/20 to-emerald-500/5',

    cta:
      'bg-green-500 hover:bg-green-400',

    emphasis:
      'ring-2 ring-green-400/30',

  },

  creator: {

    accent:
      'from-purple-500/20 to-pink-500/5',

    cta:
      'bg-purple-500 hover:bg-purple-400',

    emphasis:
      'ring-2 ring-purple-400/30',

  },

  office: {

    accent:
      'from-blue-500/20 to-cyan-500/5',

    cta:
      'bg-blue-500 hover:bg-blue-400',

    emphasis:
      'ring-2 ring-blue-400/30',

  },

  ai: {

    accent:
      'from-orange-500/20 to-red-500/5',

    cta:
      'bg-orange-500 hover:bg-orange-400',

    emphasis:
      'ring-2 ring-orange-400/30',

  },

  default: {

    accent:
      'from-white/10 to-white/5',

    cta:
      'bg-orange-500 hover:bg-orange-400',

    emphasis:
      'ring-1 ring-white/10',

  },

} as const