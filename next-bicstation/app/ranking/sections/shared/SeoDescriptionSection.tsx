// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/sections/shared/SeoDescriptionSection.tsx

/* eslint-disable @next/next/no-img-element */
// @ts-nocheck

/* =========================================
🔥 Types
========================================= */

type Props = {

  title?: string

  description?: string

  keywords?: string[]
}

/* =========================================
🔥 Section
========================================= */

export default function
SeoDescriptionSection({

  title,

  description,

  keywords = [],

}: Props) {

  /* ======================================
  🔥 Empty
  ====================================== */

  if (
    !title
    &&
    !description
    &&
    !keywords.length
  ) {
    return null
  }

  /* ======================================
  🔥 Render
  ====================================== */

  return (

    <section
      style={{
        padding:
          '0 24px 120px',
      }}
    >

      <div
        style={{
          maxWidth: '1280px',

          margin: '0 auto',

          padding: '40px',

          borderRadius: '32px',

          background:
            'rgba(255,255,255,0.04)',

          border:
            '1px solid rgba(255,255,255,0.08)',
        }}
      >

        {/* ==================================
        LABEL
        ================================== */}

        <div
          style={{
            fontSize: '12px',

            fontWeight: 700,

            letterSpacing: '0.12em',

            textTransform:
              'uppercase',

            opacity: 0.45,

            marginBottom: '14px',
          }}
        >
          semantic seo runtime
        </div>

        {/* ==================================
        TITLE
        ================================== */}

        {!!title && (

          <h2
            style={{
              fontSize:
                'clamp(28px,4vw,42px)',

              lineHeight: 1.2,

              fontWeight: 900,

              marginBottom: '22px',
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
              maxWidth: '920px',

              fontSize: '16px',

              lineHeight: 1.95,

              color:
                'rgba(255,255,255,0.72)',

              marginBottom:
                keywords.length
                  ? '32px'
                  : 0,
            }}
          >
            {description}
          </p>

        )}

        {/* ==================================
        KEYWORDS
        ================================== */}

        {!!keywords.length && (

          <div
            style={{
              display: 'flex',

              flexWrap: 'wrap',

              gap: '10px',
            }}
          >

            {keywords.map(
              (
                keyword,
                index
              ) => (

                <div
                  key={
                    `${keyword}-${index}`
                  }

                  style={{
                    padding:
                      '8px 14px',

                    borderRadius:
                      '999px',

                    background:
                      'rgba(59,130,246,0.14)',

                    fontSize: '13px',

                    fontWeight: 700,
                  }}
                >
                  {keyword}
                </div>

              )
            )}

          </div>

        )}

      </div>

    </section>

  )
}