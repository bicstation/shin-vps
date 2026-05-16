// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/components/cards/AttributeCard.tsx

/* eslint-disable @next/next/no-img-element */
// @ts-nocheck

import Link
  from 'next/link'

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
  getAttributeTone,
} from '../../utils/semantic-ui'

/* =========================================
🔥 Types
========================================= */

type Props = {

  attribute?: any
}

/* =========================================
🔥 Component
========================================= */

export default function
AttributeCard({

  attribute,

}: Props) {

  /* ======================================
  🔥 Empty
  ====================================== */

  if (
    !attribute
    || !attribute?.slug
  ) {
    return null
  }

  /* ======================================
  🔥 Runtime
  ====================================== */

  const href =

    attribute?.href
    || `/ranking/${attribute.slug}`

  const tone =

    getAttributeTone(
      attribute
    )

  /* ======================================
  🔥 Render
  ====================================== */

  return (

    <Link
      href={href}

      style={{
        position: 'relative',

        overflow: 'hidden',

        display: 'block',

        padding: '28px',

        borderRadius: '32px',

        background:
          tone.gradient,

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
      BACKGROUND GLOW
      ================================== */}

      <div
        style={{
          position: 'absolute',

          top: '-80px',

          right: '-80px',

          width: '180px',

          height: '180px',

          borderRadius: '999px',

          background:
            tone.color,

          opacity: 0.08,

          filter:
            'blur(40px)',

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

          display: 'grid',

          gap: '22px',
        }}
      >

        {/* ==============================
        HEADER
        ============================== */}

        <div
          style={{
            display: 'grid',

            gap: '12px',
          }}
        >

          {/* ============================
          ICON
          ============================ */}

          {!!attribute?.icon && (

            <div
              style={{
                fontSize: '13px',

                fontWeight: 700,

                letterSpacing: '0.08em',

                textTransform:
                  'uppercase',

                opacity: 0.55,
              }}
            >
              {attribute.icon}
            </div>

          )}

          {/* ============================
          NAME
          ============================ */}

          <div
            style={{
              fontSize: '28px',

              lineHeight: 1.15,

              fontWeight: 900,
            }}
          >
            {attribute?.name}
          </div>

          {/* ============================
          SLUG
          ============================ */}

          <div
            style={{
              fontSize: '13px',

              color:
                'rgba(255,255,255,0.48)',

              wordBreak:
                'break-all',
            }}
          >
            {attribute?.slug}
          </div>

        </div>

        {/* ==============================
        DESCRIPTION
        ============================== */}

        {!!attribute?.description && (

          <p
            style={{
              fontSize: '14px',

              lineHeight: 1.9,

              color:
                'rgba(255,255,255,0.72)',
            }}
          >
            {attribute.description}
          </p>

        )}

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

          <ProductCountBadge
            count={
              attribute?.count
            }
          />

          <SemanticRoleBadge
            role={
              attribute?.semantic_role
            }
          />

          <SemanticWeightBadge
            weight={
              attribute?.semantic_weight
            }
          />

        </div>

      </div>

    </Link>

  )
}