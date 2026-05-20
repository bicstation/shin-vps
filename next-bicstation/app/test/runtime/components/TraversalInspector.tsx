// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/next-bicstation/app/test/runtime/components/TraversalInspector.tsx
// ============================================================================

'use client'

/* ============================================================================
🔥 Traversal Edge
============================================================================ */

type TraversalEdge = {

unique_id?: string

name?: string

edge_type?: string

workflow_relation?: string

similarity_score?: number

continuity_hint?: string

matched_attributes?: string[]
}

/* ============================================================================
🔥 Props
============================================================================ */

type Props = {

edges?: TraversalEdge[]

runtimeRole?: string
}

/* ============================================================================
🔥 Traversal Inspector
============================================================================ */

export default function TraversalInspector({

edges = [],

runtimeRole,

}: Props) {

// ==========================================================================
// Flags
// ==========================================================================

const hasEdges =


edges.length > 0


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
        'rgba(125,211,252,.10)',

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

        Traversal Observatory

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

        Traversal Inspector

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
            '900px',
        }}
      >

        semantic continuation ・
        workflow continuity ・
        traversal edge observability ・
        exploration runtime inspector

      </div>

    </div>

    {/* ============================================================
    STATUS
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

      <StatusFlag
        label="Traversal Active"
        active={hasEdges}
      />

      <StatusFlag
        label="Continuation Runtime"
        active={
          runtimeRole === 'continuation'
        }
      />

      <StatusFlag
        label="Semantic Edges"
        active={hasEdges}
      />

    </div>

    {/* ============================================================
    EMPTY
    ============================================================ */}

    {
      !hasEdges && (

        <div
          style={{

            padding:
              '28px',

            borderRadius:
              '22px',

            background:
              'rgba(255,255,255,.03)',

            border:
              '1px solid rgba(255,255,255,.05)',

            color:
              '#64748b',

            fontSize:
              '14px',

            lineHeight:
              1.9,
          }}
        >

          no traversal edges detected

        </div>

      )
    }

    {/* ============================================================
    EDGES
    ============================================================ */}

    {
      hasEdges && (

        <div
          style={{

            display:
              'flex',

            flexDirection:
              'column',

            gap:
              '20px',
          }}
        >

          {
            edges.map(
              (
                edge,
                index
              ) => (

                <TraversalCard
                  key={index}
                  edge={edge}
                />

              )
            )
          }

        </div>

      )
    }

  </div>

</section>


)
}

/* ============================================================================
🔥 Traversal Card
============================================================================ */

function TraversalCard({
edge,
}: {
edge: TraversalEdge
}) {

return (


<div
  style={{

    position:
      'relative',

    overflow:
      'hidden',

    padding:
      '24px',

    borderRadius:
      '24px',

    background:
      'rgba(255,255,255,.03)',

    border:
      '1px solid rgba(255,255,255,.05)',
  }}
>

  {/* ================================================================
  TOP
  ================================================================ */}

  <div
    style={{

      display:
        'flex',

      justifyContent:
        'space-between',

      alignItems:
        'flex-start',

      gap:
        '20px',

      marginBottom:
        '20px',

      flexWrap:
        'wrap',
    }}
  >

    {/* ============================================================
    TITLE
    ============================================================ */}

    <div>

      <div
        style={{

          color:
            '#ffffff',

          fontSize:
            '20px',

          fontWeight:
            800,

          marginBottom:
            '10px',

          lineHeight:
            1.4,
        }}
      >

        {
          edge.name
          || 'Unknown Node'
        }

      </div>

      <div
        style={{

          color:
            '#64748b',

          fontSize:
            '13px',

          fontFamily:
            'monospace',
        }}
      >

        {
          edge.unique_id
          || 'unknown-id'
        }

      </div>

    </div>

    {/* ============================================================
    SCORE
    ============================================================ */}

    <div
      style={{

        padding:
          '10px 14px',

        borderRadius:
          '999px',

        background:
          'rgba(14,165,233,.10)',

        border:
          '1px solid rgba(14,165,233,.24)',

        color:
          '#7dd3fc',

        fontSize:
          '13px',

        fontWeight:
          800,
      }}
    >

      similarity

      {' '}

      {
        typeof edge.similarity_score === 'number'

          ? edge.similarity_score.toFixed(2)

          : 'unknown'
      }

    </div>

  </div>

  {/* ================================================================
  GRID
  ================================================================ */}

  <div
    style={{

      display:
        'grid',

      gridTemplateColumns:
        'repeat(auto-fit,minmax(240px,1fr))',

      gap:
        '18px',

      marginBottom:
        '20px',
    }}
  >

    <MiniCard
      label="Edge Type"
      value={
        edge.edge_type
        || 'unknown'
      }
    />

    <MiniCard
      label="Workflow Relation"
      value={
        edge.workflow_relation
        || 'unknown'
      }
    />

  </div>

  {/* ================================================================
  CONTINUITY
  ================================================================ */}

  <div
    style={{

      padding:
        '18px',

      borderRadius:
        '18px',

      background:
        'rgba(255,255,255,.02)',

      border:
        '1px solid rgba(255,255,255,.04)',

      marginBottom:
        '20px',
    }}
  >

    <div
      style={{

        color:
          '#94a3b8',

        fontSize:
          '12px',

        letterSpacing:
          '.08em',

        textTransform:
          'uppercase',

        marginBottom:
          '10px',
      }}
    >

      Continuity Hint

    </div>

    <div
      style={{

        color:
          '#cbd5e1',

        fontSize:
          '14px',

        lineHeight:
          1.9,
      }}
    >

      {
        edge.continuity_hint
        || 'No continuity hint'
      }

    </div>

  </div>

  {/* ================================================================
  ATTRIBUTES
  ================================================================ */}

  {
    Array.isArray(
      edge.matched_attributes
    )

    &&

    edge.matched_attributes.length > 0 && (

      <div>

        <div
          style={{

            color:
              '#94a3b8',

            fontSize:
              '12px',

            letterSpacing:
              '.08em',

            textTransform:
              'uppercase',

            marginBottom:
              '12px',
          }}
        >

          Matched Attributes

        </div>

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
            edge.matched_attributes.map(
              (
                attribute,
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

                  {attribute}

                </div>

              )
            )
          }

        </div>

      </div>

    )
  }

</div>


)
}

/* ============================================================================
🔥 Mini Card
============================================================================ */

function MiniCard({
label,
value,
}: {
label: string
value: string
}) {

return (


<div
  style={{

    padding:
      '16px',

    borderRadius:
      '18px',

    background:
      'rgba(255,255,255,.02)',

    border:
      '1px solid rgba(255,255,255,.04)',
  }}
>

  <div
    style={{

      color:
        '#94a3b8',

      fontSize:
        '12px',

      marginBottom:
        '8px',

      textTransform:
        'uppercase',

      letterSpacing:
        '.08em',
    }}
  >

    {label}

  </div>

  <div
    style={{

      color:
        '#ffffff',

      fontWeight:
        700,

      lineHeight:
        1.7,
    }}
  >

    {value}

  </div>

</div>


)
}

/* ============================================================================
🔥 Status Flag
============================================================================ */

function StatusFlag({
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
