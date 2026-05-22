// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/next-bicstation/app/test/runtime/shell/RuntimeTerminal.tsx
// ============================================================================

'use client'

/* ============================================================================
🔥 Types
============================================================================ */

type RuntimeTerminalProps = {

  runtime?: any
}

/* ============================================================================
🔥 Runtime Terminal
============================================================================ */

/**
 * Runtime observatory terminal.
 *
 * Responsibilities:
 *
 * - runtime log visualization
 * - semantic runtime stream visibility
 * - traversal runtime observability
 * - live runtime cockpit support
 */
export default function RuntimeTerminal({

  runtime,

}: RuntimeTerminalProps) {

  // ==========================================================================
  // Runtime Identity
  // ==========================================================================

  const runtimeRole =

    runtime?.runtime_role
    || 'unknown-runtime'

  const topologyLayer =

    runtime?.topology_layer
    || 'unknown-layer'

  const observatory =

    runtime?.observatory
    || 'unknown-observatory'

  // ==========================================================================
  // Runtime Entries
  // ==========================================================================

  const runtimeEntries = [

    `runtime_role: ${runtimeRole}`,

    `topology_layer: ${topologyLayer}`,

    `observatory: ${observatory}`,

    `traversal_edges: ${
      Array.isArray(
        runtime?.traversal_edges
      )

        ? runtime.traversal_edges.length

        : 0
    }`,

    `traversal_graph: ${
      Array.isArray(
        runtime?.traversal_graph
      )

        ? runtime.traversal_graph.length

        : 0
    }`,
  ]

  // ==========================================================================
  // Runtime Debug
  // ==========================================================================

  console.log(

    '🖥️ RUNTIME TERMINAL',

    {

      runtimeRole,

      topologyLayer,

      observatory,

      runtimeEntries,
    }
  )

  // ==========================================================================
  // Render
  // ==========================================================================

  return (

    <section
      className="
        overflow-hidden
        rounded-3xl
        border
        border-zinc-900
        bg-black
      "
    >

      {/* ==============================================================
      Terminal Header
      ============================================================== */}

      <div
        className="
          flex
          items-center
          justify-between
          border-b
          border-zinc-900
          bg-zinc-950
          px-5
          py-3
        "
      >

        <div
          className="
            text-xs
            uppercase
            tracking-[0.3em]
            text-zinc-500
          "
        >

          Runtime Terminal

        </div>

        <div
          className="
            text-[10px]
            uppercase
            tracking-widest
            text-emerald-400
          "
        >

          LIVE

        </div>

      </div>

      {/* ==============================================================
      Terminal Body
      ============================================================== */}

      <div
        className="
          space-y-2
          p-5
          font-mono
          text-xs
        "
      >

        {
          runtimeEntries.map(
            (
              entry,
              index,
            ) => (

              <div
                key={index}

                className="
                  flex
                  items-start
                  gap-3
                  text-emerald-400
                "
              >

                <span
                  className="
                    text-zinc-600
                  "
                >

                  $

                </span>

                <span>

                  {entry}

                </span>

              </div>
            )
          )
        }

      </div>

    </section>
  )
}