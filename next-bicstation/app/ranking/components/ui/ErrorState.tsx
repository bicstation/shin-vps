// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/components/ui/ErrorState.tsx

/* eslint-disable @next/next/no-img-element */
// @ts-nocheck

/* =========================================
🔥 Types
========================================= */

type Props = {

  title?: string

  message?: string
}

/* =========================================
🔥 Component
========================================= */

export default function
ErrorState({

  title = 'Runtime Error',

  message = `
semantic runtime request
failed.
`,

}: Props) {

  return (

    <section
      style={{
        position: 'relative',

        overflow: 'hidden',

        display: 'grid',

        placeItems: 'center',

        minHeight: '360px',

        padding:
          '48px',

        borderRadius:
          '36px',

        background:
          `
            linear-gradient(
              135deg,
              rgba(239,68,68,0.12),
              rgba(127,29,29,0.04)
            )
          `,

        border:
          '1px solid rgba(239,68,68,0.18)',
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
            'rgba(239,68,68,0.18)',

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
          ⚠️
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
        MESSAGE
        ============================== */}

        <p
          style={{
            margin: 0,

            fontSize:
              '16px',

            lineHeight: 1.9,

            color:
              'rgba(255,255,255,0.72)',

            whiteSpace:
              'pre-line',
          }}
        >
          {message}
        </p>

      </div>

    </section>

  )
}