// /home/maya/shin-dev/shin-vps/shared/components/semantic/semanticRenderRegistry.ts

/**
 * =========================================
 * semantic render registry
 * =========================================
 *
 * semantic attribute
 * ↓
 * visual rendering policy
 *
 * frontend は:
 * semantic meaning を持たず、
 * rendering のみ担当する
 * =========================================
 */

export const semanticRenderRegistry = {

  // -------------------------
  // GPU
  // -------------------------
  gpu: {

    variant: 'accent',

    className: `
      bg-green-500/15
      text-green-300
      border border-green-500/30
    `,

  },

  // -------------------------
  // CPU
  // -------------------------
  cpu: {

    variant: 'compute',

    className: `
      bg-cyan-500/15
      text-cyan-300
      border border-cyan-500/30
    `,

  },

  // -------------------------
  // usage / semantic intent
  // -------------------------
  usage: {

    variant: 'intent',

    className: `
      bg-orange-500/15
      text-orange-300
      border border-orange-500/30
    `,

  },

  // -------------------------
  // maker
  // -------------------------
  maker: {

    variant: 'neutral',

    className: `
      bg-blue-500/15
      text-blue-300
      border border-blue-500/30
    `,

  },

  // -------------------------
  // memory
  // -------------------------
  memory: {

    variant: 'spec',

    className: `
      bg-cyan-500/15
      text-cyan-300
      border border-cyan-500/30
    `,

  },

  // -------------------------
  // storage
  // -------------------------
  storage: {

    variant: 'spec',

    className: `
      bg-purple-500/15
      text-purple-300
      border border-purple-500/30
    `,

  },

  // -------------------------
  // AI
  // -------------------------
  ai: {

    variant: 'ai',

    className: `
      bg-pink-500/15
      text-pink-300
      border border-pink-500/30
    `,

  },

  // -------------------------
  // default
  // -------------------------
  default: {

    variant: 'default',

    className: `
      bg-white/10
      text-white
      border border-white/10
    `,

  },

} as const