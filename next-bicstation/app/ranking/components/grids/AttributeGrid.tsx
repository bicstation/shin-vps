// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/components/grids/AttributeGrid.tsx

/* eslint-disable @next/next/no-img-element */
// @ts-nocheck

/* =========================================
🔥 Components
========================================= */

import AttributeCard
  from '../cards/AttributeCard'

/* =========================================
🔥 Types
========================================= */

type Props = {

  attributes?: any[]
}

/* =========================================
🔥 Component
========================================= */

export default function
AttributeGrid({

  attributes = [],

}: Props) {

  /* ======================================
  🔥 Empty
  ====================================== */

  if (
    !Array.isArray(attributes)
    || !attributes.length
  ) {
    return null
  }

  /* ======================================
  🔥 Render
  ====================================== */

  return (

    <div
      style={{
        display: 'grid',

        gridTemplateColumns:
          `
            repeat(
              auto-fill,
              minmax(320px,1fr)
            )
          `,

        gap: '24px',
      }}
    >

      {attributes.map(
        (
          attribute,
          index
        ) => {

          if (
            !attribute?.slug
          ) {
            return null
          }

          return (

            <AttributeCard

              key={
                attribute.slug
                || index
              }

              attribute={
                attribute
              }

            />

          )

        }
      )}

    </div>

  )
}