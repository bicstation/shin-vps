// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/orchestration/SemanticOntologyExplorer.tsx

/* eslint-disable @next/next/no-img-element */
// @ts-nocheck

/* =========================================
🔥 Sections
========================================= */

import OntologyHeroSection
  from '../sections/ontology/OntologyHeroSection'

import OntologyGroupSection
  from '../sections/ontology/OntologyGroupSection'

/* =========================================
🔥 Components
========================================= */

import RuntimeDebug
  from '../components/runtime/RuntimeDebug'

/* =========================================
🔥 Selectors
========================================= */

import {
  selectSemanticGroups,
} from '../selectors/ontology/selectSemanticGroups'

/* =========================================
🔥 Types
========================================= */

type Props = {

  runtime?: any

  error?: string | null
}

/* =========================================
🔥 Orchestration
========================================= */

export default function
SemanticOntologyExplorer({

  runtime,

  error,

}: Props) {

  /* ======================================
  🔥 Groups
  ====================================== */

  const groups =

    selectSemanticGroups(
      runtime
    )

  /* ======================================
  🔥 Empty
  ====================================== */

  const isEmpty =

    !groups.length

  /* ======================================
  🔥 Render
  ====================================== */

  return (

    <main
      style={{
        minHeight: '100vh',

        background:
          '#020617',

        color:
          '#ffffff',
      }}
    >

      {/* ==================================
      DEBUG
      development runtime visibility
      ================================== */}

      <RuntimeDebug

        title={
          'Semantic Ontology Runtime'
        }

        runtime={runtime}

        error={error}

      />

      {/* ==================================
      HERO
      semantic discovery entry
      ================================== */}

      <OntologyHeroSection />

      {/* ==================================
      EMPTY
      ================================== */}

      {isEmpty && (

        <div
          style={{
            maxWidth: '1280px',

            margin: '0 auto',

            padding:
              '0 24px 120px',

            opacity: 0.7,
          }}
        >
          semantic ontology runtime
          is empty.
        </div>

      )}

      {/* ==================================
      GROUPS
      ontology runtime renderer
      ================================== */}

      {!isEmpty && (

        <div
          style={{
            display: 'grid',

            gap: '72px',

            maxWidth: '1440px',

            margin: '0 auto',

            padding:
              '0 24px 120px',
          }}
        >

          {groups.map(
            (
              group
            ) => (

              <OntologyGroupSection

                key={
                  group.key
                }

                groupKey={
                  group.key
                }

                attributes={
                  group.attributes
                }

              />

            )
          )}

        </div>

      )}

    </main>

  )
}