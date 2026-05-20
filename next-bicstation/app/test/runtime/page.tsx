// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/next-bicstation/app/test/runtime/page.tsx
// ============================================================================

'use client'

/**
 * SHIN CORE LINX
 * Runtime Observatory
 *
 * CINEMATIC RUNTIME LAYOUT
 *
 * IMPORTANT:
 *
 * This page represents:
 *
 * immersive runtime observatory
 *
 * NOT:
 *
 * admin dashboard layout
 *
 * Responsibilities:
 * - runtime scene composition
 * - cinematic observability
 * - runtime orchestration
 * - semantic exploration rendering
 *
 * IMPORTANT:
 *
 * This page MUST NOT:
 *
 * ❌ hardcode endpoints
 * ❌ directly fetch runtime
 * ❌ mutate semantic meaning
 * ❌ behave like admin tooling
 */

/* ============================================================================
🔥 Imports
============================================================================ */

import {

  useEffect,

  useMemo,

  useState,

} from 'react'

/* ============================================================================
🔥 Runtime
============================================================================ */

import {

  fetchRuntime,

} from './runtime/fetchRuntime'

import {

  normalizeRuntimePayload,

} from './runtime/normalizeRuntimePayload'

import {

  runtimeModes,

  resolveRuntimeMode,

  type RuntimeMode,

} from './runtime/runtimeModes'

/* ============================================================================
🔥 Observatory
============================================================================ */

import RuntimeInspectorStack
from './inspectors/orchestration/RuntimeInspectorStack'

import RuntimePayloadViewer
from './payload/RuntimePayloadViewer'

/* ============================================================================
🔥 Runtime Observatory
============================================================================ */

export default function RuntimeObservatoryPage() {

  /* ==========================================================================
  🔥 Runtime Mode
  ========================================================================== */

  const [

    mode,

    setMode,

  ] = useState<RuntimeMode>(
    'detail'
  )

  /* ==========================================================================
  🔥 Runtime State
  ========================================================================== */

  const [

    loading,

    setLoading,

  ] = useState(false)

  const [

    runtime,

    setRuntime,

  ] = useState<any>(null)

  const [

    error,

    setError,

  ] = useState<string | null>(
    null
  )

  /* ==========================================================================
  🔥 Runtime Metadata
  ========================================================================== */

  const runtimeMode =

    useMemo(

      () =>

        resolveRuntimeMode(
          mode
        ),

      [mode]
    )

  /* ==========================================================================
  🔥 Runtime Pipeline
  ========================================================================== */

  useEffect(() => {

    let mounted = true

    async function run() {

      try {

        setLoading(true)

        setError(null)

        /* ================================================================
        🔥 Runtime Transport
        ================================================================ */

        const transport =

          await fetchRuntime(
            mode
          )

        /* ================================================================
        🔥 Runtime Preservation
        ================================================================ */

        const normalized =

          normalizeRuntimePayload(
            transport
          )

        /* ================================================================
        🔥 Runtime State
        ================================================================ */

        if (!mounted) {

          return
        }

        setRuntime(
          normalized
        )

      } catch (err: any) {

        console.error(

          '🔥 RUNTIME OBSERVATORY ERROR',

          err
        )

        if (!mounted) {

          return
        }

        setError(

          err?.message
          || 'Runtime Observatory Error'
        )

      } finally {

        if (mounted) {

          setLoading(false)
        }
      }
    }

    run()

    return () => {

      mounted = false
    }

  }, [mode])

  /* ==========================================================================
  🔥 Loading State
  ========================================================================== */

  if (loading) {

    return (

      <main className="min-h-screen bg-black text-white">

        <div className="flex min-h-screen items-center justify-center">

          <div className="space-y-5 text-center">

            <div className="text-6xl">

              🌌

            </div>

            <div className="text-2xl font-black">

              Runtime Observatory

            </div>

            <div className="text-sm tracking-wide text-zinc-500">

              semantic runtime pipeline active

            </div>

          </div>

        </div>

      </main>
    )
  }

  /* ==========================================================================
  🔥 Error State
  ========================================================================== */

  if (error) {

    return (

      <main className="min-h-screen bg-black p-10 text-white">

        <div className="mx-auto max-w-4xl rounded-[32px] border border-red-900 bg-red-950/20 p-10">

          <div className="text-xs uppercase tracking-[0.24em] text-red-400">

            Runtime Observatory Error

          </div>

          <h1 className="mt-5 text-4xl font-black">

            Runtime Pipeline Failure

          </h1>

          <p className="mt-6 text-sm leading-relaxed text-red-200">

            {error}

          </p>

        </div>

      </main>
    )
  }

  /* ==========================================================================
  🔥 Runtime Observatory
  ========================================================================== */

  return (

    <main className="min-h-screen bg-black text-white">

      {/* ================================================================
      🔥 Header
      ================================================================ */}

      <header className="border-b border-zinc-800 bg-zinc-950/70 backdrop-blur">

        <div className="mx-auto max-w-[1800px] px-6 py-8">

          <div className="flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">

            {/* ==========================================================
            🔥 Observatory Title
            ========================================================== */}

            <div>

              <div className="text-xs uppercase tracking-[0.26em] text-sky-400">

                SHIN CORE LINX

              </div>

              <h1 className="mt-4 text-5xl font-black leading-none">

                Runtime Observatory

              </h1>

              <p className="mt-6 max-w-4xl text-sm leading-relaxed text-zinc-400">

                semantic runtime observability ・
                continuation topology ・
                cinematic traversal ・
                exploration runtime rendering

              </p>

            </div>

            {/* ==========================================================
            🔥 Runtime Status
            ========================================================== */}

            <div className="rounded-3xl border border-zinc-800 bg-black px-6 py-5">

              <div className="text-xs uppercase tracking-wide text-zinc-500">

                Runtime Pipeline

              </div>

              <div className="mt-4 text-sm leading-loose text-zinc-300">

{`runtime mode
  ↓
runtime endpoint
  ↓
runtime transport
  ↓
semantic preservation
  ↓
runtime observability`}
              </div>

            </div>

          </div>

        </div>

      </header>

      {/* ================================================================
      🔥 Runtime Mode Rail
      ================================================================ */}

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

      {/* ================================================================
      🔥 Runtime Scene
      ================================================================ */}

      <section className="mx-auto max-w-[1800px] px-6 py-10">

        {/* ============================================================
        🔥 Runtime Hero Scene
        ============================================================ */}

        <div className="relative overflow-hidden rounded-[36px] border border-zinc-800 bg-zinc-950 p-10">

          {/* ==========================================================
          🔥 Background Glow
          ========================================================== */}

          <div className="absolute inset-0 opacity-20">

            <div className="absolute left-0 top-0 h-[400px] w-[400px] rounded-full bg-sky-500 blur-[120px]" />

            <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-fuchsia-500 blur-[140px]" />

          </div>

          {/* ==========================================================
          🔥 Scene Content
          ========================================================== */}

          <div className="relative z-10">

            <div className="flex flex-col gap-8 xl:flex-row xl:items-center xl:justify-between">

              {/* ======================================================
              🔥 Runtime Identity
              ====================================================== */}

              <div className="flex items-start gap-6">

                <div className="text-7xl">

                  {runtimeMode.icon}

                </div>

                <div>

                  <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">

                    Active Runtime Scene

                  </div>

                  <h2 className="mt-4 text-5xl font-black leading-none">

                    {runtimeMode.title}

                  </h2>

                  <p className="mt-6 max-w-4xl text-sm leading-relaxed text-zinc-300">

                    {runtimeMode.description}

                  </p>

                </div>

              </div>

              {/* ======================================================
              🔥 Runtime Meta
              ====================================================== */}

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                <div className="rounded-2xl border border-zinc-800 bg-black/70 p-5">

                  <div className="text-xs uppercase tracking-wide text-zinc-500">

                    Runtime Role

                  </div>

                  <div className="mt-3 text-sm font-bold text-zinc-100">

                    {

                      runtime
                        ?.runtime_role
                        || 'unknown-runtime'
                    }

                  </div>

                </div>

                <div className="rounded-2xl border border-zinc-800 bg-black/70 p-5">

                  <div className="text-xs uppercase tracking-wide text-zinc-500">

                    Observatory

                  </div>

                  <div className="mt-3 text-sm font-bold text-zinc-100">

                    {

                      runtime
                        ?.observatory
                        || 'runtime-observatory'
                    }

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

        {/* ============================================================
        🔥 Inspector Observatory
        ============================================================ */}

        <div className="mt-10">

          <RuntimeInspectorStack

            runtime={runtime}

          />

        </div>

        {/* ============================================================
        🔥 Payload Observatory
        ============================================================ */}

        <div className="mt-10">

          <RuntimePayloadViewer

            runtime={runtime}

          />

        </div>

      </section>

    </main>
  )
}