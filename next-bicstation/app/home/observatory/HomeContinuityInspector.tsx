// /home/maya/shin-vps/next-bicstation/app/home/observatory/HomeContinuityInspector.tsx

type Props = {
runtime?: any
sidebar?: any
ranking?: any
topology?: any
}

/* ============================================================================
🔥 Home Continuity Inspector
============================================================================ */

export default function HomeContinuityInspector({
runtime,
sidebar,
ranking,
topology,
}: Props) {

// ======================================================
// Safe Runtime
// ======================================================

const safeRuntime = {


semantic_runtime:
  runtime?.semantic_runtime,

adaptive_runtime:
  runtime?.adaptive_runtime,

semantic_labels:
  runtime?.semantic_labels,


}

// ======================================================
// Safe Ranking
// ======================================================

const safeRanking = {


productsLength:

  Array.isArray(
    ranking?.products
  )

    ? ranking.products.length

    : 0,


}

// ======================================================
// Safe Sidebar
// ======================================================

const safeSidebar = {


cpu:

  Array.isArray(
    sidebar?.cpu
  )

    ? sidebar.cpu.length

    : 0,

gpu:

  Array.isArray(
    sidebar?.gpu
  )

    ? sidebar.gpu.length

    : 0,

usage:

  Array.isArray(
    sidebar?.usage
  )

    ? sidebar.usage.length

    : 0,


}

// ======================================================
// Safe Topology
// ======================================================

const safeTopology = {


sections:

  Array.isArray(
    topology?.sections
  )

    ? topology.sections.map(
        (section: any) => ({
          type:
            section?.type,

          visible:
            section?.visible,

          priority:
            section?.priority,
        })
      )

    : [],


}

// ======================================================
// Continuity Flags
// ======================================================

const flags = [


{
  label:
    'Runtime Exists',

  status:
    !!runtime,
},

{
  label:
    'Sidebar Exists',

  status:
    !!sidebar,
},

{
  label:
    'Ranking Exists',

  status:
    !!ranking,
},

{
  label:
    'Ranking Has Results',

  status:

    Array.isArray(
      ranking?.products
    )

      ? ranking.products.length > 0

      : false,
},

{
  label:
    'Semantic Runtime',

  status:
    !!runtime?.semantic_runtime,
},

{
  label:
    'Adaptive Runtime',

  status:
    !!runtime?.adaptive_runtime,
},

{
  label:
    'Topology Exists',

  status:
    !!topology,
},


]

// ======================================================
// Debug Payload
// ======================================================

const debugPayload = {


runtime:
  safeRuntime,

sidebar:
  safeSidebar,

ranking:
  safeRanking,

topology:
  safeTopology,


}

// ======================================================
// Render
// ======================================================

return (


<section

  style={{

    background:
      '#020617',

    border:
      '1px solid #1e293b',

    borderRadius:
      '16px',

    padding:
      '24px',

    marginBottom:
      '32px',
  }}

>

  {/* ==================================================
  Title
  ================================================== */}

  <div

    style={{

      fontSize:
        '20px',

      fontWeight:
        700,

      marginBottom:
        '20px',

      color:
        '#e2e8f0',
    }}

  >

    Home Continuity Inspector

  </div>

  {/* ==================================================
  Flags
  ================================================== */}

  <div

    style={{

      display:
        'grid',

      gridTemplateColumns:
        'repeat(auto-fit,minmax(240px,1fr))',

      gap:
        '16px',
    }}

  >

    {

      flags.map(

        (
          flag,
          index
        ) => (

          <div

            key={index}

            style={{

              background:
                '#0f172a',

              border:
                `1px solid ${
                  flag.status
                    ? '#22c55e'
                    : '#ef4444'
                }`,

              borderRadius:
                '12px',

              padding:
                '16px',
            }}

          >

            <div

              style={{

                fontSize:
                  '13px',

                color:
                  '#94a3b8',

                marginBottom:
                  '8px',
              }}

            >

              {flag.label}

            </div>

            <div

              style={{

                fontSize:
                  '16px',

                fontWeight:
                  700,

                color:

                  flag.status
                    ? '#22c55e'
                    : '#ef4444',
              }}

            >

              {

                flag.status
                  ? 'CONNECTED'
                  : 'COLLAPSED'

              }

            </div>

          </div>

        )

      )

    }

  </div>

  {/* ==================================================
  Runtime Summary
  ================================================== */}

  <div

    style={{

      marginTop:
        '32px',

      background:
        '#000',

      borderRadius:
        '12px',

      padding:
        '20px',

      overflow:
        'auto',
    }}

  >

    <pre

      style={{

        color:
          '#22c55e',

        fontSize:
          '12px',

        lineHeight:
          1.7,
      }}

    >

      {

        JSON.stringify(
          debugPayload,
          null,
          2
        )

      }

    </pre>

  </div>

</section>


)

}
