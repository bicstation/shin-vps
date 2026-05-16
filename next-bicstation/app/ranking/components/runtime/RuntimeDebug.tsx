// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/components/runtime/RuntimeDebug.tsx

/* eslint-disable @next/next/no-img-element */
// @ts-nocheck

/* =========================================
🔥 Types
========================================= */

type Props = {

  title?: string

  data?: any
}

/* =========================================
🔥 Component
========================================= */

export default function
RuntimeDebug({

  title = 'Runtime Debug',

  data,

}: Props) {

  return (

    <section
      style={{
        display: 'grid',

        gap: '20px',

        padding:
          '28px',

        borderRadius:
          '32px',

        background:
          'rgba(255,255,255,0.03)',

        border:
          '1px solid rgba(255,255,255,0.08)',
      }}
    >

      {/* ==================================
      HEADER
      ================================== */}

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
              fontSize: '28px',

              lineHeight: 1.1,

              fontWeight: 900,

              margin: 0,
            }}
          >
            {title}
          </h2>

        </div>

        {/* ==============================
        STATUS
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
              'rgba(59,130,246,0.12)',

            border:
              '1px solid rgba(59,130,246,0.20)',

            color:
              '#dbeafe',

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
                '#60a5fa',
            }}
          />

          runtime active

        </div>

      </div>

      {/* ==================================
      JSON
      ================================== */}

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
  data,
  null,
  2
)}
      </pre>

    </section>

  )
}