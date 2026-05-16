// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/sections/ontology/OntologyDiscoverySection.tsx

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
🔥 Selectors
========================================= */

import {
  selectPopularAttributes,
} from '../../selectors/ontology/selectPopularAttributes'

import {
  selectHighlightedAttributes,
} from '../../selectors/ontology/selectHighlightedAttributes'

/* =========================================
🔥 Types
========================================= */

type Props = {

  runtime?: any
}

/* =========================================
🔥 Section
========================================= */

export default function
OntologyDiscoverySection({

  runtime,

}: Props) {

  /* ======================================
  🔥 Selectors
  ====================================== */

  const popularAttributes =

    selectPopularAttributes(
      runtime
    )

  const highlightedAttributes =

    selectHighlightedAttributes(
      runtime
    )

  /* ======================================
  🔥 Empty
  ====================================== */

  const hasPopular =

    popularAttributes.length > 0

  const hasHighlighted =

    highlightedAttributes.length > 0

  if (
    !hasPopular
    &&
    !hasHighlighted
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

        gap: '72px',
      }}
    >

      {/* ==================================
      POPULAR ATTRIBUTES
      semantic density discovery
      ================================== */}

      {hasPopular && (

        <div>

          <SectionHeading>
            人気の属性ランキング
          </SectionHeading>

          <SectionDescription>

            semantic ontology runtime
            上で特に利用数の多い
            attribute ranking を探索できます。

          </SectionDescription>

          <AttributeGrid

            attributes={
              popularAttributes
            }

          />

        </div>

      )}

      {/* ==================================
      HIGHLIGHT ATTRIBUTES
      semantic spotlight layer
      ================================== */}

      {hasHighlighted && (

        <div>

          <SectionHeading>
            注目属性
          </SectionHeading>

          <SectionDescription>

            AI・NPU・RTX・Creator
            など、
            semantic weight の高い
            attribute runtime を表示しています。

          </SectionDescription>

          <AttributeGrid

            attributes={
              highlightedAttributes
            }

          />

        </div>

      )}

    </section>

  )
}