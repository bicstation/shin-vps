// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/sections/ontology/OntologyGroupSection.tsx

/* eslint-disable @next/next/no-img-element */
// @ts-nocheck

/* =========================================
🔥 Components
========================================= */

import AttributeGrid
  from '../../components/grids/AttributeGrid'

/* =========================================
🔥 UI
========================================= */

import SectionHeading
  from '../../components/ui/SectionHeading'

import SectionDescription
  from '../../components/ui/SectionDescription'

/* =========================================
🔥 Types
========================================= */

type Props = {

  groupKey: string

  attributes: any[]
}

/* =========================================
🔥 Section
========================================= */

export default function
OntologyGroupSection({

  groupKey,

  attributes,

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
  🔥 Count
  ====================================== */

  const totalProducts =

    attributes.reduce(

      (
        total,
        attribute
      ) => (

        total
        + (
          attribute?.count
          || 0
        )

      ),

      0
    )

  /* ======================================
  🔥 Render
  ====================================== */

  return (

    <section
      style={{
        display: 'grid',

        gap: '28px',
      }}
    >

      {/* ==================================
      HEADER
      ================================== */}

      <div>

        {/* ==============================
        GROUP LABEL
        ============================== */}

        <div
          style={{
            fontSize: '12px',

            fontWeight: 700,

            letterSpacing: '0.12em',

            textTransform:
              'uppercase',

            opacity: 0.45,

            marginBottom: '10px',
          }}
        >
          semantic group
        </div>

        {/* ==============================
        TITLE
        ============================== */}

        <SectionHeading>

          {groupKey}

        </SectionHeading>

        {/* ==============================
        DESCRIPTION
        ============================== */}

        <SectionDescription>

          {attributes.length}

          {' '}attributes /{' '}

          {totalProducts}

          {' '}products

        </SectionDescription>

      </div>

      {/* ==================================
      GRID
      ontology runtime renderer
      ================================== */}

      <AttributeGrid

        attributes={attributes}

      />

    </section>

  )
}