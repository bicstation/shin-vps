// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/next-bicstation/app/test/runtime/components/SemanticInspector.tsx
// ============================================================================

'use client'

/* ============================================================================
🔥 Props
============================================================================ */

type Props = {

semanticRuntime?: any

adaptiveRuntime?: any

semanticLabels?: any[]

groupedAttributes?: Record<
string,
any[]

>

workflowTags?: string[]

semanticGraph?: any
}

/* ============================================================================
🔥 Semantic Inspector
============================================================================ */

export default function SemanticInspector({

semanticRuntime,

adaptiveRuntime,

semanticLabels = [],

groupedAttributes = {},

workflowTags = [],

semanticGraph,

}: Props) {

// ==========================================================================
// Flags
// ==========================================================================

const hasSemanticRuntime =


!!semanticRuntime


const hasAdaptiveRuntime =


!!adaptiveRuntime


const hasSemanticGraph =


!!semanticGraph


// ==========================================================================
// Render
// ==========================================================================

return (


<section
  style={{

    position:
      'relative',

    overflow:
      'hidden',

    borderRadius:
      '28px',

    border:
      '1px solid rgba(255,255,255,.06)',

    background:
      `
      linear-gradient(
        180deg,
        rgba(15,23,42,.95),
        rgba(2,6,23,1)
      )
      `,

    padding:
      '30px',
  }}
>

  {/* ================================================================
  GLOW
  ================================================================ */}

  <div
    style={{

      position:
        'absolute',

      top:
        '-120px',

      right:
        '-120px',

      width:
        '260px',

      height:
        '260px',

      borderRadius:
        '999px',

      background:
        'rgba(14,165,233,.10)',

      filter:
        'blur(80px)',

      pointerEvents:
        'none',
    }}
  />

  {/* ================================================================
  CONTENT
  ================================================================ */}

  <div
    style={{

      position:
        'relative',

      zIndex:
        2,
    }}
  >

    {/* ============================================================
    HEADER
    ============================================================ */}

    <div
      style={{

        marginBottom:
          '30px',
      }}
    >

      <div
        style={{

          color:
            '#7dd3fc',

          fontSize:
            '11px',

          fontWeight:
            800,

          letterSpacing:
            '.14em',

          textTransform:
            'uppercase',

          marginBottom:
            '10px',
        }}
      >

        Semantic Observatory

      </div>

      <h2
        style={{

          margin:
            '0 0 14px',

          fontSize:
            '32px',

          lineHeight:
            1.1,

          fontWeight:
            900,
        }}
      >

        Semantic Inspector

      </h2>

      <div
        style={{

          color:
            '#94a3b8',

          fontSize:
            '14px',

          lineHeight:
            1.9,

          maxWidth:
            '880px',
        }}
      >

        semantic runtime ・
        adaptive runtime ・
        grouped attributes ・
        semantic graph observability

      </div>

    </div>

    {/* ============================================================
    FLAGS
    ============================================================ */}

    <div
      style={{

        display:
          'flex',

        flexWrap:
          'wrap',

        gap:
          '14px',

        marginBottom:
          '30px',
      }}
    >

      <RuntimeFlag
        label="Semantic Runtime"
        active={
          hasSemanticRuntime
        }
      />

      <RuntimeFlag
        label="Adaptive Runtime"
        active={
          hasAdaptiveRuntime
        }
      />

      <RuntimeFlag
        label="Semantic Graph"
        active={
          hasSemanticGraph
        }
      />

    </div>

    {/* ============================================================
    GRID
    ============================================================ */}

    <div
      style={{

        display:
          'grid',

        gridTemplateColumns:
          'repeat(auto-fit,minmax(320px,1fr))',

        gap:
          '22px',
      }}
    >

      {/* ==========================================================
      SEMANTIC LABELS
      ========================================================== */}

      <InspectorCard
        title="Semantic Labels"
      >

        {
          semanticLabels.length > 0

            ? (

              <TagGroup
                items={
                  semanticLabels.map(
                    (item) =>

                      typeof item === 'string'
                        ? item
                        : item?.name || 'unknown'
                  )
                }
              />

            )

            : (

              <EmptyState />

            )
        }

      </InspectorCard>

      {/* ==========================================================
      WORKFLOW TAGS
      ========================================================== */}

      <InspectorCard
        title="Workflow Tags"
      >

        {
          workflowTags.length > 0

            ? (

              <TagGroup
                items={workflowTags}
              />

            )

            : (

              <EmptyState />

            )
        }

      </InspectorCard>

      {/* ==========================================================
      GROUPED ATTRIBUTES
      ========================================================== */}

      <InspectorCard
        title="Grouped Attributes"
      >

        {
          Object.keys(
            groupedAttributes
          ).length > 0

            ? (

              <div
                style={{

                  display:
                    'flex',

                  flexDirection:
                    'column',

                  gap:
                    '16px',
                }}
              >

                {
                  Object.entries(
                    groupedAttributes
                  ).map(
                    ([
                      group,
                      items,
                    ]) => (

                      <div
                        key={group}
                      >

                        <div
                          style={{

                            color:
                              '#7dd3fc',

                            fontSize:
                              '12px',

                            fontWeight:
                              700,

                            marginBottom:
                              '10px',

                            textTransform:
                              'uppercase',

                            letterSpacing:
                              '.08em',
                          }}
                        >

                          {group}

                        </div>

                        <TagGroup
                          items={
                            Array.isArray(items)

                              ? items.map(
                                  (item: any) =>

                                    item?.name
                                    || item?.slug
                                    || 'unknown'
                                )

                              : []
                          }
                        />

                      </div>

                    )
                  )
                }

              </div>

            )

            : (

              <EmptyState />

            )
        }

      </InspectorCard>

      {/* ==========================================================
      SEMANTIC GRAPH
      ========================================================== */}

      <InspectorCard
        title="Semantic Graph"
      >

        <pre
          style={{

            margin: 0,

            color:
              '#cbd5e1',

            fontSize:
              '12px',

            lineHeight:
              1.8,

            overflowX:
              'auto',

            whiteSpace:
              'pre-wrap',

            wordBreak:
              'break-word',
          }}
        >

          {
            semanticGraph

              ? JSON.stringify(
                  semanticGraph,
                  null,
                  2
                )

              : 'No semantic graph'
          }

        </pre>

      </InspectorCard>

    </div>

  </div>

</section>


)
}

/* ============================================================================
🔥 Inspector Card
============================================================================ */

function InspectorCard({

title,

children,

}: any) {

return (


<div
  style={{

    padding:
      '22px',

    borderRadius:
      '22px',

    background:
      'rgba(255,255,255,.03)',

    border:
      '1px solid rgba(255,255,255,.05)',
  }}
>

  <div
    style={{

      color:
        '#ffffff',

      fontWeight:
        800,

      marginBottom:
        '18px',

      fontSize:
        '16px',
    }}
  >

    {title}

  </div>

  {children}

</div>


)
}

/* ============================================================================
🔥 Runtime Flag
============================================================================ */

function RuntimeFlag({

label,

active,

}: {

label: string

active: boolean
}) {

return (


<div
  style={{

    display:
      'flex',

    alignItems:
      'center',

    gap:
      '10px',

    padding:
      '12px 16px',

    borderRadius:
      '999px',

    background:

      active

        ? 'rgba(34,197,94,.12)'

        : 'rgba(255,255,255,.03)',

    border:

      active

        ? '1px solid rgba(34,197,94,.32)'

        : '1px solid rgba(255,255,255,.05)',
  }}
>

  <div
    style={{

      width:
        '10px',

      height:
        '10px',

      borderRadius:
        '999px',

      background:

        active
          ? '#22c55e'
          : '#64748b',

      boxShadow:

        active

          ? '0 0 14px rgba(34,197,94,.9)'

          : 'none',
    }}
  />

  <div
    style={{

      color:
        '#ffffff',

      fontSize:
        '13px',

      fontWeight:
        600,
    }}
  >

    {label}

  </div>

</div>


)
}

/* ============================================================================
🔥 Tag Group
============================================================================ */

function TagGroup({
items,
}: {
items: string[]
}) {

return (


<div
  style={{

    display:
      'flex',

    flexWrap:
      'wrap',

    gap:
      '10px',
  }}
>

  {
    items.map(
      (
        item,
        index
      ) => (

        <div
          key={index}

          style={{

            padding:
              '10px 14px',

            borderRadius:
              '999px',

            background:
              'rgba(14,165,233,.10)',

            border:
              '1px solid rgba(14,165,233,.22)',

            color:
              '#7dd3fc',

            fontSize:
              '12px',

            fontWeight:
              700,
          }}
        >

          {item}

        </div>

      )
    )
  }

</div>


)
}

/* ============================================================================
🔥 Empty State
============================================================================ */

function EmptyState() {

return (


<div
  style={{

    color:
      '#64748b',

    fontSize:
      '13px',

    lineHeight:
      1.8,
  }}
>

  no semantic data detected

</div>


)
}
