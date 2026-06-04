// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/next-bicstation/app/test/runtime/components/RuntimePayloadViewer.tsx
// ============================================================================

'use client'

/* ============================================================================
🔥 Props
============================================================================ */

type Props = {

payload: any

title?: string

maxHeight?: number
}

/* ============================================================================
🔥 Runtime Payload Viewer
============================================================================ */

export default function RuntimePayloadViewer({

payload,

title = 'Runtime Payload',

maxHeight = 920,

}: Props) {

// ==========================================================================
// Pretty JSON
// ==========================================================================

const formatted =


JSON.stringify(
  payload,
  null,
  2
)


// ==========================================================================
// Render
// ==========================================================================

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
  TOP BAR
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
    TITLE
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

          semantic runtime observatory

        </div>

      </div>

    </div>

    {/* ============================================================
    PAYLOAD SIZE
    ============================================================ */}

    <div
      style={{

        padding:
          '8px 12px',

        borderRadius:
          '999px',

        background:
          'rgba(14,165,233,.08)',

        border:
          '1px solid rgba(14,165,233,.22)',

        color:
          '#7dd3fc',

        fontSize:
          '12px',

        fontWeight:
          700,
      }}
    >

      {
        (formatted || '').length
      } bytes

    </div>

  </div>

  {/* ================================================================
  PAYLOAD
  ================================================================ */}

  <div
    style={{

      position:
        'relative',

      maxHeight:
        `${maxHeight}px`,

      overflow:
        'auto',
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
    CODE
    ============================================================ */}

    <pre
      style={{

        position:
          'relative',

        zIndex:
          2,

        margin: 0,

        padding:
          '28px',

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

        whiteSpace:
          'pre-wrap',

        wordBreak:
          'break-word',
      }}
    >

      {formatted}

    </pre>

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
