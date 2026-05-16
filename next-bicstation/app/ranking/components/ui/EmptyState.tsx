// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/components/ui/EmptyState.tsx

/* eslint-disable @next/next/no-img-element */
// @ts-nocheck

/* =========================================
🔥 Types
========================================= */

type Props = {

  title?: string

  description?: string
}

/* =========================================
🔥 Component
========================================= */

export default function
EmptyState({

  title = 'No Data',

  description = `
semantic runtime data
is empty.
`,

}: Props) {

  return (

    <section
      style={{
        position: 'relative',

        overflow: 'hidden',

        display: 'grid',

        placeItems: 'center',

        minHeight: '320px',

        padding:
          '48px',

        borderRadius:
          '36px',

        background:
          `
            linear-gradient(
              135deg,
              rgba(255,255,255,0.04),
              rgba(255,255,255,0.02)
            )
          `,

        border:
          '1px dashed rgba(255,255,255,0.12)',
      }}
    >

      {/* ==================================
      GLOW
      ================================== */}

      <div
        style={{
          position: 'absolute',

          top: '-120px',

          right: '-120px',

          width: '260px',

          height: '260px',

          borderRadius:
            '999px',

          background:
            'rgba(59,130,246,0.12)',

          filter:
            'blur(64px)',

          pointerEvents:
            'none',
        }}
      />

      {/* ==================================
      CONTENT
      ================================== */}

      <div
        style={{
          position: 'relative',

          zIndex: 1,

          display: 'grid',

          gap: '20px',

          maxWidth: '720px',

          textAlign:
            'center',
        }}
      >

        {/* ==============================
        ICON
        ============================== */}

        <div
          style={{
            fontSize: '72px',

            lineHeight: 1,
          }}
        >
          🛰️
        </div>

        {/* ==============================
        TITLE
        ============================== */}

        <h2
          style={{
            margin: 0,

            fontSize:
              'clamp(32px,5vw,52px)',

            lineHeight: 1,

            fontWeight: 900,

            letterSpacing:
              '-0.04em',
          }}
        >
          {title}
        </h2>

        {/* ==============================
        DESCRIPTION
        ============================== */}

        <p
          style={{
            margin: 0,

            fontSize:
              '16px',

            lineHeight: 1.9,

            color:
              'rgba(255,255,255,0.68)',

            whiteSpace:
              'pre-line',
          }}
        >
          {description}
        </p>

      </div>

    </section>

  )
}