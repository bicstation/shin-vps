// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/sections/ranking/RankingHeroSection.tsx

/* eslint-disable @next/next/no-img-element */
// @ts-nocheck

/* =========================================
🔥 Components
========================================= */

import RankingHero
  from '../../components/hero/RankingHero'

/* =========================================
🔥 Types
========================================= */

type Props = {

  slug?: string

  semantic?: any

  products?: any[]
}

/* =========================================
🔥 Section
========================================= */

export default function
RankingHeroSection({

  slug,

  semantic,

  products = [],

}: Props) {

  /* ======================================
  🔥 Top Product
  ====================================== */

  const topProduct =

    products?.[0]
    || null

  /* ======================================
  🔥 Semantic
  ====================================== */

  const title =

    semantic?.title
    || semantic?.name
    || slug
    || 'Semantic Ranking'

  const description =

    semantic?.description
    || `
      semantic runtime に基づく
      attribute ranking を表示しています。
    `

  /* ======================================
  🔥 Count
  ====================================== */

  const productCount =

    Array.isArray(products)
      ? products.length
      : 0

  /* ======================================
  🔥 Render
  ====================================== */

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
              transparent 34%
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
          semantic ranking runtime
        </div>

        {/* ==============================
        HERO
        ============================== */}

        <RankingHero

          title={title}

          description={description}

          topProduct={topProduct}

        />

        {/* ==============================
        META GRID
        ============================== */}

        <div
          style={{
            display: 'grid',

            gridTemplateColumns:
              'repeat(auto-fit,minmax(220px,1fr))',

            gap: '18px',

            marginTop: '48px',
          }}
        >

          {/* ==========================
          PRODUCT COUNT
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
              products
            </div>

            <div
              style={{
                fontSize: '34px',

                fontWeight: 900,

                lineHeight: 1,
              }}
            >
              {productCount}
            </div>

          </div>

          {/* ==========================
          ROLE
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
              semantic role
            </div>

            <div
              style={{
                fontSize: '18px',

                fontWeight: 800,

                lineHeight: 1.5,
              }}
            >
              {
                semantic?.semantic_role
                || 'ranking'
              }
            </div>

          </div>

          {/* ==========================
          WEIGHT
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
              semantic weight
            </div>

            <div
              style={{
                fontSize: '18px',

                fontWeight: 800,

                lineHeight: 1.5,
              }}
            >
              {
                semantic?.semantic_weight
                || '-'
              }
            </div>

          </div>

        </div>

      </div>

    </section>

  )
}