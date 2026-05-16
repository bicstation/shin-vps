// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/components/runtime/RuntimeJsonViewer.tsx

/* eslint-disable @next/next/no-img-element */
// @ts-nocheck

/* =========================================
🔥 Types
========================================= */

type Props = {

  title?: string

  runtime?: any

  collapsed?: boolean
}

/* =========================================
🔥 Component
========================================= */

export default function
RuntimeJsonViewer({

  title = 'Raw Runtime JSON',

  runtime,

  collapsed = false,

}: Props) {

  return (

    <details
      open={!collapsed}

      style={{
        overflow: 'hidden',

        borderRadius:
          '32px',

        background:
          'rgba(255,255,255,0.03)',

        border:
          '1px solid rgba(255,255,255,0.08)',
      }}
    >

      {/* ==================================
      SUMMARY
      ================================== */}

      <summary
        style={{
          cursor: 'pointer',

          listStyle: 'none',

          padding:
            '28px',

          borderBottom:
            '1px solid rgba(255,255,255,0.06)',

          userSelect:
            'none',
        }}
      >

        <div
          style={{
            display: 'flex',

            alignItems: 'center',

            justifyContent:
              'space-between',

            gap: '20px',

            flexWrap: 'wrap',
          }}
        >

          {/* ==============================
          TITLE
          ============================== */}

          <div
            style={{
              display: 'grid',

              gap: '8px',
            }}
          >

            <div
              style={{
                fontSize: '12px',

                fontWeight: 800,

                letterSpacing:
                  '0.08em',

                textTransform:
                  'uppercase',

                opacity: 0.5,
              }}
            >
              semantic runtime
            </div>

            <h2
              style={{
                margin: 0,

                fontSize: '28px',

                lineHeight: 1.1,

                fontWeight: 900,
              }}
            >
              {title}
            </h2>

          </div>

          {/* ==============================
          BADGE
          ============================== */}

          <div
            style={{
              display: 'inline-flex',

              alignItems: 'center',

              gap: '10px',

              minHeight: '40px',

              padding:
                '0 16px',

              borderRadius:
                '999px',

              background:
                'rgba(168,85,247,0.16)',

              border:
                '1px solid rgba(168,85,247,0.24)',

              color:
                '#e9d5ff',

              fontSize: '12px',

              fontWeight: 800,

              letterSpacing:
                '0.08em',

              textTransform:
                'uppercase',
            }}
          >

            <div
              style={{
                width: '8px',

                height: '8px',

                borderRadius:
                  '999px',

                background:
                  '#c084fc',
              }}
            />

            json viewer

          </div>

        </div>

      </summary>

      {/* ==================================
      JSON
      ================================== */}

      <div
        style={{
          padding:
            '28px',
        }}
      >

        <pre
          style={{
            margin: 0,

            padding:
              '24px',

            overflow: 'auto',

            borderRadius:
              '24px',

            background:
              'rgba(0,0,0,0.32)',

            border:
              '1px solid rgba(255,255,255,0.06)',

            color:
              '#dbeafe',

            fontSize: '12px',

            lineHeight: 1.8,

            whiteSpace:
              'pre-wrap',

            overflowWrap:
              'break-word',
          }}
        >
{JSON.stringify(
  runtime,
  null,
  2
)}
        </pre>

      </div>

    </details>

  )
}