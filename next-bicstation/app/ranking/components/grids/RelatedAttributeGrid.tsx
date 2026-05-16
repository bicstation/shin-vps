// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/components/grids/RelatedAttributeGrid.tsx

/* eslint-disable @next/next/no-img-element */
// @ts-nocheck

/* =========================================
🔥 Components
========================================= */

import RelatedAttributeCard
  from '../cards/RelatedAttributeCard'

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
RelatedAttributeGrid({

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
              minmax(300px,1fr)
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

            <RelatedAttributeCard

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