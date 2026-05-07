'use client'

import clsx from 'clsx'

import {
  SemanticAttribute,
} from '@/shared/types/semantic'

import {
  semanticRenderRegistry,
} from '@/shared/lib/semantic/semanticRenderRegistry'

/* =========================================
🔥 Config
========================================= */

const IS_DEV =
  process.env.NODE_ENV ===
  'development'

/* =========================================
🔥 Group Order Authority
========================================= */

export const SEMANTIC_ROLE_ORDER = [
  'highlight',
  'primary',
  'secondary',
  'supportive',
]

/* =========================================
🔥 Props
========================================= */

type Props = {
  attribute?: SemanticAttribute | null
}

/* =========================================
🔥 Logger
========================================= */

function logWarn(
  label: string,
  payload?: unknown
) {

  if (!IS_DEV) {
    return
  }

  console.warn(
    `[${label}]`,
    payload ?? ''
  )
}

/* =========================================
🔥 Normalize Weight
========================================= */

function normalizeWeight(
  value?: number
) {

  // backend authority:
  // semantic_weight = 0.0 ~ 1.0

  if (
    typeof value !== 'number'
  ) {
    return 0
  }

  return Math.max(
    0,
    Math.min(1, value)
  )
}

/* =========================================
🔥 Weight Variant
========================================= */

function getWeightVariant(
  rawWeight?: number
) {

  const weight =
    normalizeWeight(rawWeight)

  // Hero
  if (weight >= 0.9) {

    return {

      scale:
        'scale-[1.06]',

      glow:
        `
        shadow-[0_0_24px_rgba(249,115,22,0.28)]
        `
    }
  }

  // Strong
  if (weight >= 0.7) {

    return {

      scale:
        'scale-[1.03]',

      glow:
        `
        shadow-[0_0_16px_rgba(249,115,22,0.16)]
        `
    }
  }

  // Medium
  if (weight >= 0.4) {

    return {

      scale: '',
      glow: '',
    }
  }

  // Weak
  return {

    scale:
      'opacity-70',

    glow: '',
  }
}

/* =========================================
🔥 Role Variant
========================================= */

function getRoleVariant(
  role?: string
) {

  switch (role) {

    // -------------------------
    // Highlight
    // -------------------------
    case 'highlight':

      return {

        ring:
          `
          ring-2
          ring-orange-400/40
          `,

        background:
          `
          bg-orange-500/10
          `
      }

    // -------------------------
    // Primary
    // -------------------------
    case 'primary':

      return {

        ring:
          `
          ring-2
          ring-sky-400/30
          `,

        background:
          `
          bg-sky-500/10
          `
      }

    // -------------------------
    // Secondary
    // -------------------------
    case 'secondary':

      return {

        ring:
          `
          ring-1
          ring-white/10
          `,

        background:
          `
          bg-white/[0.04]
          `
      }

    // -------------------------
    // Supportive
    // -------------------------
    case 'supportive':

      return {

        ring: '',

        background:
          `
          bg-white/[0.02]
          opacity-80
          `
      }

    // -------------------------
    // Default
    // -------------------------
    default:

      return {

        ring: '',

        background:
          `
          bg-white/[0.03]
          `
      }
  }
}

/* =========================================
🔥 Component
========================================= */

export default function SemanticBadge({
  attribute,
}: Props) {

  // --------------------------------
  // Empty
  // --------------------------------
  if (!attribute) {

    logWarn(
      'SemanticBadge attribute missing'
    )

    return null
  }

  // --------------------------------
  // Backend Authority
  // canonical:
  // attr_type
  // --------------------------------
  const type =
    attribute.attr_type
    || attribute.type
    || 'default'

  const role =
    attribute.semantic_role
    || 'supportive'

  const weight =
    normalizeWeight(
      attribute.semantic_weight
    )

  // --------------------------------
  // Registry
  // --------------------------------
  const config =
    semanticRenderRegistry[type]
    || semanticRenderRegistry.default

  // --------------------------------
  // Variants
  // --------------------------------
  const weightVariant =
    getWeightVariant(weight)

  const roleVariant =
    getRoleVariant(role)

  return (
    <div
      className={clsx(

        // --------------------------------
        // Base
        // --------------------------------
        `
        inline-flex
        items-center
        gap-1.5

        rounded-xl

        border
        border-white/6

        px-3
        py-1.5

        text-xs
        font-bold

        leading-none

        backdrop-blur-sm

        transition-all
        duration-200
        `,

        // --------------------------------
        // Registry
        // --------------------------------
        config?.className,

        // --------------------------------
        // Weight
        // --------------------------------
        weightVariant.scale,
        weightVariant.glow,

        // --------------------------------
        // Role
        // --------------------------------
        roleVariant.ring,
        roleVariant.background
      )}
    >

      {/* =================================
      🔥 Icon
      ================================= */}

      {attribute.icon && (

        <span
          className="
            text-[12px]
            leading-none
            opacity-90
          "
        >
          {attribute.icon}
        </span>

      )}

      {/* =================================
      🔥 Label
      ================================= */}

      <span
        className="
          whitespace-nowrap
        "
      >
        {attribute.name || ''}
      </span>

    </div>
  )
}
