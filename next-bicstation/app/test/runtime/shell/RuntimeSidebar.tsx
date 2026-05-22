// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/next-bicstation/app/test/runtime/shell/RuntimeSidebar.tsx
// ============================================================================

'use client'

/* ============================================================================
🔥 Types
============================================================================ */

type RuntimeSidebarProps = {

  runtime?: any
}

/* ============================================================================
🔥 Runtime Sidebar
============================================================================ */

/**
 * Runtime infrastructure navigation shell.
 *
 * Responsibilities:
 *
 * - runtime layer navigation
 * - semantic runtime topology visibility
 * - runtime health observability
 * - traversal runtime cockpit support
 */
export default function RuntimeSidebar({

  runtime,

}: RuntimeSidebarProps) {

  // ==========================================================================
  // Runtime Identity
  // ==========================================================================

  const runtimeRole =

    runtime?.runtime_role
    || 'unknown-runtime'

  const topologyLayer =

    runtime?.topology_layer
    || 'unknown-layer'

  // ==========================================================================
  // Runtime Layers
  // ==========================================================================

  const runtimeLayers = [

    {
      label: 'Transport',
      active: true,
    },

    {
      label: 'Normalize',
      active: true,
    },

    {
      label: 'Orchestration',
      active: true,
    },

    {
      label: 'Routing',
      active: true,
    },

    {
      label: 'Traversal',

      active:

        topologyLayer ===
        'traversal',
    },

    {
      label: 'Graph',

      active:

        Array.isArray(
          runtime?.traversal_graph
        )
    },

    {
      label: 'Continuation',

      active:

        runtimeRole ===
        'continuation-runtime',
    },

    {
      label: 'Payload',
      active: true,
    },
  ]

  // ==========================================================================
  // Runtime Debug
  // ==========================================================================

  console.log(

    '🛰️ RUNTIME SIDEBAR',

    {

      runtimeRole,

      topologyLayer,

      runtimeLayers,
    }
  )

  // ==========================================================================
  // Render
  // ==========================================================================

  return (

    <aside
      className="
        space-y-4
        rounded-3xl
        border
        border-zinc-900
        bg-zinc-950/40
        p-6
      "
    >

      {/* ==============================================================
      Header
      ============================================================== */}

      <div>

        <div
          className="
            text-xs
            uppercase
            tracking-[0.3em]
            text-zinc-500
          "
        >

          Runtime Layers

        </div>

      </div>

      {/* ==============================================================
      Layers
      ============================================================== */}

      <div
        className="
          space-y-2
        "
      >

        {
          runtimeLayers.map(
            (
              layer,
              index,
            ) => (

              <div
                key={index}

                className="
                  flex
                  items-center
                  justify-between
                  rounded-2xl
                  border
                  border-zinc-900
                  bg-zinc-950/60
                  px-4
                  py-3
                "
              >

                <div
                  className="
                    text-sm
                    text-zinc-300
                  "
                >

                  {layer.label}

                </div>

                <div
                  className={

                    layer.active

                      ? `
                        rounded-full
                        bg-emerald-500/20
                        px-2
                        py-1
                        text-[10px]
                        font-medium
                        uppercase
                        tracking-widest
                        text-emerald-300
                      `

                      : `
                        rounded-full
                        bg-zinc-900
                        px-2
                        py-1
                        text-[10px]
                        font-medium
                        uppercase
                        tracking-widest
                        text-zinc-600
                      `
                  }
                >

                  {
                    layer.active
                      ? 'ACTIVE'
                      : 'IDLE'
                  }

                </div>

              </div>
            )
          )
        }

      </div>

    </aside>
  )
}