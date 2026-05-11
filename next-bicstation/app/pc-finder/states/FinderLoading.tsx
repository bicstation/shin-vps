// /components/FinderLoading.tsx

'use client'

/* =========================================
🔥 Styles
========================================= */

import styles
  from './FinderLoading.module.css'

/* =========================================
🔥 Finder Loading
========================================= */

export default function
FinderLoading() {

  // ======================================
  // Debug
  // ======================================

  console.log(
    '🔥 FinderLoading'
  )

  // ======================================
  // Render
  // ======================================

  return (

    <section
      className={
        styles.section
      }
    >

      {/* ==================================
      Glow
      ================================== */}

      <div
        className={
          styles.glow
        }
      />

      {/* ==================================
      Content
      ================================== */}

      <div
        className={
          styles.content
        }
      >

        {/* ============================= */}
        {/* Spinner */}
        {/* ============================= */}

        <div
          className={
            styles.spinnerWrap
          }
        >

          <div
            className={
              styles.spinner
            }
          />

        </div>

        {/* ============================= */}
        {/* Label */}
        {/* ============================= */}

        <div
          className={
            styles.label
          }
        >

          SEMANTIC ANALYSIS

        </div>

        {/* ============================= */}
        {/* Title */}
        {/* ============================= */}

        <h2
          className={
            styles.title
          }
        >

          最適なPC構成を分析しています

        </h2>

        {/* ============================= */}
        {/* Description */}
        {/* ============================= */}

        <p
          className={
            styles.description
          }
        >

          workload /
          semantic graph /
          recommendation score
          を解析中です。

        </p>

        {/* ============================= */}
        {/* Progress */}
        {/* ============================= */}

        <div
          className={
            styles.progress
          }
        >

          <div
            className={
              styles.progressBar
            }
          />

        </div>

        {/* ============================= */}
        {/* Status */}
        {/* ============================= */}

        <div
          className={
            styles.statusList
          }
        >

          <div
            className={
              styles.statusItem
            }
          >

            ✓ semantic usage analysis

          </div>

          <div
            className={
              styles.statusItem
            }
          >

            ✓ workload optimization

          </div>

          <div
            className={
              styles.statusItem
            }
          >

            ✓ recommendation scoring

          </div>

        </div>

      </div>

    </section>

  )
}