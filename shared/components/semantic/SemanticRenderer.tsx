// /home/maya/shin-dev/shin-vps/shared/components/semantic/SemanticRenderer.tsx

'use client'

import SemanticBadge
  from './SemanticBadge'

import {

  semanticRenderRegistry,

} from '@/shared/lib/semantic'

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

  attribute?:
    SemanticAttribute
    | null
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
  attribute?:
    SemanticAttribute
    | null
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
    // visual safety
    // --------------------------------
    icon:
      attribute.icon || '',

    color:
      attribute.color || '',
  }
}

/* =========================================
🔥 Component
========================================= */

export default function
SemanticRenderer({

  attribute,

}: Props) {

  // ======================================
  // Empty
  // ======================================

  if (!attribute) {

    logWarn(
      'SemanticRenderer attribute missing'
    )

    return null
  }

  // ======================================
  // Normalize
  // ======================================

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

  // ======================================
  // Type
  // ======================================

  const type =
    normalized.type

  // ======================================
  // Render Config
  // ======================================

  const renderConfig =

    semanticRenderRegistry[
      type
    ]

    || semanticRenderRegistry
      .default

  // ======================================
  // Future Semantic Rendering
  // ======================================
  // future:
  // - adaptive renderer
  // - graph renderer
  // - AI semantic renderer
  // - grouped semantic renderer
  // ======================================

  switch (
    renderConfig.variant
  ) {

    // ====================================
    // Badge Renderer
    // ====================================

    case 'badge':

      return (

        <SemanticBadge
          attribute={
            normalized
          }
        />

      )

    // ====================================
    // Default
    // ====================================

    default:

      return (

        <SemanticBadge
          attribute={
            normalized
          }
        />

      )
  }
}