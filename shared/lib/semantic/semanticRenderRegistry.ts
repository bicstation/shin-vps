// /shared/lib/semantic/semanticRenderRegistry.ts

/**
 * =========================================
🔥 SHIN CORE LINX
Semantic Render Registry
=========================================

semantic attribute
↓
visual rendering authority

frontend responsibilities:
- rendering
- emphasis
- visual hierarchy
- semantic surface

backend responsibilities:
- semantic meaning
- grouping
- semantic authority
- ordering

=========================================
*/

/* =========================================
🔥 Types
========================================= */

export type SemanticRenderConfig = {

  variant: string

  className: string

  priority?: number
}

/* =========================================
🔥 Shared Styles
========================================= */

const BASE_STYLE = `
  border
  backdrop-blur-sm
`

/* =========================================
🔥 Registry
========================================= */

export const semanticRenderRegistry: Record<
  string,
  SemanticRenderConfig
> = {

  // =====================================
  // GPU
  // =====================================
  gpu: {

    variant: 'gpu',

    priority: 100,

    className: `
      ${BASE_STYLE}

      bg-emerald-500/12
      text-emerald-300

      border-emerald-400/20

      shadow-[0_0_18px_rgba(16,185,129,0.08)]
    `,
  },

  // =====================================
  // CPU
  // =====================================
  cpu: {

    variant: 'cpu',

    priority: 90,

    className: `
      ${BASE_STYLE}

      bg-cyan-500/12
      text-cyan-300

      border-cyan-400/20

      shadow-[0_0_18px_rgba(34,211,238,0.08)]
    `,
  },

  // =====================================
  // Usage / Intent
  // =====================================
  usage: {

    variant: 'usage',

    priority: 120,

    className: `
      ${BASE_STYLE}

      bg-orange-500/14
      text-orange-200

      border-orange-400/22

      shadow-[0_0_22px_rgba(249,115,22,0.10)]
    `,
  },

  // =====================================
  // Maker
  // =====================================
  maker: {

    variant: 'maker',

    priority: 50,

    className: `
      ${BASE_STYLE}

      bg-blue-500/12
      text-blue-200

      border-blue-400/18

      shadow-[0_0_18px_rgba(59,130,246,0.06)]
    `,
  },

  // =====================================
  // Memory
  // =====================================
  memory: {

    variant: 'memory',

    priority: 70,

    className: `
      ${BASE_STYLE}

      bg-sky-500/12
      text-sky-200

      border-sky-400/18

      shadow-[0_0_18px_rgba(14,165,233,0.06)]
    `,
  },

  // =====================================
  // Storage
  // =====================================
  storage: {

    variant: 'storage',

    priority: 70,

    className: `
      ${BASE_STYLE}

      bg-purple-500/12
      text-purple-200

      border-purple-400/18

      shadow-[0_0_18px_rgba(168,85,247,0.08)]
    `,
  },

  // =====================================
  // Feature
  // =====================================
  feature: {

    variant: 'feature',

    priority: 60,

    className: `
      ${BASE_STYLE}

      bg-pink-500/12
      text-pink-200

      border-pink-400/18

      shadow-[0_0_18px_rgba(236,72,153,0.08)]
    `,
  },

  // =====================================
  // AI Semantic
  // =====================================
  ai: {

    variant: 'ai',

    priority: 130,

    className: `
      ${BASE_STYLE}

      bg-fuchsia-500/14
      text-fuchsia-200

      border-fuchsia-400/22

      shadow-[0_0_24px_rgba(217,70,239,0.12)]
    `,
  },

  // =====================================
  // Portable
  // =====================================
  portable: {

    variant: 'portable',

    priority: 80,

    className: `
      ${BASE_STYLE}

      bg-lime-500/12
      text-lime-200

      border-lime-400/18

      shadow-[0_0_18px_rgba(132,204,22,0.08)]
    `,
  },

  // =====================================
  // Gaming
  // =====================================
  gaming: {

    variant: 'gaming',

    priority: 140,

    className: `
      ${BASE_STYLE}

      bg-red-500/14
      text-red-200

      border-red-400/24

      shadow-[0_0_24px_rgba(239,68,68,0.12)]
    `,
  },

  // =====================================
  // Creator
  // =====================================
  creator: {

    variant: 'creator',

    priority: 110,

    className: `
      ${BASE_STYLE}

      bg-violet-500/14
      text-violet-200

      border-violet-400/22

      shadow-[0_0_22px_rgba(139,92,246,0.10)]
    `,
  },

  // =====================================
  // Work
  // =====================================
  work: {

    variant: 'work',

    priority: 90,

    className: `
      ${BASE_STYLE}

      bg-slate-500/14
      text-slate-200

      border-slate-300/18

      shadow-[0_0_18px_rgba(148,163,184,0.08)]
    `,
  },

  // =====================================
  // Default
  // =====================================
  default: {

    variant: 'default',

    priority: 0,

    className: `
      ${BASE_STYLE}

      bg-white/[0.04]
      text-slate-100

      border-white/10
    `,
  },
}