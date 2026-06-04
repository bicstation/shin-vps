// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/next-bicstation/app/test/runtime/components/RuntimeTabs.tsx
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

short:
  'DETAIL',

icon:
  '◉',


},

{
key: 'related',


title:
  'Continuation Runtime',

short:
  'RELATED',

icon:
  '⇄',


},

{
key: 'ranking',


title:
  'Ranking Runtime',

short:
  'RANKING',

icon:
  '▲',


},

{
key: 'sidebar',


title:
  'Sidebar Runtime',

short:
  'SIDEBAR',

icon:
  '▣',


},

{
key: 'discovery',


title:
  'Discovery Runtime',

short:
  'DISCOVERY',

icon:
  '◎',


},

{
key: 'finder',


title:
  'Finder Runtime',

short:
  'FINDER',

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
🔥 Runtime Tabs
============================================================================ */

export default function RuntimeTabs({

mode,

uniqueId,

}: Props) {

return (


<section
  style={{

    position:
      'relative',

    overflowX:
      'auto',

    borderRadius:
      '24px',

    border:
      '1px solid rgba(255,255,255,.06)',

    background:
      `
      linear-gradient(
        180deg,
        rgba(15,23,42,.92),
        rgba(2,6,23,.98)
      )
      `,

    padding:
      '16px',
  }}
>

  {/* ================================================================
  TABS
  ================================================================ */}

  <div
    style={{

      display:
        'flex',

      alignItems:
        'stretch',

      gap:
        '14px',

      minWidth:
        'max-content',
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
                  'flex',

                flexDirection:
                  'column',

                justifyContent:
                  'center',

                minWidth:
                  '220px',

                padding:
                  '18px 20px',

                borderRadius:
                  '20px',

                textDecoration:
                  'none',

                background:

                  active

                    ? `
                    linear-gradient(
                      180deg,
                      rgba(14,165,233,.18),
                      rgba(15,23,42,.94)
                    )
                    `

                    : `
                    linear-gradient(
                      180deg,
                      rgba(255,255,255,.03),
                      rgba(255,255,255,.01)
                    )
                    `,

                border:

                  active

                    ? '1px solid rgba(14,165,233,.32)'

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
              TOP
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
                    'center',

                  justifyContent:
                    'space-between',

                  marginBottom:
                    '14px',
                }}
              >

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

                        ? 'rgba(14,165,233,.14)'

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

                <div
                  style={{

                    color:

                      active
                        ? '#7dd3fc'
                        : '#64748b',

                    fontSize:
                      '11px',

                    fontWeight:
                      800,

                    letterSpacing:
                      '.12em',

                    textTransform:
                      'uppercase',
                  }}
                >

                  {item.short}

                </div>

              </div>

              {/* ======================================================
              TITLE
              ====================================================== */}

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
                      '#ffffff',

                    fontWeight:
                      800,

                    fontSize:
                      '15px',

                    marginBottom:
                      '8px',
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

                  semantic runtime observatory

                </div>

              </div>

            </a>

          )
        }
      )
    }

  </div>

</section>


)
}
