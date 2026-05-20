// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/next-bicstation/app/test/runtime/components/RuntimeSidebar.tsx
// ============================================================================

'use client'

/* ============================================================================
🔥 Runtime Modes
============================================================================ */

const RUNTIME_MODES = [

{
key: 'detail',


title:
  'Product Runtime',

description:
  'semantic product runtime inspector',

icon:
  '◉',


},

{
key: 'related',


title:
  'Continuation Runtime',

description:
  'semantic traversal continuity',

icon:
  '⇄',


},

{
key: 'ranking',


title:
  'Ranking Runtime',

description:
  'semantic discovery ranking',

icon:
  '▲',


},

{
key: 'sidebar',


title:
  'Sidebar Runtime',

description:
  'semantic aggregation runtime',

icon:
  '▣',


},

{
key: 'discovery',


title:
  'Discovery Runtime',

description:
  'exploration orchestration runtime',

icon:
  '◎',


},

{
key: 'finder',


title:
  'Finder Runtime',

description:
  'semantic finder laboratory',

icon:
  '⌕',


},
]

/* ============================================================================
🔥 Props
============================================================================ */

type Props = {

mode: string

uniqueId?: string
}

/* ============================================================================
🔥 Runtime Sidebar
============================================================================ */

export default function RuntimeSidebar({

mode,

uniqueId,

}: Props) {

return (


<aside
  style={{

    position:
      'sticky',

    top:
      '110px',

    display:
      'flex',

    flexDirection:
      'column',

    gap:
      '22px',
  }}
>

  {/* ================================================================
  OBSERVATORY
  ================================================================ */}

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
          rgba(15,23,42,.94),
          rgba(2,6,23,1)
        )
        `,

      padding:
        '26px',
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
          '-100px',

        right:
          '-100px',

        width:
          '220px',

        height:
          '220px',

        borderRadius:
          '999px',

        background:
          'rgba(14,165,233,.10)',

        filter:
          'blur(70px)',
      }}
    />

    {/* ============================================================
    CONTENT
    ============================================================ */}

    <div
      style={{

        position:
          'relative',

        zIndex:
          2,
      }}
    >

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
            '12px',
        }}
      >

        Runtime Observatory

      </div>

      <h2
        style={{

          margin:
            '0 0 14px',

          fontSize:
            '28px',

          lineHeight:
            1.1,

          fontWeight:
            900,
        }}
      >

        Semantic Runtime Navigation

      </h2>

      <div
        style={{

          color:
            '#94a3b8',

          fontSize:
            '14px',

          lineHeight:
            1.9,
        }}
      >

        traversal inspector ・
        continuation debugger ・
        exploration runtime laboratory

      </div>

    </div>

  </section>

  {/* ================================================================
  RUNTIME MODES
  ================================================================ */}

  <section
    style={{

      display:
        'flex',

      flexDirection:
        'column',

      gap:
        '14px',
    }}
  >

    {
      RUNTIME_MODES.map(
        (item) => {

          const active =

            mode === item.key

          return (

            <a
              key={item.key}

              href={
                `/test/runtime?mode=${item.key}&unique_id=${uniqueId || ''}`
              }

              style={{

                position:
                  'relative',

                overflow:
                  'hidden',

                display:
                  'block',

                padding:
                  '18px 20px',

                borderRadius:
                  '22px',

                textDecoration:
                  'none',

                background:

                  active

                    ? `
                    linear-gradient(
                      180deg,
                      rgba(14,165,233,.18),
                      rgba(15,23,42,.92)
                    )
                    `

                    : `
                    linear-gradient(
                      180deg,
                      rgba(15,23,42,.88),
                      rgba(2,6,23,.98)
                    )
                    `,

                border:

                  active

                    ? '1px solid rgba(14,165,233,.34)'

                    : '1px solid rgba(255,255,255,.05)',

                transition:
                  'all .22s ease',
              }}
            >

              {/* ======================================================
              ACTIVE GLOW
              ====================================================== */}

              {
                active && (

                  <div
                    style={{

                      position:
                        'absolute',

                      inset: 0,

                      background:
                        'rgba(14,165,233,.04)',

                      pointerEvents:
                        'none',
                    }}
                  />

                )
              }

              {/* ======================================================
              CONTENT
              ====================================================== */}

              <div
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
                    '16px',
                }}
              >

                {/* ==================================================
                ICON
                ================================================== */}

                <div
                  style={{

                    width:
                      '42px',

                    height:
                      '42px',

                    borderRadius:
                      '14px',

                    display:
                      'flex',

                    alignItems:
                      'center',

                    justifyContent:
                      'center',

                    background:

                      active

                        ? 'rgba(14,165,233,.16)'

                        : 'rgba(255,255,255,.04)',

                    color:

                      active
                        ? '#7dd3fc'
                        : '#cbd5e1',

                    fontSize:
                      '18px',

                    fontWeight:
                      700,
                  }}
                >

                  {item.icon}

                </div>

                {/* ==================================================
                TEXT
                ================================================== */}

                <div>

                  <div
                    style={{

                      color:
                        '#ffffff',

                      fontWeight:
                        800,

                      marginBottom:
                        '6px',

                      fontSize:
                        '15px',
                    }}
                  >

                    {item.title}

                  </div>

                  <div
                    style={{

                      color:
                        '#94a3b8',

                      fontSize:
                        '13px',

                      lineHeight:
                        1.7,
                    }}
                  >

                    {item.description}

                  </div>

                </div>

              </div>

            </a>

          )
        }
      )
    }

  </section>

</aside>


)
}
