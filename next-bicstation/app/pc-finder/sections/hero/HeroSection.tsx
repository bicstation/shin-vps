// HeroSection.tsx
'use client'

/* =========================================
🔥 Components
========================================= */

import FinderHero
  from '../../components/FinderHero'

/* =========================================
🔥 Styles
========================================= */

import styles
  from './HeroSection.module.css'

/* =========================================
🔥 Props
========================================= */

type Props = {

  purpose: string

  semanticUsage: string

  semanticDescription: string
}

/* =========================================
🔥 Purpose Label
========================================= */

function getPurposeLabel(
  purpose: string
) {

  switch (
    purpose
  ) {

    case 'gaming':
      return 'Gaming Semantic'

    case 'creator':
      return 'Creator Workflow'

    case 'business':
      return 'Business Productivity'

    case 'ai':
      return 'AI Workload'

    default:
      return 'Semantic Recommendation'
  }
}

/* =========================================
🔥 Hero Section
========================================= */

export default function
HeroSection({

  purpose,

  semanticUsage,

  semanticDescription,

}: Props) {

  // ======================================
  // Label
  // ======================================

  const purposeLabel =

    getPurposeLabel(
      purpose
    )

  // ======================================
  // Debug
  // ======================================

  console.log(
    '🔥 HeroSection',
    {

      purpose,

      semanticUsage,

      semanticDescription,

    }
  )

  // ======================================
  // Render
  // ======================================

  return (

    <section
      className={
        styles.section
      }
    >

      {/* ==================================
      Hero
      ================================== */}

      <FinderHero

        title='AI PC Finder'

        description={`
          semantic recommendation /
          workload analysis /
          budget optimization
          によるPC診断。
        `}

      />

      {/* ==================================
      Semantic Panel
      ================================== */}

      <div
        className={
          styles.semanticPanel
        }
      >

        {/* ============================= */}
        {/* Label */}
        {/* ============================= */}

        <div
          className={
            styles.semanticLabel
          }
        >

          {purposeLabel}

        </div>

        {/* ============================= */}
        {/* Value */}
        {/* ============================= */}

        <div
          className={
            styles.semanticValue
          }
        >

          {semanticUsage}

        </div>

        {/* ============================= */}
        {/* Description */}
        {/* ============================= */}

        <p
          className={
            styles.semanticDescription
          }
        >

          {semanticDescription}

        </p>

      </div>

    </section>

  )
}