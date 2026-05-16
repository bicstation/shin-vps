// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/components/hero/RankingHero.tsx

/* eslint-disable @next/next/no-img-element */
// @ts-nocheck

/* =========================================
🔥 Badges
========================================= */

import SemanticRoleBadge
  from '../badges/SemanticRoleBadge'

import SemanticWeightBadge
  from '../badges/SemanticWeightBadge'

/* =========================================
🔥 Utils
========================================= */

import {
  formatPrice,
} from '../../utils/formatters'

/* =========================================
🔥 Types
========================================= */

type Props = {

  title?: string

  description?: string

  topProduct?: any
}

/* =========================================
🔥 Component
========================================= */

export default function
RankingHero({

  title = 'Semantic Ranking',

  description = `
semantic runtime に基づく
ranking result を表示しています。
`,

  topProduct,

}: Props) {

  /* ======================================
  🔥 Product
  ====================================== */

  const image =

    topProduct?.image_url
    || topProduct?.thumbnail_url
    || '/images/no-image.jpg'

  /* ======================================
  🔥 Render
  ====================================== */

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

          gap: '40px',
        }}
      >

        {/* ==============================
        HEADER
        ============================== */}

        <div
          style={{
            display: 'grid',

            gap: '24px',
          }}
        >

          {/* ============================
          LABEL
          ============================ */}

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
            semantic ranking runtime
          </div>

          {/* ============================
          TITLE
          ============================ */}

          <h1
            style={{
              maxWidth: '960px',

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

          {/* ============================
          DESCRIPTION
          ============================ */}

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
        TOP PRODUCT
        ============================== */}

        {!!topProduct && (

          <div
            style={{
              display: 'grid',

              gridTemplateColumns:
                `
                  minmax(320px,420px)
                  1fr
                `,

              gap: '32px',

              alignItems: 'center',
            }}
          >

            {/* ==========================
            IMAGE
            ========================== */}

            <div
              style={{
                position: 'relative',

                overflow: 'hidden',

                aspectRatio:
                  '16 / 10',

                borderRadius:
                  '28px',

                background:
                  'rgba(255,255,255,0.06)',

                border:
                  '1px solid rgba(255,255,255,0.08)',
              }}
            >

              <img
                src={image}

                alt={
                  topProduct?.name
                  || 'Top Product'
                }

                style={{
                  width: '100%',

                  height: '100%',

                  objectFit: 'cover',
                }}
              />

            </div>

            {/* ==========================
            CONTENT
            ========================== */}

            <div
              style={{
                display: 'grid',

                gap: '22px',
              }}
            >

              {/* ========================
              RANK
              ======================== */}

              <div
                style={{
                  display: 'inline-flex',

                  alignItems: 'center',

                  width: 'fit-content',

                  minHeight: '42px',

                  padding:
                    '0 18px',

                  borderRadius:
                    '999px',

                  background:
                    'rgba(251,191,36,0.16)',

                  border:
                    '1px solid rgba(251,191,36,0.24)',

                  color:
                    '#fde68a',

                  fontSize: '13px',

                  fontWeight: 900,

                  letterSpacing:
                    '0.08em',
                }}
              >
                🏆 TOP RANKING PRODUCT
              </div>

              {/* ========================
              NAME
              ======================== */}

              <div
                style={{
                  fontSize:
                    'clamp(28px,4vw,48px)',

                  lineHeight: 1.15,

                  fontWeight: 900,
                }}
              >
                {
                  topProduct?.name
                }
              </div>

              {/* ========================
              PRICE
              ======================== */}

              {!!topProduct?.price && (

                <div
                  style={{
                    fontSize:
                      'clamp(32px,5vw,56px)',

                    lineHeight: 1,

                    fontWeight: 900,
                  }}
                >
                  {
                    formatPrice(
                      topProduct.price
                    )
                  }
                </div>

              )}

              {/* ========================
              META
              ======================== */}

              <div
                style={{
                  display: 'flex',

                  flexWrap: 'wrap',

                  gap: '10px',
                }}
              >

                <SemanticRoleBadge
                  role={
                    topProduct
                      ?.semantic_role
                    || 'ranking'
                  }
                />

                <SemanticWeightBadge
                  weight={
                    topProduct
                      ?.semantic_weight
                  }
                />

              </div>

              {/* ========================
              SPECS
              ======================== */}

              <div
                style={{
                  display: 'grid',

                  gap: '10px',
                }}
              >

                {!!topProduct?.cpu && (

                  <div
                    style={{
                      fontSize: '15px',

                      color:
                        'rgba(255,255,255,0.72)',
                    }}
                  >
                    CPU · {topProduct.cpu}
                  </div>

                )}

                {!!topProduct?.gpu && (

                  <div
                    style={{
                      fontSize: '15px',

                      color:
                        'rgba(255,255,255,0.72)',
                    }}
                  >
                    GPU · {topProduct.gpu}
                  </div>

                )}

                {!!topProduct?.memory && (

                  <div
                    style={{
                      fontSize: '15px',

                      color:
                        'rgba(255,255,255,0.72)',
                    }}
                  >
                    MEMORY · {topProduct.memory}
                  </div>

                )}

                {!!topProduct?.storage && (

                  <div
                    style={{
                      fontSize: '15px',

                      color:
                        'rgba(255,255,255,0.72)',
                    }}
                  >
                    STORAGE · {topProduct.storage}
                  </div>

                )}

              </div>

            </div>

          </div>

        )}

      </div>

    </div>

  )
}