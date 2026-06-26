// ============================================================================
// FILE:
// /app/catalog/components/CatalogHero.tsx
// Copyright (c) 2024 Shin Corporation.
// All rights reserved.
// ============================================================================

'use client'

/* ============================================================================
🔥 Types
============================================================================ */

import type {

  CatalogRuntime,

} from '../types/catalog'

/* ============================================================================
🔥 Styles
============================================================================ */

import styles
  from '../styles/catalog.module.css'

/* ============================================================================
🔥 Props
============================================================================ */

type Props = {

  runtime:
    CatalogRuntime

}

/* ============================================================================
🔥 Catalog Hero
============================================================================ */

export default function CatalogHero({

  runtime,

}: Props) {

  return (

    <section
      className={
        styles.catalogHero
      }
    >

      {/* ==========================================================
      LEFT
      ========================================================== */}

      <div
        className={
          styles.catalogHeroContent
        }
      >

        {/* ======================================================
        LABEL
        ====================================================== */}

        <div
          className={
            styles.catalogHeroLabel
          }
        >

          PRODUCT CATALOG

        </div>

        {/* ======================================================
        TITLE
        ====================================================== */}

        <h1
          className={
            styles.catalogHeroTitle
          }
        >

          {

            runtime.presentation?.title

            ||

            runtime.seo?.title

            ||

            runtime.meaning?.identity

            ||

            'PC商品一覧'

          }

        </h1>

        {/* ======================================================
        SUBTITLE
        ====================================================== */}

        {

          runtime.presentation?.subtitle && (

            <h2
              className={
                styles.catalogHeroSubtitle
              }
            >

              {

                runtime.presentation.subtitle

              }

            </h2>

          )

        }

        {/* ======================================================
        DESCRIPTION
        ====================================================== */}

        <p
          className={
            styles.catalogHeroDescription
          }
        >

          {

            runtime.presentation?.description

            ||

            runtime.seo?.description

            ||

            runtime.meaning?.mission

            ||

            '用途・メーカー・価格を問わず、登録されているすべてのPCを一覧で比較できます。'

          }

        </p>

        {/* ======================================================
        SUMMARY
        ====================================================== */}

        <div
          className={
            styles.catalogHeroStats
          }
        >

          <div
            className={
              styles.catalogHeroStat
            }
          >

            <span
              className={
                styles.catalogHeroStatLabel
              }
            >

              総商品数

            </span>

            <strong
              className={
                styles.catalogHeroStatValue
              }
            >

              {

                runtime.count.toLocaleString()

              }

            </strong>

          </div>

          <div
            className={
              styles.catalogHeroStat
            }
          >

            <span
              className={
                styles.catalogHeroStatLabel
              }
            >

              現在のページ

            </span>

            <strong
              className={
                styles.catalogHeroStatValue
              }
            >

              {

                runtime.page

              }

            </strong>

          </div>

          <div
            className={
              styles.catalogHeroStat
            }
          >

            <span
              className={
                styles.catalogHeroStatLabel
              }
            >

              表示件数

            </span>

            <strong
              className={
                styles.catalogHeroStatValue
              }
            >

              {

                runtime.page_size

              }

            </strong>

          </div>

        </div>

      </div>

      {/* ==========================================================
      RIGHT
      ========================================================== */}

      <div
        className={
          styles.catalogHeroVisual
        }
      >

        {/*
          Catalog Hero Image
          CSS Background / Runtime Image
        */}

      </div>

    </section>

  )

}