// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/next-bicstation/app/test/runtime/components/RuntimeInspector.tsx
// ============================================================================

'use client'

/* ============================================================================
🔥 Props
============================================================================ */

type Props = {

endpoint?: string

runtimeRole?: string

schemaVersion?: string | number

payloadSize?: number

hasSemanticRuntime?: boolean

hasAdaptiveRuntime?: boolean

hasSemanticRelated?: boolean

hasWorkflowTags?: boolean

hasSemanticGraph?: boolean
}

/* ============================================================================
🔥 Runtime Inspector
============================================================================ */

export default function RuntimeInspector({

endpoint,

runtimeRole,

schemaVersion,

payloadSize,

hasSemanticRuntime,

hasAdaptiveRuntime,

hasSemanticRelated,

hasWorkflowTags,

hasSemanticGraph,

}: Props) {

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
        rgba(15,23,42,.94),
        rgba(2,6,23,1)
      )
      `,

    padding:
      '30px',
  }}
>

  {/* ================================================================
  HEADER
  ================================================================ */}

  <div
    style={{

      display:
        'flex',

      justifyContent:
        'space-between',

      alignItems:
        'center',

      gap:
        '20px',

      marginBottom:
        '28px',

      flexWrap:
        'wrap',
    }}
  >

    <div>

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

        Runtime Observatory

      </div>

      <h2
        style={{

          margin: 0,

          fontSize:
            '32px',

          lineHeight:
            1.1,

          fontWeight:
            900,
        }}
      >

        Runtime Inspector

      </h2>

    </div>

    <div
      style={{

        padding:
          '10px 16px',

        borderRadius:
          '999px',

        border:
          '1px solid rgba(14,165,233,.24)',

        background:
          'rgba(14,165,233,.08)',

        color:
          '#7dd3fc',

        fontSize:
          '12px',

        fontWeight:
          700,

        letterSpacing:
          '.08em',

        textTransform:
          'uppercase',
      }}
    >

      semantic runtime observatory

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
    }}
  >

    <InspectorCard
      label="Runtime Role"
      value={
        runtimeRole
        || 'unknown'
      }
    />

    <InspectorCard
      label="Schema Version"
      value={
        String(
          schemaVersion
          || 'unknown'
        )
      }
    />

    <InspectorCard
      label="Payload Size"
      value={
        `${payloadSize || 0} bytes`
      }
    />

    <InspectorCard
      label="Endpoint"
      value={
        endpoint
        || 'unknown'
      }
      multiline
    />

  </div>

  {/* ================================================================
  FLAGS
  ================================================================ */}

  <div
    style={{

      marginTop:
        '32px',

      display:
        'flex',

      flexWrap:
        'wrap',

      gap:
        '14px',
    }}
  >

    <RuntimeFlag
      label="Semantic Runtime"
      active={
        !!hasSemanticRuntime
      }
    />

    <RuntimeFlag
      label="Adaptive Runtime"
      active={
        !!hasAdaptiveRuntime
      }
    />

    <RuntimeFlag
      label="Semantic Related"
      active={
        !!hasSemanticRelated
      }
    />

    <RuntimeFlag
      label="Workflow Tags"
      active={
        !!hasWorkflowTags
      }
    />

    <RuntimeFlag
      label="Semantic Graph"
      active={
        !!hasSemanticGraph
      }
    />

  </div>

</section>


)
}

/* ============================================================================
🔥 Inspector Card
============================================================================ */

function InspectorCard({

label,

value,

multiline,

}: {

label: string

value: string

multiline?: boolean
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

    minHeight:
      multiline
        ? '160px'
        : '120px',
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
        '12px',
    }}
  >

    {label}

  </div>

  <div
    style={{

      color:
        '#ffffff',

      fontSize:
        multiline
          ? '13px'
          : '18px',

      fontWeight:
        700,

      lineHeight:
        1.8,

      wordBreak:
        'break-word',
    }}
  >

    {value}

  </div>

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
