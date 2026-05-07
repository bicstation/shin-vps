'use client'

import SemanticBadge
  from './SemanticBadge'

import {
  SemanticAttribute,
} from '@/shared/types/semantic'

/* =========================================
🔥 Config
========================================= */

const IS_DEV =
  process.env.NODE_ENV ===
  'development'

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
🔥 Normalize Attribute
========================================= */

function normalizeAttribute(
  attribute?: SemanticAttribute | null
): SemanticAttribute | null {

  if (!attribute) {
    return null
  }

  return {

    // --------------------------------
    // base
    // --------------------------------
    ...attribute,

    // --------------------------------
    // backend canonical:
    // attr_type
    // --------------------------------
    type:
      attribute.attr_type
      || attribute.type
      || 'default',

    // --------------------------------
    // safe strings
    // --------------------------------
    name:
      attribute.name || '',

    slug:
      attribute.slug || '',

    // --------------------------------
    // role
    // --------------------------------
    semantic_role:
      attribute.semantic_role
      || 'supportive',

    // --------------------------------
    // weight
    // backend:
    // 0.0 ~ 1.0
    // --------------------------------
    semantic_weight:
      typeof attribute.semantic_weight
        === 'number'
          ? Math.max(
              0,
              Math.min(
                1,
                attribute.semantic_weight
              )
            )
          : 0,
  }
}

/* =========================================
🔥 Component
========================================= */

export default function SemanticRenderer({
  attribute,
}: Props) {

  // --------------------------------
  // Empty
  // --------------------------------
  if (!attribute) {

    logWarn(
      'SemanticRenderer attribute missing'
    )

    return null
  }

  // --------------------------------
  // Normalize
  // --------------------------------
  const normalized =
    normalizeAttribute(
      attribute
    )

  if (!normalized) {

    logWarn(
      'SemanticRenderer normalize failed',
      attribute
    )

    return null
  }

  // --------------------------------
  // type authority
  // --------------------------------
  const type =
    normalized.type

  // --------------------------------
  // semantic rendering authority
  // future:
  // - adaptive rendering
  // - graph rendering
  // - AI semantic rendering
  // --------------------------------
  switch (type) {

    // =================================
    // GPU
    // =================================
    case 'gpu':

      return (
        <SemanticBadge
          attribute={normalized}
        />
      )

    // =================================
    // Usage
    // =================================
    case 'usage':

      return (
        <SemanticBadge
          attribute={normalized}
        />
      )

    // =================================
    // CPU
    // =================================
    case 'cpu':

      return (
        <SemanticBadge
          attribute={normalized}
        />
      )

    // =================================
    // Maker
    // =================================
    case 'maker':

      return (
        <SemanticBadge
          attribute={normalized}
        />
      )

    // =================================
    // Memory
    // =================================
    case 'memory':

      return (
        <SemanticBadge
          attribute={normalized}
        />
      )

    // =================================
    // Storage
    // =================================
    case 'storage':

      return (
        <SemanticBadge
          attribute={normalized}
        />
      )

    // =================================
    // Feature
    // =================================
    case 'feature':

      return (
        <SemanticBadge
          attribute={normalized}
        />
      )

    // =================================
    // Default
    // =================================
    default:

      return (
        <SemanticBadge
          attribute={normalized}
        />
      )
  }
}