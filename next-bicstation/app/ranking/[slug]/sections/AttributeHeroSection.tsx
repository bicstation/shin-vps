// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/[slug]/sections/AttributeHeroSection.tsx

/* eslint-disable @next/next/no-img-element */
// @ts-nocheck

/* =========================================
🔥 Components
========================================= */

import SemanticRoleBadge
  from '../../components/badges/SemanticRoleBadge'

import SemanticWeightBadge
  from '../../components/badges/SemanticWeightBadge'

import ProductCountBadge
  from '../../components/badges/ProductCountBadge'

/* =========================================
🔥 Utils
========================================= */

import {
  getSemanticGradient,
  getSemanticColor,
} from '../../utils/semantic-ui'

/* =========================================
🔥 Types
========================================= */

type Props = {

  metadata?: any
}

/* =========================================
🔥 Component
========================================= */

export default function
AttributeHeroSection({

  metadata,

}: Props) {

  /* ======================================
  🔥 Runtime
  ====================================== */

  const gradient =

    getSemanticGradient(
      metadata?.color
    )

  const glowColor =

    getSemanticColor(
      metadata?.color
    )

  /* ======================================
  🔥 Render
  ====================================== */

  return (

    <section
      style={{
        position: 'relative',

        overflow: 'hidden',

        borderRadius:
          '40px',

        padding:
          '56px',

        background:
          gradient,

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

          width: '320px',

          height: '320px',

          borderRadius:
            '999px',

          background:
            glowColor,

          opacity: 0.16,

          filter:
            'blur(72px)',

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
          semantic attribute ranking
        </div>

        {/* ==============================
        TITLE
        ============================== */}

        <div
          style={{
            display: 'grid',

            gap: '18px',
          }}
        >

          <h1
            style={{
              margin: 0,

              maxWidth: '960px',

              fontSize:
                'clamp(52px,8vw,104px)',

              lineHeight: 0.92,

              fontWeight: 900,

              letterSpacing:
                '-0.05em',
            }}
          >
            {
              metadata?.title
              || metadata?.name
              || 'Semantic Ranking'
            }
          </h1>

          {!!metadata?.description && (

            <p
              style={{
                margin: 0,

                maxWidth: '920px',

                fontSize:
                  'clamp(16px,2vw,22px)',

                lineHeight: 1.9,

                color:
                  'rgba(255,255,255,0.76)',

                whiteSpace:
                  'pre-line',
              }}
            >
              {
                metadata.description
              }
            </p>

          )}

        </div>

        {/* ==============================
        META
        ============================== */}

        <div
          style={{
            display: 'flex',

            flexWrap: 'wrap',

            gap: '12px',
          }}
        >

          <SemanticRoleBadge
            role={
              metadata?.semanticRole
              || metadata?.semantic_role
            }
          />

          <SemanticWeightBadge
            weight={
              metadata?.semanticWeight
              || metadata?.semantic_weight
            }
          />

          <ProductCountBadge
            count={
              metadata?.count
            }
          />

        </div>

        {/* ==============================
        SLUG
        ============================== */}

        {!!metadata?.slug && (

          <div
            style={{
              fontSize: '13px',

              color:
                'rgba(255,255,255,0.48)',

              wordBreak:
                'break-all',
            }}
          >
            /ranking/{metadata.slug}
          </div>

        )}

      </div>

    </section>

  )
}