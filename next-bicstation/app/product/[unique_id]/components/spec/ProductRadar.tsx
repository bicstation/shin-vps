// ============================================================================
// FILE:
// next-bicstation/app/product/[unique_id]/components/spec/ProductRadar.tsx
// ============================================================================
//
// SHIN CORE LINX
// Product Observation Experience
//
// Backend Reality
//      ↓
// observation_runtime
//      ↓
// Adapter / Projection
//      ↓
// ProductRadar
//      ↓
// Observation State
//      ↓
// Observation Renderer Registry
//      ↓
// Manufacturer Observation UI
//
// PURPOSE
//
// ProductRadar is the Observation UI entry point.
//
// ProductRadar does NOT:
//
// ✗ parse Observation Reality
// ✗ generate semantic meaning
// ✗ classify specifications
// ✗ generate scores
// ✗ modify Backend Reality
//
// It only:
//
// ✓ resolves Observation state
// ✓ displays common Observation state when necessary
// ✓ resolves the appropriate Observation Renderer
//
// ============================================================================

/* ============================================================================
// Observation State
============================================================================ */

import ObservationState, {
  resolveObservationState,
} from './observation/ObservationState'

/* ============================================================================
// Renderer Registry
============================================================================ */

import {
  resolveObservationRenderer,
} from './observation/registry'

/* ============================================================================
// Props
============================================================================ */

type Props = {

  product: any

}

/* ============================================================================
// Component
============================================================================ */

export default function ProductRadar({

  product,

}: Props) {

  /* ==========================================================================
  Guard
  ========================================================================== */

  if (
    !product
  ) {

    return null

  }

  /* ==========================================================================
  Observation State
  ========================================================================== */

  const observationState =
    resolveObservationState(
      product
    )

  /* ==========================================================================
  Debug
  ========================================================================== */

  console.log(
    '🔥 PRODUCT OBSERVATION STATE',
    {

      unique_id:
        product?.uniqueId
        ||
        product?.unique_id,

      product_name:
        product?.name,

      maker:
        product?.maker
        ||
        product?.makerName
        ||
        product?.maker_name,

      observationState,

    },
  )

  /* ==========================================================================
  Unavailable / Empty
  ========================================================================== */

  if (
    observationState !== 'available'
  ) {

    return (

      <ObservationState
        product={
          product
        }
      />

    )

  }

  /* ==========================================================================
  Renderer
  ========================================================================== */

  const ObservationRenderer =
    resolveObservationRenderer(
      product
    )

  /* ==========================================================================
  Renderer Debug
  ========================================================================== */

  console.log(
    '🔥 PRODUCT OBSERVATION RENDERER',
    {

      unique_id:
        product?.uniqueId
        ||
        product?.unique_id,

      product_name:
        product?.name,

      maker:
        product?.maker
        ||
        product?.makerName
        ||
        product?.maker_name,

      renderer:
        ObservationRenderer?.name,

    },
  )

  /* ==========================================================================
  Render
  ========================================================================== */

  return (

    <ObservationRenderer
      product={
        product
      }
    />

  )

}