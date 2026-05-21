//  /home/maya/shin-vps/next-bicstation/app/test/runtime/page.tsx

// ============================================================================
// FILE:
// /home/maya/shin-vps/next-bicstation/app/test/runtime/page.tsx
// ============================================================================

'use client'

/* ============================================================================
🔥 React
============================================================================ */

import {
  useEffect,
  useState,
} from 'react'

/* ============================================================================
🔥 Runtime
============================================================================ */

import {
  runtimeModes,
} from './runtime/runtimeModes'

/* ============================================================================
🔥 Orchestration
============================================================================ */

import { 
  fetchRuntimeScene,
} from './orchestration/fetchRuntimeScene'

/* ============================================================================
🔥 Shell
============================================================================ */

import RuntimeHeader
from './shell/RuntimeHeader'

/* ============================================================================
🔥 Observatory
============================================================================ */

import RuntimeLayout
from './observatory/RuntimeLayout'

import RuntimeScene
from './observatory/RuntimeScene'

import RuntimeViewport
from './observatory/RuntimeViewport'

/* ============================================================================
🔥 Components
============================================================================ */

import RuntimeInspector
from './components/RuntimeInspector'

/* ============================================================================
🔥 Payload
============================================================================ */

import RuntimePayloadViewer
from './payload/RuntimePayloadViewer'

/* ============================================================================
🔥 Runtime Laboratory
============================================================================ */

export default function RuntimeLaboratoryPage() {

  // ==========================================================================
  // Mode
  // ==========================================================================

  const [mode, setMode] =

    useState('detail')

  // ==========================================================================
  // Runtime
  // ==========================================================================

  const [runtime, setRuntime] =

    useState<any>(null)

  // ==========================================================================
  // Loading
  // ==========================================================================

  const [loading, setLoading] =

    useState(false)

  // ==========================================================================
  // Runtime Scene
  // ==========================================================================

  useEffect(() => {

    let mounted = true

    async function loadRuntimeScene() {

      try {

        setLoading(true)

        // ================================================================
        // Runtime Scene
        // ================================================================

        const runtimeScene =

          await fetchRuntimeScene({

            mode,

            options: {

              uniqueId:
                '35909_1000025-md',
            },
          })

        // ================================================================
        // Runtime Debug
        // ================================================================

        console.log(

          '🌌 PAGE RUNTIME SCENE',

          {

            mode,

            runtimeRole:
              runtimeScene?.runtime_role,

            topologyLayer:
              runtimeScene?.topology_layer,

            traversalEdges:

              Array.isArray(
                runtimeScene?.traversal_edges
              )

                ? runtimeScene.traversal_edges.length

                : 0,

            traversalGraph:

              Array.isArray(
                runtimeScene?.traversal_graph
              )

                ? runtimeScene.traversal_graph.length

                : 0,
          }
        )

        // ================================================================
        // Set Runtime
        // ================================================================

        if (mounted) {

          setRuntime(
            runtimeScene
          )
        }

      } catch (error) {

        console.error(

          '🔥 RUNTIME SCENE FAILURE',

          error
        )

      } finally {

        if (mounted) {

          setLoading(false)
        }
      }
    }

    loadRuntimeScene()

    return () => {

      mounted = false
    }

  }, [mode])

  // ==========================================================================
  // Render
  // ==========================================================================

  return (

    <div className="min-h-screen bg-black text-zinc-100">

      {/* =============================================================== */}
      {/* Header */}
      {/* =============================================================== */}

  
      <RuntimeHeader

        mode={mode}

      />

      {/* =============================================================== */}
      {/* Runtime Tabs */}
      {/* =============================================================== */}

      <section className="border-b border-zinc-900 bg-black/60">

        <div className="mx-auto max-w-[1800px] overflow-x-auto px-6 py-5">

          <div className="flex min-w-max gap-4">

            {

              runtimeModes.map(
                (item) => {

                  const active =
                    item.id === mode

                  return (

                    <button

                      key={item.id}

                      onClick={
                        () => setMode(item.id)
                      }

                      className={`
                        rounded-2xl border px-6 py-4 transition-all

                        ${

                          active

                            ? 'border-sky-500 bg-sky-950/40'

                            : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700'
                        }
                      `}
                    >

                      <div className="flex items-center gap-4">

                        <div className="text-3xl">

                          {item.icon}

                        </div>

                        <div className="text-left">

                          <div className="font-bold text-white">

                            {item.short_title}

                          </div>

                          <div className="mt-1 text-xs text-zinc-500">

                            {item.runtime_role}

                          </div>

                        </div>

                      </div>

                    </button>
                  )
                }
              )
            }

          </div>

        </div>

      </section>

      {/* =============================================================== */}
      {/* Observatory */}
      {/* =============================================================== */}

      <RuntimeLayout>

        <RuntimeScene

          title={
            runtime?.scene_title
            || 'Runtime Observatory'
          }

          subtitle={
            runtime?.scene_subtitle
            || 'semantic runtime observability'
          }
        >

          <RuntimeViewport>

            {

              loading

                ? (

                  <div className="p-10 text-sm opacity-60">

                    Loading runtime scene...

                  </div>
                )

                : (

                  <>

                    {/* =========================================== */}
                    {/* Runtime Inspector */}
                    {/* =========================================== */}

                    <RuntimeInspector

                      mode={mode}

                      runtime={runtime}

                    />

                    {/* =========================================== */}
                    {/* Runtime Payload */}
                    {/* =========================================== */}

                    <RuntimePayloadViewer

                      payload={runtime}

                    />

                  </>
                )
            }

          </RuntimeViewport>

        </RuntimeScene>

      </RuntimeLayout>

    </div>
  )
}

