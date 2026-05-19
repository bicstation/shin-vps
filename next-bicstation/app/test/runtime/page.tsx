// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/next-bicstation/app/test/runtime/page.tsx
// ============================================================================

/* ============================================================================
🔥 Props
============================================================================ */

type Props = {

searchParams: {


mode?: string

unique_id?: string


}
}

/* ============================================================================
🔥 Runtime Laboratory
============================================================================ */

export default async function RuntimePage({
searchParams,
}: Props) {

// ==========================================================================
// Params
// ==========================================================================

const mode =


searchParams?.mode
|| 'menu'


const uniqueId =


searchParams?.unique_id
|| '35909_1000025-md'


// ==========================================================================
// API Base
// ==========================================================================

const API_BASE =


'http://django-v3:8000/api/general'


// ==========================================================================
// Endpoints
// ==========================================================================

const detailEndpoint =


`${API_BASE}/pc-products/${uniqueId}/`


const relatedEndpoint =


`${API_BASE}/pc-products/${uniqueId}/related/`


const rankingEndpoint =


`${API_BASE}/pc-products/ranking/`


const sidebarEndpoint =


`${API_BASE}/pc-sidebar-stats/`


// ==========================================================================
// Runtime Data
// ==========================================================================

let runtimeData: any = null

let currentEndpoint = ''

// ==========================================================================
// Resolve Endpoint
// ==========================================================================

if (mode === 'detail') {


currentEndpoint =
  detailEndpoint


}

if (mode === 'related') {


currentEndpoint =
  relatedEndpoint


}

if (mode === 'ranking') {


currentEndpoint =
  rankingEndpoint


}

if (mode === 'sidebar') {


currentEndpoint =
  sidebarEndpoint


}

// ==========================================================================
// Fetch Raw Response
// ==========================================================================

if (
mode !== 'menu'
&& currentEndpoint
) {


try {

  console.log(
    '🔥 FETCH ENDPOINT:',
    currentEndpoint
  )

  const response =

    await fetch(
      currentEndpoint,
      {
        cache: 'no-store',
      }
    )

  console.log(
    '🔥 RESPONSE STATUS:',
    response.status
  )

  console.log(
    '🔥 RESPONSE OK:',
    response.ok
  )

  // ================================================================
  // RAW TEXT
  // ================================================================

  const rawText =

    await response.text()

  console.log(
    '🔥 RAW RESPONSE TEXT:',
    rawText
  )

  // ================================================================
  // Try JSON Parse
  // ================================================================

  try {

    runtimeData =

      JSON.parse(
        rawText
      )

  } catch {

    runtimeData = {

      error:
        'JSON PARSE FAILED',

      rawText,
    }

  }

} catch (error: any) {

  runtimeData = {

    error:
      'FETCH FAILED',

    message:
      error?.message || 'Unknown Error',
  }
}


}

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
    Runtime Laboratory

  </h1>

  <p
    style={{
      color: '#94a3b8',
      marginBottom: '40px',
    }}
  >

    backend semantic runtime inspector

  </p>

  {/* ================================================================
  CURRENT
  ================================================================ */}

  <div
    style={{
      marginBottom: '40px',
      padding: '20px',
      borderRadius: '20px',
      background: '#0f172a',
      border:
        '1px solid rgba(255,255,255,.08)',
    }}
  >

    <div
      style={{
        marginBottom: '12px',
        color: '#7dd3fc',
      }}
    >

      CURRENT MODE

    </div>

    <div
      style={{
        marginBottom: '24px',
        fontSize: '20px',
        fontWeight: 700,
      }}
    >

      {mode}

    </div>

    <div
      style={{
        marginBottom: '12px',
        color: '#7dd3fc',
      }}
    >

      CURRENT UNIQUE ID

    </div>

    <div>

      {uniqueId}

    </div>

  </div>

  {/* ================================================================
  MENU
  ================================================================ */}

  <section
    style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      marginBottom: '60px',
    }}
  >

    <a
      href={`?mode=detail&unique_id=${uniqueId}`}
      style={{
        color: '#7dd3fc',
      }}
    >

      DETAIL RUNTIME

    </a>

    <a
      href={`?mode=related&unique_id=${uniqueId}`}
      style={{
        color: '#86efac',
      }}
    >

      RELATED RUNTIME

    </a>

    <a
      href={`?mode=ranking`}
      style={{
        color: '#facc15',
      }}
    >

      RANKING RUNTIME

    </a>

    <a
      href={`?mode=sidebar`}
      style={{
        color: '#f472b6',
      }}
    >

      SIDEBAR RUNTIME

    </a>

  </section>

  {/* ================================================================
  ENDPOINT
  ================================================================ */}

  {
    mode !== 'menu' && (

      <div
        style={{
          marginBottom: '24px',
          padding: '20px',
          borderRadius: '20px',
          background: '#0f172a',
          border:
            '1px solid rgba(255,255,255,.08)',
        }}
      >

        <div
          style={{
            marginBottom: '12px',
            color: '#7dd3fc',
          }}
        >

          CURRENT ENDPOINT

        </div>

        <div
          style={{
            wordBreak: 'break-all',
          }}
        >

          {currentEndpoint}

        </div>

      </div>

    )
  }

  {/* ================================================================
  RAW PAYLOAD
  ================================================================ */}

  {
    mode !== 'menu' && (

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
            runtimeData,
            null,
            2
          )
        }

      </pre>

    )
  }

</main>


)
}
