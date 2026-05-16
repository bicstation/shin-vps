// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/sections/ontology/OntologyHeroSection.tsx

/* eslint-disable @next/next/no-img-element */
// @ts-nocheck

/* =========================================
🔥 Section
========================================= */

export default function
OntologyHeroSection() {

  return (

    <section
      style={{
        position: 'relative',

        overflow: 'hidden',

        padding:
          '120px 24px 88px',

        borderBottom:
          '1px solid rgba(255,255,255,0.06)',
      }}
    >

      {/* ==================================
      BACKGROUND
      ================================== */}

      <div
        style={{
          position: 'absolute',

          inset: 0,

          background: `
            radial-gradient(
              circle at top left,
              rgba(59,130,246,0.18),
              transparent 32%
            ),
            radial-gradient(
              circle at top right,
              rgba(168,85,247,0.14),
              transparent 28%
            )
          `,

          pointerEvents: 'none',
        }}
      />

      {/* ==================================
      CONTENT
      ================================== */}

      <div
        style={{
          position: 'relative',

          zIndex: 1,

          maxWidth: '1440px',

          margin: '0 auto',
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

            minHeight: '40px',

            padding:
              '0 16px',

            borderRadius: '999px',

            background:
              'rgba(59,130,246,0.12)',

            border:
              '1px solid rgba(59,130,246,0.18)',

            fontSize: '12px',

            fontWeight: 800,

            letterSpacing: '0.08em',

            textTransform:
              'uppercase',

            color: '#dbeafe',

            marginBottom: '28px',
          }}
        >
          semantic ontology runtime
        </div>

        {/* ==============================
        TITLE
        ============================== */}

        <h1
          style={{
            maxWidth: '980px',

            fontSize:
              'clamp(52px, 8vw, 104px)',

            lineHeight: 0.94,

            fontWeight: 900,

            letterSpacing: '-0.05em',

            marginBottom: '32px',
          }}
        >
          PC属性一覧
        </h1>

        {/* ==============================
        DESCRIPTION
        ============================== */}

        <p
          style={{
            maxWidth: '920px',

            fontSize:
              'clamp(16px, 2vw, 22px)',

            lineHeight: 1.9,

            color:
              'rgba(255,255,255,0.72)',

            marginBottom: '48px',
          }}
        >
          backend semantic ontology runtime
          に登録された attribute を探索できます。

          用途・GPU・CPU・メーカー・AI・NPU
          など、
          semantic authority をそのまま
          runtime rendering しています。
        </p>

        {/* ==============================
        META GRID
        ============================== */}

        <div
          style={{
            display: 'grid',

            gridTemplateColumns:
              'repeat(auto-fit,minmax(220px,1fr))',

            gap: '18px',
          }}
        >

          {/* ==========================
          META CARD
          ========================== */}

          <div
            style={{
              padding: '22px',

              borderRadius: '24px',

              background:
                'rgba(255,255,255,0.04)',

              border:
                '1px solid rgba(255,255,255,0.08)',
            }}
          >

            <div
              style={{
                fontSize: '12px',

                opacity: 0.5,

                marginBottom: '10px',
              }}
            >
              discovery
            </div>

            <div
              style={{
                fontSize: '18px',

                fontWeight: 800,

                lineHeight: 1.5,
              }}
            >
              semantic attribute
              discovery runtime
            </div>

          </div>

          {/* ==========================
          META CARD
          ========================== */}

          <div
            style={{
              padding: '22px',

              borderRadius: '24px',

              background:
                'rgba(255,255,255,0.04)',

              border:
                '1px solid rgba(255,255,255,0.08)',
            }}
          >

            <div
              style={{
                fontSize: '12px',

                opacity: 0.5,

                marginBottom: '10px',
              }}
            >
              authority
            </div>

            <div
              style={{
                fontSize: '18px',

                fontWeight: 800,

                lineHeight: 1.5,
              }}
            >
              backend semantic
              ontology authority
            </div>

          </div>

          {/* ==========================
          META CARD
          ========================== */}

          <div
            style={{
              padding: '22px',

              borderRadius: '24px',

              background:
                'rgba(255,255,255,0.04)',

              border:
                '1px solid rgba(255,255,255,0.08)',
            }}
          >

            <div
              style={{
                fontSize: '12px',

                opacity: 0.5,

                marginBottom: '10px',
              }}
            >
              runtime
            </div>

            <div
              style={{
                fontSize: '18px',

                fontWeight: 800,

                lineHeight: 1.5,
              }}
            >
              AI-native semantic
              ranking architecture
            </div>

          </div>

        </div>

      </div>

    </section>

  )
}