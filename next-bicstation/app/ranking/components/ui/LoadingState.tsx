// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/components/ui/LoadingState.tsx

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
LoadingState({

  title = 'Loading Semantic Runtime',

  description = `
semantic ontology runtime
を読み込み中です。
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
              rgba(59,130,246,0.12),
              rgba(15,23,42,0.04)
            )
          `,

        border:
          '1px solid rgba(59,130,246,0.18)',
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
            'rgba(59,130,246,0.18)',

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

          gap: '24px',

          justifyItems:
            'center',

          maxWidth: '720px',

          textAlign:
            'center',
        }}
      >

        {/* ==============================
        SPINNER
        ============================== */}

        <div
          style={{
            position: 'relative',

            width: '84px',

            height: '84px',
          }}
        >

          {/* ============================
          OUTER
          ============================ */}

          <div
            style={{
              position: 'absolute',

              inset: 0,

              borderRadius:
                '999px',

              border:
                '4px solid rgba(255,255,255,0.08)',

              borderTop:
                '4px solid #60a5fa',

              animation:
                'spin 1s linear infinite',
            }}
          />

          {/* ============================
          INNER
          ============================ */}

          <div
            style={{
              position: 'absolute',

              inset: '18px',

              borderRadius:
                '999px',

              border:
                '3px solid rgba(255,255,255,0.06)',

              borderBottom:
                '3px solid #c084fc',

              animation:
                'spinReverse 1.4s linear infinite',
            }}
          />

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

      {/* ==================================
      KEYFRAMES
      ================================== */}

      <style jsx>
        {`
          @keyframes spin {

            from {
              transform:
                rotate(0deg);
            }

            to {
              transform:
                rotate(360deg);
            }

          }

          @keyframes spinReverse {

            from {
              transform:
                rotate(360deg);
            }

            to {
              transform:
                rotate(0deg);
            }

          }
        `}
      </style>

    </section>

  )
}