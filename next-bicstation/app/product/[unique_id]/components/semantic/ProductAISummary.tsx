// ============================================================================
// FILE:
// /home/maya/shin-dev/shin-vps/next-bicstation/app/product/[unique_id]/components/semantic/ProductAISummary.tsx
// ============================================================================

'use client'

/* ============================================================================
🔥 Styles
============================================================================ */

import styles
from './semantic.module.css'

/* ============================================================================
🔥 Props
============================================================================ */

type Props = {

product: any
}

/* ============================================================================
🔥 PARSER
============================================================================ */

function parseSummary(
summary: string
) {

if (!summary) {


return {

  points: [],

  target: '',

  raw: '',
}


}

// ==========================================================================
// Cleanup
// ==========================================================================

const cleaned =


summary

  .replace(
    /\[SUMMARY_DATA\]/g,
    ''
  )

  .replace(
    /\[\/SUMMARY_DATA\]/g,
    ''
  )

  .trim()


// ==========================================================================
// Extract
// ==========================================================================

const pointRegex =


/POINT\d+:(.*?)(?=POINT\d+:|TARGET:|$)/gs


const targetRegex =


/TARGET:(.*)$/s


const points =


Array.from(
  cleaned.matchAll(
    pointRegex
  )
)

  .map(
    (match) =>
      match[1]?.trim()
  )

  .filter(Boolean)


const targetMatch =


cleaned.match(
  targetRegex
)


const target =


targetMatch?.[1]
  ?.trim()
  || ''


// ==========================================================================
// RAW TEXT
// ==========================================================================

const raw =


cleaned

  .replace(
    /POINT\d+:/g,
    ''
  )

  .replace(
    /TARGET:/g,
    ''
  )

  .trim()


// ==========================================================================
// Return
// ==========================================================================

return {


points,

target,

raw,


}

}

/* ============================================================================
🔥 AI CONTENT PARSER
============================================================================ */

function parseAIContent(
aiContent: string
) {

if (!aiContent) {


return []


}

// ==========================================================================
// Split
// ==========================================================================

const blocks =


aiContent

  .split('\n')

  .map(
    (
      line
    ) => line.trim()
  )

  .filter(Boolean)


// ==========================================================================
// Cleanup
// ==========================================================================

return blocks


.filter(
  (
    line
  ) => (

    line.length > 12
  )
)

.slice(0, 8)


}

/* ============================================================================
🔥 COMPONENT
============================================================================ */

export default function ProductAISummary({
product,
}: Props) {

// ==========================================================================
// Runtime
// ==========================================================================

const aiSummary =


product?.ai_summary
|| ''


const aiContent =


product?.ai_content
|| ''


// ==========================================================================
// Empty
// ==========================================================================

if (
!aiSummary
&&
!aiContent
) {


return null


}

// ==========================================================================
// Parse Summary
// ==========================================================================

const {


points,

target,

raw,


} = parseSummary(
aiSummary
)

// ==========================================================================
// Parse AI Content
// ==========================================================================

const contentBlocks =


parseAIContent(
  aiContent
)


// ==========================================================================
// Render
// ==========================================================================

return (


<section
  className={
    styles.aiSummary
  }
>

  {/* ================================================================
  HEADER
  ================================================================ */}

  <div
    className={
      styles.aiSummaryHeader
    }
  >

    <div
      className={
        styles.aiSummaryLabel
      }
    >

      AI INSIGHT

    </div>

    <h2
      className={
        styles.aiSummaryTitle
      }
    >

      AIによる製品分析

    </h2>

  </div>

  {/* ================================================================
  SUMMARY POINTS
  ================================================================ */}

  {
    points.length > 0 && (

      <ul
        className={
          styles.aiSummaryList
        }
      >

        {
          points.map(
            (
              point,
              index
            ) => (

              <li
                key={index}

                className={
                  styles.aiSummaryItem
                }
              >

                {point}

              </li>

            )
          )
        }

      </ul>

    )
  }

  {/* ================================================================
  RAW SUMMARY FALLBACK
  ================================================================ */}

  {
    (
      points.length === 0
      &&
      raw
    ) && (

      <div
        className={
          styles.aiSummaryRaw
        }
      >

        {raw}

      </div>

    )
  }

  {/* ================================================================
  TARGET
  ================================================================ */}

  {
    target && (

      <div
        className={
          styles.aiSummaryTarget
        }
      >

        <span
          className={
            styles.aiSummaryTargetLabel
          }
        >

          おすすめ用途

        </span>

        <span
          className={
            styles.aiSummaryTargetText
          }
        >

          {target}

        </span>

      </div>

    )
  }

  {/* ================================================================
  AI CONTENT
  ================================================================ */}

  {
    contentBlocks.length > 0 && (

      <div
        className={
          styles.aiContentSection
        }
      >

        {/* ==========================================================
        TITLE
        ========================================================== */}

        <div
          className={
            styles.aiContentLabel
          }
        >

          AI RUNTIME ANALYSIS

        </div>

        {/* ==========================================================
        CONTENT
        ========================================================== */}

        <div
          className={
            styles.aiContentGrid
          }
        >

          {
            contentBlocks.map(
              (
                block,
                index
              ) => (

                <div
                  key={index}

                  className={
                    styles.aiContentCard
                  }
                >

                  {block}

                </div>

              )
            )
          }

        </div>

      </div>

    )
  }

</section>


)
}
