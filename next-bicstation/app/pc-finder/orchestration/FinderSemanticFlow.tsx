// FinderSemanticFlow.tsx
'use client'

/* =========================================
🔥 Sections
========================================= */

import HeroSection
  from '../sections/hero/HeroSection'

import IntentSection
  from '../sections/intent/IntentSection'

import BudgetSection
  from '../sections/budget/BudgetSection'

/* =========================================
🔥 Props
========================================= */

type Props = {

  purpose: string

  budget: number

  semanticUsage: string

  semanticDescription: string

  loading: boolean

  onPurposeChange:
    (value: string) => void

  onBudgetChange:
    (value: number) => void

  onSearch:
    () => void
}

/* =========================================
🔥 Finder Semantic Flow
========================================= */

export default function
FinderSemanticFlow({

  purpose,

  budget,

  semanticUsage,

  semanticDescription,

  loading,

  onPurposeChange,

  onBudgetChange,

  onSearch,

}: Props) {

  // ======================================
  // Debug
  // ======================================

  console.log(
    '\n🔥 ====================================='
  )

  console.log(
    '🔥 FINDER SEMANTIC FLOW'
  )

  console.log({

    purpose,

    budget,

    semanticUsage,

    semanticDescription,

    loading,

  })

  console.log(
    '🔥 =====================================\n'
  )

  // ======================================
  // Render
  // ======================================

  return (

    <>

      {/* ==================================
      HERO
      semantic gateway
      ================================== */}

      <HeroSection

        purpose={
          purpose
        }

        semanticUsage={
          semanticUsage
        }

        semanticDescription={
          semanticDescription
        }

      />

      {/* ==================================
      DISCOVERY LAYOUT
      ================================== */}

      <div
        style={{

          display:
            'grid',

          gridTemplateColumns:
            '320px minmax(0, 1fr)',

          gap:
            '32px',

          alignItems:
            'start',

        }}
      >

        {/* ============================= */}
        {/* SIDEBAR */}
        {/* ============================= */}

        <aside
          style={{

            position:
              'sticky',

            top:
              '100px',

          }}
        >

          {/* ==========================
          INTENT
          ========================== */}

          <IntentSection

            value={
              purpose
            }

            onChange={
              onPurposeChange
            }

          />

          {/* ==========================
          BUDGET
          ========================== */}

          <BudgetSection

            value={
              budget
            }

            onChange={
              onBudgetChange
            }

          />

          {/* ==========================
          SEARCH
          ========================== */}

          <button

            onClick={
              onSearch
            }

            disabled={
              loading
            }

            style={{

              width:
                '100%',

              marginTop:
                '24px',

              padding:
                '18px 20px',

              borderRadius:
                '18px',

              border:
                'none',

              cursor:
                'pointer',

              fontWeight:
                700,

              fontSize:
                '15px',

            }}
          >

            {loading

              ? '診断中...'

              : '👉 semantic診断を開始'

            }

          </button>

        </aside>

        {/* ============================= */}
        {/* RIGHT */}
        {/* ============================= */}

        <section>

          <div
            style={{

              padding:
                '28px',

              borderRadius:
                '24px',

              background:
                'rgba(255,255,255,0.04)',

              border:
                '1px solid rgba(255,255,255,0.08)',

            }}
          >

            <div
              style={{

                fontSize:
                  '12px',

                opacity:
                  0.7,

                marginBottom:
                  '12px',

              }}
            >

              ACTIVE SEMANTIC

            </div>

            <div
              style={{

                fontSize:
                  '22px',

                fontWeight:
                  800,

                marginBottom:
                  '10px',

              }}
            >

              {semanticUsage}

            </div>

            <div
              style={{

                opacity:
                  0.8,

                lineHeight:
                  1.7,

              }}
            >

              {semanticDescription}

            </div>

          </div>

        </section>

      </div>

    </>

  )
}