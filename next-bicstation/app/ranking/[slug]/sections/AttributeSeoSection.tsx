// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/[slug]/sections/AttributeSeoSection.tsx

/* eslint-disable @next/next/no-img-element */
// @ts-nocheck

/* =========================================
🔥 Components
========================================= */

import SectionHeading
  from '../../components/ui/SectionHeading'

/* =========================================
🔥 Types
========================================= */

type Props = {

  seo?: {

    title?: string

    description?: string

    canonical?: string

    keywords?: string[]
  }
}

/* =========================================
🔥 Component
========================================= */

export default function
AttributeSeoSection({

  seo,

}: Props) {

  /* ======================================
  🔥 Empty
  ====================================== */

  if (!seo) {
    return null
  }

  /* ======================================
  🔥 Keywords
  ====================================== */

  const keywords =

    Array.isArray(
      seo?.keywords
    )

      ? seo.keywords

      : []

  /* ======================================
  🔥 Render
  ====================================== */

  return (

    <section
      style={{
        display: 'grid',

        gap: '40px',
      }}
    >

      {/* ==================================
      HEADING
      ================================== */}

      <SectionHeading

        eyebrow="seo semantic runtime"

        title="SEO Runtime Metadata"

        description={`
backend semantic runtime から生成された
SEO metadata を表示しています。
`}

      />

      {/* ==================================
      CONTENT
      ================================== */}

      <div
        style={{
          display: 'grid',

          gap: '24px',

          padding:
            '32px',

          borderRadius:
            '32px',

          background:
            'rgba(255,255,255,0.04)',

          border:
            '1px solid rgba(255,255,255,0.08)',
        }}
      >

        {/* ==============================
        TITLE
        ============================== */}

        {!!seo?.title && (

          <div
            style={{
              display: 'grid',

              gap: '10px',
            }}
          >

            <div
              style={{
                fontSize: '12px',

                fontWeight: 800,

                letterSpacing:
                  '0.08em',

                textTransform:
                  'uppercase',

                opacity: 0.5,
              }}
            >
              title
            </div>

            <div
              style={{
                fontSize: '28px',

                lineHeight: 1.3,

                fontWeight: 900,
              }}
            >
              {seo.title}
            </div>

          </div>

        )}

        {/* ==============================
        DESCRIPTION
        ============================== */}

        {!!seo?.description && (

          <div
            style={{
              display: 'grid',

              gap: '10px',
            }}
          >

            <div
              style={{
                fontSize: '12px',

                fontWeight: 800,

                letterSpacing:
                  '0.08em',

                textTransform:
                  'uppercase',

                opacity: 0.5,
              }}
            >
              description
            </div>

            <p
              style={{
                margin: 0,

                fontSize: '15px',

                lineHeight: 1.9,

                color:
                  'rgba(255,255,255,0.72)',
              }}
            >
              {seo.description}
            </p>

          </div>

        )}

        {/* ==============================
        CANONICAL
        ============================== */}

        {!!seo?.canonical && (

          <div
            style={{
              display: 'grid',

              gap: '10px',
            }}
          >

            <div
              style={{
                fontSize: '12px',

                fontWeight: 800,

                letterSpacing:
                  '0.08em',

                textTransform:
                  'uppercase',

                opacity: 0.5,
              }}
            >
              canonical
            </div>

            <div
              style={{
                fontSize: '14px',

                color:
                  '#93c5fd',

                wordBreak:
                  'break-all',
              }}
            >
              {seo.canonical}
            </div>

          </div>

        )}

        {/* ==============================
        KEYWORDS
        ============================== */}

        {!!keywords.length && (

          <div
            style={{
              display: 'grid',

              gap: '14px',
            }}
          >

            <div
              style={{
                fontSize: '12px',

                fontWeight: 800,

                letterSpacing:
                  '0.08em',

                textTransform:
                  'uppercase',

                opacity: 0.5,
              }}
            >
              keywords
            </div>

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
                      keyword
                      || index
                    }

                    style={{
                      minHeight: '36px',

                      display:
                        'inline-flex',

                      alignItems:
                        'center',

                      padding:
                        '0 14px',

                      borderRadius:
                        '999px',

                      background:
                        'rgba(59,130,246,0.14)',

                      border:
                        '1px solid rgba(59,130,246,0.22)',

                      color:
                        '#dbeafe',

                      fontSize: '12px',

                      fontWeight: 700,
                    }}
                  >
                    {keyword}
                  </div>

                )
              )}

            </div>

          </div>

        )}

      </div>

    </section>

  )
}