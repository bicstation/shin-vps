// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/components/cards/RelatedAttributeCard.tsx

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
RelatedAttributeCard({

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

        padding: '24px',

        borderRadius: '28px',

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
      GLOW
      ================================== */}

      <div
        style={{
          position: 'absolute',

          top: '-60px',

          right: '-60px',

          width: '140px',

          height: '140px',

          borderRadius:
            '999px',

          background:
            tone.color,

          opacity: 0.08,

          filter:
            'blur(36px)',

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
          NAME
          ============================ */}

          <div
            style={{
              fontSize: '22px',

              lineHeight: 1.25,

              fontWeight: 900,
            }}
          >
            {
              attribute?.name
            }
          </div>

          {/* ============================
          DESCRIPTION
          ============================ */}

          {!!attribute?.description && (

            <div
              style={{
                fontSize: '14px',

                lineHeight: 1.8,

                color:
                  'rgba(255,255,255,0.72)',
              }}
            >
              {
                attribute.description
              }
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

          {!!attribute?.count && (

            <ProductCountBadge
              count={
                attribute.count
              }
            />

          )}

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