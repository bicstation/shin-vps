// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/sections/ranking/RankingStatsSection.tsx

/* eslint-disable @next/next/no-img-element */
// @ts-nocheck

/* =========================================
🔥 UI
========================================= */

import SectionHeading
  from '../../components/ui/SectionHeading'

import SectionDescription
  from '../../components/ui/SectionDescription'

/* =========================================
🔥 Types
========================================= */

type StatsItem = {

  label: string

  value: string | number

  description?: string
}

type Props = {

  stats?: StatsItem[]
}

/* =========================================
🔥 Section
========================================= */

export default function
RankingStatsSection({

  stats = [],

}: Props) {

  /* ======================================
  🔥 Empty
  ====================================== */

  if (
    !Array.isArray(stats)
    || !stats.length
  ) {
    return null
  }

  /* ======================================
  🔥 Render
  ====================================== */

  return (

    <section
      style={{
        display: 'grid',

        gap: '28px',
      }}
    >

      {/* ==================================
      HEADER
      ================================== */}

      <div>

        <div
          style={{
            fontSize: '12px',

            fontWeight: 700,

            letterSpacing: '0.12em',

            textTransform:
              'uppercase',

            opacity: 0.45,

            marginBottom: '10px',
          }}
        >
          runtime statistics
        </div>

        <SectionHeading>

          Semantic Runtime Stats

        </SectionHeading>

        <SectionDescription>

          semantic ranking runtime
          から抽出された
          runtime statistics を表示しています。

        </SectionDescription>

      </div>

      {/* ==================================
      GRID
      ================================== */}

      <div
        style={{
          display: 'grid',

          gridTemplateColumns:
            'repeat(auto-fit,minmax(220px,1fr))',

          gap: '18px',
        }}
      >

        {stats.map(
          (
            stat,
            index
          ) => {

            if (
              !stat?.label
            ) {
              return null
            }

            return (

              <article
                key={
                  `${stat.label}-${index}`
                }

                style={{
                  padding: '28px',

                  borderRadius: '28px',

                  background:
                    'rgba(255,255,255,0.04)',

                  border:
                    '1px solid rgba(255,255,255,0.08)',
                }}
              >

                {/* =========================
                LABEL
                ========================= */}

                <div
                  style={{
                    fontSize: '12px',

                    opacity: 0.5,

                    marginBottom: '12px',

                    textTransform:
                      'uppercase',

                    letterSpacing:
                      '0.08em',
                  }}
                >
                  {stat.label}
                </div>

                {/* =========================
                VALUE
                ========================= */}

                <div
                  style={{
                    fontSize: '42px',

                    fontWeight: 900,

                    lineHeight: 1,

                    marginBottom: '16px',
                  }}
                >
                  {stat.value}
                </div>

                {/* =========================
                DESCRIPTION
                ========================= */}

                {!!stat?.description && (

                  <p
                    style={{
                      fontSize: '14px',

                      lineHeight: 1.8,

                      color:
                        'rgba(255,255,255,0.68)',
                    }}
                  >
                    {stat.description}
                  </p>

                )}

              </article>

            )

          }
        )}

      </div>

    </section>

  )
}