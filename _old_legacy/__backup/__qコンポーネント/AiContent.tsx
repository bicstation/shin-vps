'use client'

import ReactMarkdown
  from 'react-markdown'

import styles
  from './AiContent.module.css'

/* =========================================
🔥 Types
========================================= */

type Props = {
  content?: string
}

/* =========================================
🔥 Component
========================================= */

export default function AiContent({
  content,
}: Props) {

  // --------------------------------
  // Empty
  // --------------------------------
  if (!content) {
    return null
  }

  return (
    <section
      className={
        styles.section
      }
    >

      {/* ========================= */}
      {/* Header */}
      {/* ========================= */}

      <div
        className={
          styles.header
        }
      >

        <div
          className={
            styles.label
          }
        >
          AI Semantic Analysis
        </div>

        <h2
          className={
            styles.title
          }
        >
          詳細AI分析
        </h2>

        <p
          className={
            styles.description
          }
        >
          semantic workload /
          recommendation reasoning /
          performance balance
          を含む詳細分析。
        </p>

      </div>

      {/* ========================= */}
      {/* Content Surface */}
      {/* ========================= */}

      <div
        className={
          styles.surface
        }
      >

        {/* glow */}
        <div
          className={
            styles.glow
          }
        />

        {/* markdown */}
        <div
          className={
            styles.aiContent
          }
        >

          <ReactMarkdown>

            {content}

          </ReactMarkdown>

        </div>

      </div>

      {/* ========================= */}
      {/* Footer note */}
      {/* ========================= */}

      <div
        className={
          styles.footer
        }
      >

        <div
          className={
            styles.footerTitle
          }
        >
          AI Recommendation Framework
        </div>

        <div
          className={
            styles.footerText
          }
        >
          semantic similarity /
          workload analysis /
          recommendation balance /
          price-performance analysis
          を元にAI解析を実施。
        </div>

      </div>

    </section>
  )
}
