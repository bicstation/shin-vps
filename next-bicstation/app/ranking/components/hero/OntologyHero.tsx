// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/components/hero/OntologyHero.tsx

/* eslint-disable @next/next/no-img-element */
// @ts-nocheck

/* =========================================
🔥 Types
========================================= */

type Props = {

  title?: string

  description?: string

  totalGroups?: number

  totalAttributes?: number
}

/* =========================================
🔥 Component
========================================= */

export default function
OntologyHero({

  title = 'Semantic Ontology Explorer',

  description = `
backend semantic ontology runtime
に登録された attribute を探索できます。
`,

  totalGroups = 0,

  totalAttributes = 0,

}: Props) {

  return (

    <div
      style={{
        position: 'relative',

        overflow: 'hidden',

        borderRadius: '40px',

        padding:
          '56px',

        background:
          `
            linear-gradient(
              135deg,
              rgba(59,130,246,0.18),
              rgba(168,85,247,0.08)
            )
          `,

        border:
          '1px solid rgba(255,255,255,0.08)',
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

          width: '280px',

          height: '280px',

          borderRadius:
            '999px',

          background:
            'rgba(59,130,246,0.24)',

          filter:
            'blur(60px)',

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

          gap: '32px',
        }}
      >

        {/* ==============================
        LABEL
        ============================== */}

        <div
          style={{
            display: 'inline-flex',

            alignItems: 'center',

            gap: '10px',

            width: 'fit-content',

            minHeight: '40px',

            padding:
              '0 16px',

            borderRadius:
              '999px',

            background:
              'rgba(255,255,255,0.08)',

            border:
              '1px solid rgba(255,255,255,0.08)',

            fontSize: '12px',

            fontWeight: 800,

            letterSpacing:
              '0.08em',

            textTransform:
              'uppercase',
          }}
        >
          semantic ontology runtime
        </div>

        {/* ==============================
        TITLE
        ============================== */}

        <div
          style={{
            display: 'grid',

            gap: '20px',
          }}
        >

          <h1
            style={{
              maxWidth: '920px',

              fontSize:
                'clamp(48px,8vw,96px)',

              lineHeight: 0.95,

              fontWeight: 900,

              letterSpacing:
                '-0.05em',

              margin: 0,
            }}
          >
            {title}
          </h1>

          <p
            style={{
              maxWidth: '920px',

              fontSize:
                'clamp(16px,2vw,22px)',

              lineHeight: 1.9,

              color:
                'rgba(255,255,255,0.76)',

              margin: 0,

              whiteSpace:
                'pre-line',
            }}
          >
            {description}
          </p>

        </div>

        {/* ==============================
        STATS
        ============================== */}

        <div
          style={{
            display: 'grid',

            gridTemplateColumns:
              `
                repeat(
                  auto-fit,
                  minmax(220px,1fr)
                )
              `,

            gap: '20px',
          }}
        >

          {/* ============================
          GROUPS
          ============================ */}

          <div
            style={{
              padding: '24px',

              borderRadius: '28px',

              background:
                'rgba(255,255,255,0.06)',

              border:
                '1px solid rgba(255,255,255,0.08)',
            }}
          >

            <div
              style={{
                fontSize: '12px',

                opacity: 0.5,

                marginBottom: '12px',

                textTransform:
                  'uppercase',

                letterSpacing:
                  '0.08em',
              }}
            >
              semantic groups
            </div>

            <div
              style={{
                fontSize: '48px',

                lineHeight: 1,

                fontWeight: 900,
              }}
            >
              {totalGroups}
            </div>

          </div>

          {/* ============================
          ATTRIBUTES
          ============================ */}

          <div
            style={{
              padding: '24px',

              borderRadius: '28px',

              background:
                'rgba(255,255,255,0.06)',

              border:
                '1px solid rgba(255,255,255,0.08)',
            }}
          >

            <div
              style={{
                fontSize: '12px',

                opacity: 0.5,

                marginBottom: '12px',

                textTransform:
                  'uppercase',

                letterSpacing:
                  '0.08em',
              }}
            >
              semantic attributes
            </div>

            <div
              style={{
                fontSize: '48px',

                lineHeight: 1,

                fontWeight: 900,
              }}
            >
              {totalAttributes}
            </div>

          </div>

        </div>

      </div>

    </div>

  )
}