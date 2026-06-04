// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/next-bicstation/app/test/runtime/inspectors/semantic/entity/EntityAdaptiveInspector.tsx
// ============================================================================

'use client'

/**
 * ============================================================================
 * SHIN CORE LINX
 * Entity Adaptive Inspector
 * ============================================================================
 *
 * PURPOSE:
 *
 * Adaptive runtime observability
 *
 * IMPORTANT:
 *
 * This component exists for:
 *
 * adaptive runtime visualization
 *
 * NOT:
 *
 * semantic normalization
 * runtime mutation
 * cinematic generation
 *
 * ============================================================================
 */

/* ============================================================================
🔥 Shared
============================================================================ */

import InspectorSection
from '../shared/InspectorSection'

import InspectorCard
from '../shared/InspectorCard'

import RuntimeBadge
from '../shared/RuntimeBadge'

import RawJsonInspector
from '../shared/RawJsonInspector'

/* ============================================================================
🔥 Props
============================================================================ */

type EntityAdaptiveInspectorProps = {

  adaptive_runtime?: any
}

/* ============================================================================
🔥 Entity Adaptive Inspector
============================================================================ */

export default function EntityAdaptiveInspector({

  adaptive_runtime,

}: EntityAdaptiveInspectorProps) {

  /* ==========================================================================
  🔥 Adaptive Runtime
  ========================================================================== */

  const adaptiveRuntime =

    adaptive_runtime || {}

  /* ==========================================================================
  🔥 Adaptive Metadata
  ========================================================================== */

  const adaptiveTitle =

    adaptiveRuntime?.adaptive_title
    || adaptiveRuntime?.title
    || '-'

  const adaptiveRole =

    adaptiveRuntime?.adaptive_role
    || adaptiveRuntime?.role
    || '-'

  const adaptiveSummary =

    adaptiveRuntime?.adaptive_summary
    || adaptiveRuntime?.summary
    || '-'

  const cinematicMode =

    adaptiveRuntime?.cinematic_mode
    || '-'

  const renderMode =

    adaptiveRuntime?.render_mode
    || '-'

  const runtimeTheme =

    adaptiveRuntime?.runtime_theme
    || '-'

  /* ==========================================================================
  🔥 Render Hints
  ========================================================================== */

  const renderHints =

    adaptiveRuntime?.render_hints
    || {}

  /* ==========================================================================
  🔥 Runtime Debug
  ========================================================================== */

  console.log(

    '🎬 ENTITY ADAPTIVE INSPECTOR',

    {

      adaptiveTitle,

      adaptiveRole,

      cinematicMode,

      renderMode,

      runtimeTheme,

      hasRenderHints:

        Object.keys(
          renderHints
        ).length > 0,
    }
  )

  /* ==========================================================================
  🔥 Empty Guard
  ========================================================================== */

  const hasAdaptiveRuntime =

    Object.keys(
      adaptiveRuntime
    ).length > 0

  /* ==========================================================================
  🔥 Render
  ========================================================================== */

  return (

    <InspectorSection

      title="🎬 Adaptive Runtime Inspector"

      description="Adaptive runtime observability and cinematic rendering runtime visualization."

      badge="runtime/adaptive"

    >

      {/* ================================================================
      🔥 Runtime Status
      ================================================================ */}

      <div className="flex flex-wrap gap-3">

        <RuntimeBadge

          label="adaptive"

          value={
            hasAdaptiveRuntime
              ? 'active'
              : 'inactive'
          }

          variant={
            hasAdaptiveRuntime
              ? 'success'
              : 'warning'
          }

        />

        <RuntimeBadge

          label="cinematic"

          value={cinematicMode}

          variant="semantic"

        />

        <RuntimeBadge

          label="render"

          value={renderMode}

          variant="topology"

        />

      </div>

      {/* ================================================================
      🔥 Adaptive Runtime Grid
      ================================================================ */}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">

        <InspectorCard

          title="Adaptive Title"

          value={adaptiveTitle}

        />

        <InspectorCard

          title="Adaptive Role"

          value={adaptiveRole}

        />

        <InspectorCard

          title="Runtime Theme"

          value={runtimeTheme}

        />

      </div>

      {/* ================================================================
      🔥 Adaptive Summary
      ================================================================ */}

      <InspectorCard

        title="Adaptive Summary"

        value={adaptiveSummary}

        description="Adaptive runtime cinematic summary and rendering narrative."

      />

      {/* ================================================================
      🔥 Render Hints
      ================================================================ */}

      <InspectorCard

        title="Render Hints"

        value={renderHints}

        mono

        badge="runtime/render-hints"

        description="Runtime rendering hints and cinematic runtime orchestration metadata."

      />

      {/* ================================================================
      🔥 Raw Adaptive Runtime
      ================================================================ */}

      <RawJsonInspector

        title="Raw Adaptive Runtime"

        description="Raw adaptive runtime authority payload observability."

        badge="runtime/adaptive-raw"

        payload={adaptiveRuntime}

      />

    </InspectorSection>
  )
}