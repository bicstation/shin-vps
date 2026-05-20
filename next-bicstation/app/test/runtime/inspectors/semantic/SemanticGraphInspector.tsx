// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/next-bicstation/app/test/runtime/inspectors/semantic/SemanticGraphInspector.tsx
// ============================================================================

'use client'

/* ============================================================================
🔥 Graph Types
============================================================================ */

type SemanticNode = {

id?: string

label?: string

role?: string

semantic_score?: number
}

type SemanticEdge = {

source?: string

target?: string

edge_type?: string

similarity_score?: number

continuity_hint?: string
}

/* ============================================================================
🔥 Props
============================================================================ */

type Props = {

nodes?: SemanticNode[]

edges?: SemanticEdge[]

graphRole?: string
}

/* ============================================================================
🔥 Semantic Graph Inspector
============================================================================ */

export default function SemanticGraphInspector({

nodes = [],

edges = [],

graphRole,

}: Props) {

const hasGraph =


nodes.length > 0
||
edges.length > 0


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
        '-140px',

      right:
        '-140px',

      width:
        '280px',

      height:
        '280px',

      borderRadius:
        '999px',

      background:
        'rgba(14,165,233,.10)',

      filter:
        'blur(90px)',

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
          '32px',
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

        Semantic Topology

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

        Semantic Graph Inspector

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
            '920px',
        }}
      >

        semantic graph ・
        traversal topology ・
        continuation edges ・
        exploration observability

      </div>

    </div>

    {/* ============================================================
    META
    ============================================================ */}

    <div
      style={{

        display:
          'grid',

        gridTemplateColumns:
          'repeat(auto-fit,minmax(240px,1fr))',

        gap:
          '18px',

        marginBottom:
          '30px',
      }}
    >

      <MetaCard
        label="Graph Role"
        value={
          graphRole
          || 'semantic-topology'
        }
      />

      <MetaCard
        label="Nodes"
        value={
          String(
            nodes.length
          )
        }
      />

      <MetaCard
        label="Edges"
        value={
          String(
            edges.length
          )
        }
      />

    </div>

    {/* ============================================================
    EMPTY
    ============================================================ */}

    {
      !hasGraph && (

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

          no semantic graph detected

        </div>

      )
    }

    {/* ============================================================
    GRAPH
    ============================================================ */}

    {
      hasGraph && (

        <div
          style={{

            display:
              'grid',

            gridTemplateColumns:
              '1fr 1fr',

            gap:
              '24px',
          }}
        >

          {/* ======================================================
          NODES
          ====================================================== */}

          <div
            style={{

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

            <SectionTitle
              title="Semantic Nodes"
            />

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
                nodes.map(
                  (
                    node,
                    index
                  ) => (

                    <NodeCard
                      key={index}
                      node={node}
                    />

                  )
                )
              }

            </div>

          </div>

          {/* ======================================================
          EDGES
          ====================================================== */}

          <div
            style={{

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

            <SectionTitle
              title="Traversal Edges"
            />

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
                edges.map(
                  (
                    edge,
                    index
                  ) => (

                    <EdgeCard
                      key={index}
                      edge={edge}
                    />

                  )
                )
              }

            </div>

          </div>

        </div>

      )
    }

  </div>

</section>


)
}

/* ============================================================================
🔥 Section Title
============================================================================ */

function SectionTitle({
title,
}: {
title: string
}) {

return (


<div
  style={{

    color:
      '#ffffff',

    fontSize:
      '18px',

    fontWeight:
      800,

    marginBottom:
      '22px',
  }}
>

  {title}

</div>


)
}

/* ============================================================================
🔥 Meta Card
============================================================================ */

function MetaCard({
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
      '20px',

    borderRadius:
      '20px',

    background:
      'rgba(255,255,255,.03)',

    border:
      '1px solid rgba(255,255,255,.05)',
  }}
>

  <div
    style={{

      color:
        '#94a3b8',

      fontSize:
        '12px',

      marginBottom:
        '10px',

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

      fontSize:
        '18px',

      fontWeight:
        700,
    }}
  >

    {value}

  </div>

</div>


)
}

/* ============================================================================
🔥 Node Card
============================================================================ */

function NodeCard({
node,
}: {
node: SemanticNode
}) {

return (


<div
  style={{

    padding:
      '18px',

    borderRadius:
      '20px',

    background:
      'rgba(14,165,233,.06)',

    border:
      '1px solid rgba(14,165,233,.18)',
  }}
>

  <div
    style={{

      color:
        '#ffffff',

      fontSize:
        '16px',

      fontWeight:
        800,

      marginBottom:
        '10px',
    }}
  >

    {
      node.label
      || 'Unknown Node'
    }

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

    <Pill
      label={
        node.role
        || 'unknown-role'
      }
    />

    <Pill
      label={
        typeof node.semantic_score === 'number'

          ? `score ${node.semantic_score}`

          : 'score unknown'
      }
    />

  </div>

</div>


)
}

/* ============================================================================
🔥 Edge Card
============================================================================ */

function EdgeCard({
edge,
}: {
edge: SemanticEdge
}) {

return (


<div
  style={{

    padding:
      '18px',

    borderRadius:
      '20px',

    background:
      'rgba(168,85,247,.06)',

    border:
      '1px solid rgba(168,85,247,.18)',
  }}
>

  <div
    style={{

      color:
        '#ffffff',

      fontSize:
        '15px',

      fontWeight:
        800,

      lineHeight:
        1.8,

      marginBottom:
        '12px',
    }}
  >

    {
      edge.source
      || 'unknown'
    }

    {' → '}

    {
      edge.target
      || 'unknown'
    }

  </div>

  <div
    style={{

      display:
        'flex',

      flexWrap:
        'wrap',

      gap:
        '10px',

      marginBottom:
        '14px',
    }}
  >

    <Pill
      label={
        edge.edge_type
        || 'unknown-edge'
      }
    />

    <Pill
      label={
        typeof edge.similarity_score === 'number'

          ? `similarity ${edge.similarity_score}`

          : 'similarity unknown'
      }
    />

  </div>

  <div
    style={{

      color:
        '#cbd5e1',

      fontSize:
        '13px',

      lineHeight:
        1.8,
    }}
  >

    {
      edge.continuity_hint
      || 'No continuity hint'
    }

  </div>

</div>


)
}

/* ============================================================================
🔥 Pill
============================================================================ */

function Pill({
label,
}: {
label: string
}) {

return (


<div
  style={{

    padding:
      '8px 12px',

    borderRadius:
      '999px',

    background:
      'rgba(255,255,255,.06)',

    border:
      '1px solid rgba(255,255,255,.08)',

    color:
      '#cbd5e1',

    fontSize:
      '12px',

    fontWeight:
      700,
  }}
>

  {label}

</div>


)
}
