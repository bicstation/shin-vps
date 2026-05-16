// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/components/cards/SemanticInsightCard.tsx

/* eslint-disable @next/next/no-img-element */
// @ts-nocheck

/* =========================================
🔥 Types
========================================= */

type Props = {

  insight?: {

    title?: string

    description?: string

    icon?: string
  }
}

/* =========================================
🔥 Component
========================================= */

export default function
SemanticInsightCard({

  insight,

}: Props) {

  /* ======================================
  🔥 Empty
  ====================================== */

  if (
    !insight
    || !insight?.title
  ) {
    return null
  }

  /* ======================================
  🔥 Render
  ====================================== */

  return (

    <article
      style={{
        position: 'relative',

        overflow: 'hidden',

        padding: '32px',

        borderRadius: '32px',

        background:
          `
            linear-gradient(
              135deg,
              rgba(255,255,255,0.06),
              rgba(255,255,255,0.02)
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

          top: '-80px',

          right: '-80px',

          width: '180px',

          height: '180px',

          borderRadius:
            '999px',

          background:
            'rgba(59,130,246,0.18)',

          filter:
            'blur(48px)',

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
        }}
      >

        {/* ==============================
        ICON
        ============================== */}

        {!!insight?.icon && (

          <div
            style={{
              width: '56px',

              height: '56px',

              display: 'flex',

              alignItems: 'center',

              justifyContent:
                'center',

              borderRadius:
                '20px',

              background:
                'rgba(255,255,255,0.08)',

              fontSize: '24px',
            }}
          >
            {insight.icon}
          </div>

        )}

        {/* ==============================
        TITLE
        ============================== */}

        <div
          style={{
            fontSize: '24px',

            lineHeight: 1.3,

            fontWeight: 900,
          }}
        >
          {insight.title}
        </div>

        {/* ==============================
        DESCRIPTION
        ============================== */}

        {!!insight?.description && (

          <p
            style={{
              fontSize: '15px',

              lineHeight: 1.9,

              color:
                'rgba(255,255,255,0.72)',

              whiteSpace:
                'pre-line',
            }}
          >
            {insight.description}
          </p>

        )}

      </div>

    </article>

  )
}