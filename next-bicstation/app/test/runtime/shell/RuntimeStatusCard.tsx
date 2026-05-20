// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/next-bicstation/app/test/runtime/components/RuntimeStatusCard.tsx
// ============================================================================

'use client'

/* ============================================================================
🔥 Props
============================================================================ */

type Props = {

title: string

value: string

description?: string

active?: boolean

color?: string

glow?: boolean
}

/* ============================================================================
🔥 Runtime Status Card
============================================================================ */

export default function RuntimeStatusCard({

title,

value,

description,

active = false,

color = '#7dd3fc',

glow = true,

}: Props) {

return (


<section
  style={{

    position:
      'relative',

    overflow:
      'hidden',

    borderRadius:
      '24px',

    border:

      active

        ? `1px solid ${hexToRgba(color,.28)}`

        : '1px solid rgba(255,255,255,.05)',

    background:
      `
      linear-gradient(
        180deg,
        rgba(15,23,42,.94),
        rgba(2,6,23,1)
      )
      `,

    padding:
      '24px',
  }}
>

  {/* ================================================================
  GLOW
  ================================================================ */}

  {
    glow && (

      <div
        style={{

          position:
            'absolute',

          top:
            '-80px',

          right:
            '-80px',

          width:
            '180px',

          height:
            '180px',

          borderRadius:
            '999px',

          background:
            hexToRgba(
              color,
              .12
            ),

          filter:
            'blur(70px)',

          pointerEvents:
            'none',
        }}
      />

    )
  }

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
        '18px',
    }}
  >

    {/* ============================================================
    HEADER
    ============================================================ */}

    <div
      style={{

        display:
          'flex',

        alignItems:
          'center',

        justifyContent:
          'space-between',

        gap:
          '14px',
      }}
    >

      <div
        style={{

          color:
            '#94a3b8',

          fontSize:
            '12px',

          fontWeight:
            700,

          letterSpacing:
            '.08em',

          textTransform:
            'uppercase',
        }}
      >

        {title}

      </div>

      {/* ==========================================================
      STATUS DOT
      ========================================================== */}

      <div
        style={{

          width:
            '12px',

          height:
            '12px',

          borderRadius:
            '999px',

          background:
            active
              ? color
              : '#64748b',

          boxShadow:

            active

              ? `0 0 16px ${color}`

              : 'none',
        }}
      />

    </div>

    {/* ============================================================
    VALUE
    ============================================================ */}

    <div
      style={{

        color:
          '#ffffff',

        fontSize:
          'clamp(28px,3vw,42px)',

        lineHeight:
          1.1,

        fontWeight:
          900,

        wordBreak:
          'break-word',
      }}
    >

      {value}

    </div>

    {/* ============================================================
    DESCRIPTION
    ============================================================ */}

    {
      description && (

        <div
          style={{

            color:
              '#94a3b8',

            fontSize:
              '14px',

            lineHeight:
              1.8,
          }}
        >

          {description}

        </div>

      )
    }

  </div>

</section>


)
}

/* ============================================================================
🔥 HEX → RGBA
============================================================================ */

function hexToRgba(
hex: string,
alpha: number
) {

const sanitized =


hex.replace('#', '')


const bigint =


parseInt(
  sanitized,
  16
)


const r =


(bigint >> 16) & 255


const g =


(bigint >> 8) & 255


const b =


bigint & 255


return `rgba(${r},${g},${b},${alpha})`
}
