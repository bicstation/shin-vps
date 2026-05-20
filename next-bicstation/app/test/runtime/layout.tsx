// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/next-bicstation/app/test/runtime/layout.tsx
// ============================================================================

import type {
ReactNode,
} from 'react'

import './styles.module.css'

/* ============================================================================
🔥 Props
============================================================================ */

type Props = {

children: ReactNode
}

/* ============================================================================
🔥 Runtime Observatory Layout
============================================================================ */

export default function RuntimeLayout({
children,
}: Props) {

return (


<div
  style={{

    minHeight:
      '100vh',

    background:
      `
      radial-gradient(
        circle at top,
        rgba(14,165,233,.12),
        transparent 40%
      ),
      linear-gradient(
        180deg,
        #020617 0%,
        #020617 100%
      )
      `,

    color:
      '#ffffff',

    display:
      'flex',

    flexDirection:
      'column',
  }}
>

  {/* ================================================================
  TOP BAR
  ================================================================ */}

  <header
    style={{

      position:
        'sticky',

      top: 0,

      zIndex: 100,

      backdropFilter:
        'blur(20px)',

      background:
        'rgba(2,6,23,.72)',

      borderBottom:
        '1px solid rgba(255,255,255,.06)',
    }}
  >

    <div
      style={{

        maxWidth:
          '1600px',

        margin:
          '0 auto',

        padding:
          '20px 32px',

        display:
          'flex',

        alignItems:
          'center',

        justifyContent:
          'space-between',
      }}
    >

      {/* ============================================================
      TITLE
      ============================================================ */}

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
              '.12em',

            textTransform:
              'uppercase',

            marginBottom:
              '6px',
          }}
        >

          SHIN CORE LINX

        </div>

        <h1
          style={{

            margin: 0,

            fontSize:
              '28px',

            fontWeight:
              900,

            lineHeight:
              1.1,
          }}
        >

          Runtime Laboratory

        </h1>

      </div>

      {/* ============================================================
      STATUS
      ============================================================ */}

      <div
        style={{

          display:
            'flex',

          alignItems:
            'center',

          gap:
            '12px',
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
              '#22c55e',

            boxShadow:
              '0 0 20px rgba(34,197,94,.8)',
          }}
        />

        <div
          style={{

            color:
              '#94a3b8',

            fontSize:
              '13px',
          }}
        >

          semantic runtime observatory

        </div>

      </div>

    </div>

  </header>

  {/* ================================================================
  MAIN
  ================================================================ */}

  <main
    style={{

      flex: 1,

      width:
        '100%',

      maxWidth:
        '1600px',

      margin:
        '0 auto',

      padding:
        '40px 32px 80px',
    }}
  >

    {children}

  </main>

</div>


)
}
