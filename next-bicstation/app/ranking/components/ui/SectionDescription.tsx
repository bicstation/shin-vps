// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/components/ui/SectionDescription.tsx

/* eslint-disable @next/next/no-img-element */
// @ts-nocheck

/* =========================================
🔥 Types
========================================= */

type Props = {

  label?: string

  title?: string

  description?: string

  align?: 'left' | 'center'
}

/* =========================================
🔥 Component
========================================= */

export default function
SectionDescription({

  label = 'semantic section',

  title = 'Section Title',

  description = `
semantic runtime section
description
`,

  align = 'left',

}: Props) {

  /* ======================================
  🔥 Align
  ====================================== */

  const textAlign =

    align === 'center'
      ? 'center'
      : 'left'

  /* ======================================
  🔥 Render
  ====================================== */

  return (

    <div
      style={{
        display: 'grid',

        gap: '16px',

        textAlign,
      }}
    >

      {/* ==================================
      LABEL
      ================================== */}

      {!!label && (

        <div
          style={{
            display: 'inline-flex',

            alignItems: 'center',

            gap: '10px',

            width:
              align === 'center'
                ? 'fit-content'
                : undefined,

            justifySelf:
              align === 'center'
                ? 'center'
                : undefined,

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

          {label}

        </div>

      )}

      {/* ==================================
      TITLE
      ================================== */}

      {!!title && (

        <h2
          style={{
            margin: 0,

            fontSize:
              'clamp(32px,5vw,56px)',

            lineHeight: 1.02,

            fontWeight: 900,

            letterSpacing:
              '-0.05em',
          }}
        >
          {title}
        </h2>

      )}

      {/* ==================================
      DESCRIPTION
      ================================== */}

      {!!description && (

        <p
          style={{
            margin: 0,

            maxWidth:
              align === 'center'
                ? '920px'
                : '860px',

            justifySelf:
              align === 'center'
                ? 'center'
                : undefined,

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

  )
}