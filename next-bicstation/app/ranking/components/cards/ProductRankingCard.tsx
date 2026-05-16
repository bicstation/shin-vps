// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/components/cards/ProductRankingCard.tsx

/* eslint-disable @next/next/no-img-element */
// @ts-nocheck

/* =========================================
🔥 Badges
========================================= */

import ProductCountBadge
  from '../badges/ProductCountBadge'

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

import {
  getRankLabel,
  getPriceTone,
} from '../../utils/ranking-ui'

/* =========================================
🔥 Types
========================================= */

type Props = {

  product?: any

  index?: number
}

/* =========================================
🔥 Component
========================================= */

export default function
ProductRankingCard({

  product,

  index = 0,

}: Props) {

  /* ======================================
  🔥 Empty
  ====================================== */

  if (
    !product
    || !product?.unique_id
  ) {
    return null
  }

  /* ======================================
  🔥 Runtime
  ====================================== */

  const image =

    product?.image_url
    || product?.thumbnail_url
    || '/images/no-image.jpg'

  const href =

    product?.affiliate_url
    || product?.url
    || '#'

  const priceTone =

    getPriceTone(
      product?.price
    )

  const rankLabel =

    getRankLabel(
      index
    )

  /* ======================================
  🔥 Price Tone Color
  ====================================== */

  const priceToneColor =

    (() => {

      switch (priceTone) {

        case 'ultra-premium':
          return '#f472b6'

        case 'premium':
          return '#fb923c'

        case 'mid-range':
          return '#60a5fa'

        default:
          return '#4ade80'
      }

    })()

  /* ======================================
  🔥 Render
  ====================================== */

  return (

    <a
      href={href}

      target="_blank"

      rel="noopener noreferrer"

      style={{
        position: 'relative',

        overflow: 'hidden',

        display: 'flex',

        flexDirection: 'column',

        gap: '20px',

        padding: '24px',

        borderRadius: '32px',

        background:
          'rgba(255,255,255,0.04)',

        border:
          '1px solid rgba(255,255,255,0.08)',

        textDecoration:
          'none',

        color:
          '#ffffff',

        transition:
          'transform 0.2s ease, border-color 0.2s ease',
      }}
    >

      {/* ==================================
      RANK BADGE
      ================================== */}

      <div
        style={{
          position: 'absolute',

          top: '18px',

          right: '18px',

          zIndex: 2,

          padding:
            '8px 12px',

          borderRadius:
            '999px',

          background:
            'rgba(15,23,42,0.88)',

          border:
            '1px solid rgba(255,255,255,0.08)',

          fontSize: '12px',

          fontWeight: 900,
        }}
      >
        {rankLabel}
      </div>

      {/* ==================================
      IMAGE
      ================================== */}

      <div
        style={{
          position: 'relative',

          overflow: 'hidden',

          aspectRatio:
            '16 / 10',

          borderRadius: '22px',

          background:
            'rgba(255,255,255,0.04)',
        }}
      >

        <img
          src={image}

          alt={
            product?.name
            || 'PC Product'
          }

          style={{
            width: '100%',

            height: '100%',

            objectFit: 'cover',
          }}
        />

      </div>

      {/* ==================================
      CONTENT
      ================================== */}

      <div
        style={{
          display: 'grid',

          gap: '18px',
        }}
      >

        {/* ==============================
        HEADER
        ============================== */}

        <div
          style={{
            display: 'grid',

            gap: '10px',
          }}
        >

          {/* ============================
          MAKER
          ============================ */}

          {!!product?.maker && (

            <div
              style={{
                fontSize: '12px',

                fontWeight: 700,

                letterSpacing: '0.08em',

                textTransform:
                  'uppercase',

                opacity: 0.5,
              }}
            >
              {product.maker}
            </div>

          )}

          {/* ============================
          NAME
          ============================ */}

          <div
            style={{
              fontSize: '24px',

              lineHeight: 1.35,

              fontWeight: 900,
            }}
          >
            {product?.name}
          </div>

        </div>

        {/* ==============================
        PRICE
        ============================== */}

        <div
          style={{
            display: 'flex',

            alignItems: 'center',

            gap: '12px',
          }}
        >

          <div
            style={{
              width: '10px',

              height: '10px',

              borderRadius:
                '999px',

              background:
                priceToneColor,
            }}
          />

          <div
            style={{
              fontSize: '30px',

              lineHeight: 1,

              fontWeight: 900,
            }}
          >
            {formatPrice(
              product?.price
            )}
          </div>

        </div>

        {/* ==============================
        SPECS
        ============================== */}

        <div
          style={{
            display: 'grid',

            gap: '10px',
          }}
        >

          {!!product?.cpu && (

            <div
              style={{
                fontSize: '14px',

                color:
                  'rgba(255,255,255,0.72)',
              }}
            >
              CPU · {product.cpu}
            </div>

          )}

          {!!product?.gpu && (

            <div
              style={{
                fontSize: '14px',

                color:
                  'rgba(255,255,255,0.72)',
              }}
            >
              GPU · {product.gpu}
            </div>

          )}

          {!!product?.memory && (

            <div
              style={{
                fontSize: '14px',

                color:
                  'rgba(255,255,255,0.72)',
              }}
            >
              MEMORY · {product.memory}
            </div>

          )}

          {!!product?.storage && (

            <div
              style={{
                fontSize: '14px',

                color:
                  'rgba(255,255,255,0.72)',
              }}
            >
              STORAGE · {product.storage}
            </div>

          )}

        </div>

        {/* ==============================
        META
        ============================== */}

        <div
          style={{
            display: 'flex',

            flexWrap: 'wrap',

            gap: '10px',
          }}
        >

          {!!product?.score && (

            <ProductCountBadge

              count={
                Math.round(
                  product.score
                )
              }

              label="score"

            />

          )}

          <SemanticRoleBadge
            role={
              product?.semantic_role
              || 'ranking'
            }
          />

          <SemanticWeightBadge
            weight={
              product?.semantic_weight
            }
          />

        </div>

      </div>

    </a>

  )
}