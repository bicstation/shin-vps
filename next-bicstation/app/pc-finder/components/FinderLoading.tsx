'use client'

/* =========================================
🔥 Styles
========================================= */

import styles
  from '../styles/pcFinder.module.css'

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
        styles.loading
      }
    >

      {/* ==================================
      Glow
      ================================== */}

      <div
        className={
          styles.loadingGlow
        }
      />

      {/* ==================================
      Spinner Area
      ================================== */}

      <div
        className={
          styles.loadingInner
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
            styles.loadingLabel
          }
        >

          SEMANTIC ANALYSIS

        </div>

        {/* ============================= */}
        {/* Title */}
        {/* ============================= */}

        <h2
          className={
            styles.loadingTitle
          }
        >

          最適なPC構成を解析しています

        </h2>

        {/* ============================= */}
        {/* Description */}
        {/* ============================= */}

        <p
          className={
            styles.loadingText
          }
        >

          workload /
          semantic graph /
          recommendation engine
          を分析中です。

        </p>

        {/* ============================= */}
        {/* Progress */}
        {/* ============================= */}

        <div
          className={
            styles.loadingProgress
          }
        >

          <div
            className={
              styles.loadingProgressBar
            }
          />

        </div>

        {/* ============================= */}
        {/* Status */}
        {/* ============================= */}

        <div
          className={
            styles.loadingStatus
          }
        >

          <div
            className={
              styles.loadingStatusItem
            }
          >

            ✓ semantic usage analysis

          </div>

          <div
            className={
              styles.loadingStatusItem
            }
          >

            ✓ workload optimization

          </div>

          <div
            className={
              styles.loadingStatusItem
            }
          >

            ✓ recommendation scoring

          </div>

        </div>

      </div>

    </section>

  )
}