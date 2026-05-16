// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/components/ui/SectionHeading.tsx

/* eslint-disable @next/next/no-img-element */
// @ts-nocheck

/* =========================================
🔥 Types
========================================= */

type Props = {

  eyebrow?: string

  title?: string

  description?: string

  align?: 'left' | 'center'

  action?: React.ReactNode
}

/* =========================================
🔥 Component
========================================= */

export default function
SectionHeading({

  eyebrow = 'semantic runtime',

  title = 'Section Heading',

  description = `
semantic section heading
description
`,

  align = 'left',

  action,

}: Props) {

  /* ======================================
  🔥 Align
  ====================================== */

  const isCenter =

    align === 'center'

  /* ======================================
  🔥 Render
  ====================================== */

  return (

    <div
      style={{
        display: 'flex',

        alignItems:
          isCenter
            ? 'center'
            : 'flex-end',

        justifyContent:
          'space-between',

        gap: '24px',

        flexWrap: 'wrap',

        textAlign:
          isCenter
            ? 'center'
            : 'left',
      }}
    >

      {/* ==================================
      CONTENT
      ================================== */}

      <div
        style={{
          display: 'grid',

          gap: '16px',

          maxWidth: '920px',

          width:
            isCenter
              ? '100%'
              : undefined,

          justifyItems:
            isCenter
              ? 'center'
              : undefined,
        }}
      >

        {/* ==============================
        EYEBROW
        ============================== */}

        {!!eyebrow && (

          <div
            style={{
              display: 'inline-flex',

              alignItems: 'center',

              gap: '10px',

              minHeight: '38px',

              padding:
                '0 16px',

              borderRadius:
                '999px',

              background:
                'rgba(255,255,255,0.06)',

              border:
                '1px solid rgba(255,255,255,0.08)',

              fontSize: '12px',

              fontWeight: 800,

              letterSpacing:
                '0.08em',

              textTransform:
                'uppercase',

              color:
                'rgba(255,255,255,0.78)',
            }}
          >

            <div
              style={{
                width: '8px',

                height: '8px',

                borderRadius:
                  '999px',

                background:
                  '#60a5fa',
              }}
            />

            {eyebrow}

          </div>

        )}

        {/* ==============================
        TITLE
        ============================== */}

        {!!title && (

          <h2
            style={{
              margin: 0,

              fontSize:
                'clamp(34px,5vw,64px)',

              lineHeight: 0.98,

              fontWeight: 900,

              letterSpacing:
                '-0.05em',
            }}
          >
            {title}
          </h2>

        )}

        {/* ==============================
        DESCRIPTION
        ============================== */}

        {!!description && (

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

        )}

      </div>

      {/* ==================================
      ACTION
      ================================== */}

      {!!action && (

        <div
          style={{
            flexShrink: 0,
          }}
        >
          {action}
        </div>

      )}

    </div>

  )
}