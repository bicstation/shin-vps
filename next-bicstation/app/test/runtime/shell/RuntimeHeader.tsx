// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/next-bicstation/app/test/runtime/components/RuntimeHeader.tsx
// ============================================================================

'use client'

/* ============================================================================
🔥 Props
============================================================================ */

type Props = {

mode: string

endpoint?: string

schemaVersion?: string | number

hasSemanticRuntime?: boolean

hasAdaptiveRuntime?: boolean

hasSemanticRelated?: boolean
}

/* ============================================================================
🔥 Runtime Labels
============================================================================ */

const MODE_LABELS: Record<
string,
string

> = {

detail:
'Product Runtime',

related:
'Continuation Runtime',

ranking:
'Ranking Runtime',

sidebar:
'Sidebar Runtime',

discovery:
'Discovery Runtime',

finder:
'Finder Runtime',
}

/* ============================================================================
🔥 Runtime Header
============================================================================ */

export default function RuntimeHeader({

mode,

endpoint,

schemaVersion,

hasSemanticRuntime,

hasAdaptiveRuntime,

hasSemanticRelated,

}: Props) {

const runtimeLabel =


MODE_LABELS[mode]
|| 'Runtime'


return (


<section
  style={{

    position:
      'relative',

    overflow:
      'hidden',

    borderRadius:
      '32px',

    border:
      '1px solid rgba(255,255,255,.06)',

    background:
      `
      radial-gradient(
        circle at top right,
        rgba(14,165,233,.14),
        transparent 30%
      ),
      linear-gradient(
        180deg,
        rgba(15,23,42,.95),
        rgba(2,6,23,1)
      )
      `,

    padding:
      '36px',
  }}
>

  {/* ================================================================
  BACKGROUND GLOW
  ================================================================ */}

  <div
    style={{

      position:
        'absolute',

      top:
        '-120px',

      right:
        '-120px',

      width:
        '260px',

      height:
        '260px',

      borderRadius:
        '999px',

      background:
        'rgba(14,165,233,.12)',

      filter:
        'blur(80px)',
    }}
  />

  {/* ================================================================
  CONTENT
  ================================================================ */}

  <div
    style={{

      position:
        'relative',

      zIndex:
        2,

      display:
        'flex',

      flexDirection:
        'column',

      gap:
        '28px',
    }}
  >

    {/* ============================================================
    TOP
    ============================================================ */}

    <div
      style={{

        display:
          'flex',

        justifyContent:
          'space-between',

        alignItems:
          'flex-start',

        gap:
          '24px',

        flexWrap:
          'wrap',
      }}
    >

      {/* ==========================================================
      TITLE
      ========================================================== */}

      <div>

        <div
          style={{

            color:
              '#7dd3fc',

            fontSize:
              '11px',

            fontWeight:
              800,

            letterSpacing:
              '.14em',

            textTransform:
              'uppercase',

            marginBottom:
              '10px',
          }}
        >

          SHIN CORE LINX

        </div>

        <h1
          style={{

            margin:
              '0 0 14px',

            fontSize:
              'clamp(34px,4vw,54px)',

            lineHeight:
              1.05,

            fontWeight:
              900,
          }}
        >

          Runtime Laboratory

        </h1>

        <div
          style={{

            color:
              '#cbd5e1',

            fontSize:
              '16px',

            lineHeight:
              1.9,

            maxWidth:
              '880px',
          }}
        >

          semantic runtime observatory ・
          traversal inspector ・
          continuation debugger ・
          exploration runtime laboratory

        </div>

      </div>

      {/* ==========================================================
      STATUS
      ========================================================== */}

      <div
        style={{

          minWidth:
            '280px',

          display:
            'flex',

          flexDirection:
            'column',

          gap:
            '12px',
        }}
      >

        <StatusPill
          label="Runtime"
          value={runtimeLabel}
        />

        <StatusPill
          label="Schema"
          value={
            String(
              schemaVersion
              || 'unknown'
            )
          }
        />

      </div>

    </div>

    {/* ============================================================
    FLAGS
    ============================================================ */}

    <div
      style={{

        display:
          'flex',

        flexWrap:
          'wrap',

        gap:
          '14px',
      }}
    >

      <RuntimeFlag
        label="Semantic Runtime"
        active={
          !!hasSemanticRuntime
        }
      />

      <RuntimeFlag
        label="Adaptive Runtime"
        active={
          !!hasAdaptiveRuntime
        }
      />

      <RuntimeFlag
        label="Semantic Related"
        active={
          !!hasSemanticRelated
        }
      />

    </div>

    {/* ============================================================
    ENDPOINT
    ============================================================ */}

    <div
      style={{

        padding:
          '18px 20px',

        borderRadius:
          '18px',

        background:
          'rgba(255,255,255,.03)',

        border:
          '1px solid rgba(255,255,255,.05)',
      }}
    >

      <div
        style={{

          color:
            '#94a3b8',

          fontSize:
            '12px',

          textTransform:
            'uppercase',

          letterSpacing:
            '.08em',

          marginBottom:
            '10px',
        }}
      >

        Runtime Endpoint

      </div>

      <div
        style={{

          color:
            '#ffffff',

          wordBreak:
            'break-all',

          lineHeight:
            1.8,

          fontSize:
            '14px',
        }}
      >

        {endpoint}

      </div>

    </div>

  </div>

</section>


)
}

/* ============================================================================
🔥 Status Pill
============================================================================ */

function StatusPill({
label,
value,
}: {
label: string
value: string
}) {

return (


<div
  style={{

    display:
      'flex',

    justifyContent:
      'space-between',

    alignItems:
      'center',

    padding:
      '14px 16px',

    borderRadius:
      '16px',

    background:
      'rgba(255,255,255,.04)',

    border:
      '1px solid rgba(255,255,255,.05)',
  }}
>

  <div
    style={{

      color:
        '#94a3b8',

      fontSize:
        '13px',
    }}
  >

    {label}

  </div>

  <div
    style={{

      color:
        '#ffffff',

      fontWeight:
        700,
    }}
  >

    {value}

  </div>

</div>


)
}

/* ============================================================================
🔥 Runtime Flag
============================================================================ */

function RuntimeFlag({
label,
active,
}: {
label: string
active: boolean
}) {

return (


<div
  style={{

    display:
      'flex',

    alignItems:
      'center',

    gap:
      '10px',

    padding:
      '12px 16px',

    borderRadius:
      '999px',

    background:

      active

        ? 'rgba(34,197,94,.12)'

        : 'rgba(255,255,255,.03)',

    border:

      active

        ? '1px solid rgba(34,197,94,.32)'

        : '1px solid rgba(255,255,255,.05)',
  }}
>

  <div
    style={{

      width:
        '10px',

      height:
        '10px',

      borderRadius:
        '999px',

      background:

        active
          ? '#22c55e'
          : '#64748b',

      boxShadow:

        active

          ? '0 0 14px rgba(34,197,94,.9)'

          : 'none',
    }}
  />

  <div
    style={{

      color:
        '#ffffff',

      fontSize:
        '13px',

      fontWeight:
        600,
    }}
  >

    {label}

  </div>

</div>


)
}
