// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/next-bicstation/app/test/runtime/components/RuntimeTerminal.tsx
// ============================================================================

'use client'

/* ============================================================================
🔥 Terminal Entry
============================================================================ */

type TerminalEntry = {

timestamp?: string

level?: 'info' | 'success' | 'warning' | 'error'

message: string
}

/* ============================================================================
🔥 Props
============================================================================ */

type Props = {

title?: string

entries?: TerminalEntry[]

maxHeight?: number
}

/* ============================================================================
🔥 Runtime Terminal
============================================================================ */

export default function RuntimeTerminal({

title = 'Runtime Terminal',

entries = [],

maxHeight = 520,

}: Props) {

return (


<section
  style={{

    position:
      'relative',

    overflow:
      'hidden',

    borderRadius:
      '28px',

    border:
      '1px solid rgba(255,255,255,.06)',

    background:
      `
      linear-gradient(
        180deg,
        rgba(15,23,42,.96),
        rgba(2,6,23,1)
      )
      `,
  }}
>

  {/* ================================================================
  HEADER
  ================================================================ */}

  <div
    style={{

      display:
        'flex',

      justifyContent:
        'space-between',

      alignItems:
        'center',

      gap:
        '16px',

      padding:
        '18px 22px',

      borderBottom:
        '1px solid rgba(255,255,255,.06)',

      background:
        'rgba(255,255,255,.02)',
    }}
  >

    {/* ============================================================
    LEFT
    ============================================================ */}

    <div
      style={{

        display:
          'flex',

        alignItems:
          'center',

        gap:
          '14px',
      }}
    >

      {/* ==========================================================
      TERMINAL DOTS
      ========================================================== */}

      <div
        style={{

          display:
            'flex',

          alignItems:
            'center',

          gap:
            '8px',
        }}
      >

        <Dot color="#ef4444" />
        <Dot color="#f59e0b" />
        <Dot color="#22c55e" />

      </div>

      <div>

        <div
          style={{

            color:
              '#ffffff',

            fontSize:
              '15px',

            fontWeight:
              700,
          }}
        >

          {title}

        </div>

        <div
          style={{

            color:
              '#64748b',

            fontSize:
              '12px',

            marginTop:
              '4px',
          }}
        >

          semantic runtime observatory console

        </div>

      </div>

    </div>

    {/* ============================================================
    STATUS
    ============================================================ */}

    <div
      style={{

        padding:
          '8px 12px',

        borderRadius:
          '999px',

        background:
          'rgba(34,197,94,.08)',

        border:
          '1px solid rgba(34,197,94,.22)',

        color:
          '#22c55e',

        fontSize:
          '12px',

        fontWeight:
          700,
      }}
    >

      LIVE

    </div>

  </div>

  {/* ================================================================
  BODY
  ================================================================ */}

  <div
    style={{

      position:
        'relative',

      maxHeight:
        `${maxHeight}px`,

      overflow:
        'auto',

      padding:
        '24px',
    }}
  >

    {/* ============================================================
    GLOW
    ============================================================ */}

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
          'rgba(14,165,233,.08)',

        filter:
          'blur(80px)',

        pointerEvents:
          'none',
      }}
    />

    {/* ============================================================
    EMPTY
    ============================================================ */}

    {
      entries.length === 0 && (

        <div
          style={{

            position:
              'relative',

            zIndex:
              2,

            color:
              '#64748b',

            fontFamily:
              'monospace',

            fontSize:
              '13px',

            lineHeight:
              1.9,
          }}
        >

          [runtime] observatory initialized...<br />
          [runtime] waiting for semantic events...
        </div>

      )
    }

    {/* ============================================================
    ENTRIES
    ============================================================ */}

    {
      entries.map(
        (
          entry,
          index
        ) => {

          const color =

            resolveColor(
              entry.level
            )

          return (

            <div
              key={index}

              style={{

                position:
                  'relative',

                zIndex:
                  2,

                display:
                  'flex',

                alignItems:
                  'flex-start',

                gap:
                  '14px',

                padding:
                  '12px 0',

                borderBottom:
                  '1px dashed rgba(255,255,255,.04)',
              }}
            >

              {/* ==================================================
              DOT
              ================================================== */}

              <div
                style={{

                  width:
                    '10px',

                  height:
                    '10px',

                  borderRadius:
                    '999px',

                  marginTop:
                    '8px',

                  background:
                    color,

                  boxShadow:
                    `0 0 14px ${color}`,
                }}
              />

              {/* ==================================================
              CONTENT
              ================================================== */}

              <div
                style={{

                  flex: 1,
                }}
              >

                {/* ==============================================
                META
                ============================================== */}

                <div
                  style={{

                    display:
                      'flex',

                    alignItems:
                      'center',

                    gap:
                      '10px',

                    marginBottom:
                      '6px',

                    flexWrap:
                      'wrap',
                  }}
                >

                  <span
                    style={{

                      color,

                      fontSize:
                        '11px',

                      fontWeight:
                        800,

                      letterSpacing:
                        '.08em',

                      textTransform:
                        'uppercase',
                    }}
                  >

                    {entry.level || 'info'}

                  </span>

                  {
                    entry.timestamp && (

                      <span
                        style={{

                          color:
                            '#64748b',

                          fontSize:
                            '11px',

                          fontFamily:
                            'monospace',
                        }}
                      >

                        {entry.timestamp}

                      </span>

                    )
                  }

                </div>

                {/* ==============================================
                MESSAGE
                ============================================== */}

                <div
                  style={{

                    color:
                      '#cbd5e1',

                    fontSize:
                      '13px',

                    lineHeight:
                      1.9,

                    fontFamily:
                      `
                      ui-monospace,
                      SFMono-Regular,
                      Menlo,
                      Monaco,
                      Consolas,
                      monospace
                      `,
                  }}
                >

                  {entry.message}

                </div>

              </div>

            </div>

          )
        }
      )
    }

  </div>

</section>


)
}

/* ============================================================================
🔥 Dot
============================================================================ */

function Dot({
color,
}: {
color: string
}) {

return (


<div
  style={{

    width:
      '10px',

    height:
      '10px',

    borderRadius:
      '999px',

    background:
      color,

    boxShadow:
      `0 0 12px ${color}`,
  }}
/>


)
}

/* ============================================================================
🔥 Resolve Color
============================================================================ */

function resolveColor(
level?: string
) {

switch (level) {


case 'success':
  return '#22c55e'

case 'warning':
  return '#f59e0b'

case 'error':
  return '#ef4444'

default:
  return '#7dd3fc'


}
}
