// ============================================================================
// FILE:
// /home/maya/shin-vps/next-bicstation/app/test/runtime/page.tsx
// ============================================================================

/* ============================================================================
🔥 API
============================================================================ */

import {

  fetchPCDetail,

} from '@/shared/lib/api/django/pc/detail/detail'

import {

  fetchRelatedPC,

} from '@/shared/lib/api/django/pc/related/related'

/* ============================================================================
🔥 Props
============================================================================ */

type Props = {

  searchParams: {

    debug?: string

    uniqueId?: string

  }
}

/* ============================================================================
🔥 Runtime Test Page
============================================================================ */

export default async function RuntimeTestPage({
  searchParams,
}: Props) {

  // ==========================================================================
  // Debug Mode
  // ==========================================================================

  const debug =

    searchParams?.debug
    || 'full'

  // ==========================================================================
  // Runtime UniqueId
  // ==========================================================================

  const uniqueId =

    searchParams?.uniqueId
    || '2557_ag-monu2725qe'

  // ==========================================================================
  // Fetch Product Runtime
  // ==========================================================================

  const product =

    await fetchPCDetail(
      uniqueId
    )

  // ==========================================================================
  // Fetch Related Runtime
  // ==========================================================================

  const related =

    await fetchRelatedPC(
      uniqueId
    )

  // ==========================================================================
  // Render
  // ==========================================================================

  return (

    <main
      style={{
        padding: '40px',
        background: '#020617',
        color: '#ffffff',
        minHeight: '100vh',
        fontFamily: 'monospace',
      }}
    >

      {/* ================================================================
      HEADER
      ================================================================ */}

      <h1
        style={{
          fontSize: '32px',
          marginBottom: '12px',
        }}
      >

        SHIN CORE LINX
        Runtime Inspector

      </h1>

      <p
        style={{
          color: '#94a3b8',
          marginBottom: '12px',
        }}
      >

        semantic runtime visibility mode

      </p>

      <p
        style={{
          color: '#facc15',
          marginBottom: '40px',
        }}
      >

        current uniqueId:
        {' '}
        {uniqueId}

      </p>

      {/* ================================================================
      DEBUG NAV
      ================================================================ */}

      <div
        style={{
          display: 'flex',
          gap: '16px',
          marginBottom: '32px',
          flexWrap: 'wrap',
        }}
      >

        <a
          href={`?debug=1&uniqueId=${uniqueId}`}
          style={{
            color: '#7dd3fc',
          }}
        >

          debug=1 product

        </a>

        <a
          href={`?debug=2&uniqueId=${uniqueId}`}
          style={{
            color: '#86efac',
          }}
        >

          debug=2 related

        </a>

        <a
          href={`?debug=full&uniqueId=${uniqueId}`}
          style={{
            color: '#facc15',
          }}
        >

          debug=full

        </a>

      </div>

      {/* ================================================================
      PRODUCT RUNTIME
      ================================================================ */}

      {
        (
          debug === '1'
          || debug === 'full'
        ) && (

          <section
            style={{
              marginBottom: '60px',
            }}
          >

            <h2
              style={{
                marginBottom: '20px',
                color: '#7dd3fc',
              }}
            >

              PRODUCT RUNTIME

            </h2>

            <pre
              style={{
                overflowX: 'auto',
                background: '#0f172a',
                padding: '24px',
                borderRadius: '20px',
                border:
                  '1px solid rgba(255,255,255,.08)',
              }}
            >

              {
                JSON.stringify(
                  product,
                  null,
                  2
                )
              }

            </pre>

          </section>

        )
      }

      {/* ================================================================
      RELATED RUNTIME
      ================================================================ */}

      {
        (
          debug === '2'
          || debug === 'full'
        ) && (

          <section>

            <h2
              style={{
                marginBottom: '20px',
                color: '#86efac',
              }}
            >

              RELATED RUNTIME

            </h2>

            <pre
              style={{
                overflowX: 'auto',
                background: '#0f172a',
                padding: '24px',
                borderRadius: '20px',
                border:
                  '1px solid rgba(255,255,255,.08)',
              }}
            >

              {
                JSON.stringify(
                  related,
                  null,
                  2
                )
              }

            </pre>

          </section>

        )
      }

    </main>

  )
}