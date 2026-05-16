// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/sections/ranking/RelatedAttributeSection.tsx

/* eslint-disable @next/next/no-img-element */
// @ts-nocheck

/* =========================================
🔥 Components
========================================= */

import RelatedAttributeGrid
  from '../../components/grids/RelatedAttributeGrid'

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

  attributes?: any[]
}

/* =========================================
🔥 Section
========================================= */

export default function
RelatedAttributeSection({

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
        LABEL
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
          semantic continuation
        </div>

        {/* ==============================
        TITLE
        ============================== */}

        <SectionHeading>

          関連属性ランキング

        </SectionHeading>

        {/* ==============================
        DESCRIPTION
        ============================== */}

        <SectionDescription>

          semantic ontology runtime
          に基づいて、
          関連性の高い
          attribute ranking を表示しています。

        </SectionDescription>

      </div>

      {/* ==================================
      GRID
      ================================== */}

      <RelatedAttributeGrid

        attributes={attributes}

      />

    </section>

  )
}