// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/[slug]/sections/RelatedRankingSection.tsx

/* eslint-disable @next/next/no-img-element */
// @ts-nocheck

/* =========================================
🔥 Components
========================================= */

import RelatedAttributeGrid
  from '../../components/grids/RelatedAttributeGrid'

import SectionHeading
  from '../../components/ui/SectionHeading'

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
RelatedRankingSection({

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

        gap: '40px',
      }}
    >

      {/* ==================================
      HEADING
      ================================== */}

      <SectionHeading

        eyebrow="related semantic rankings"

        title="Related Attribute Rankings"

        description={`
現在の semantic attribute と
関連性の高い ranking group を表示しています。
`}

      />

      {/* ==================================
      GRID
      ================================== */}

      <RelatedAttributeGrid
        attributes={attributes}
      />

    </section>

  )
}