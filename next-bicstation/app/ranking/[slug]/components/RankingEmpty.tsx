// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/[type]/components/RankingEmpty.tsx

/* eslint-disable @next/next/no-img-element */
// @ts-nocheck

import Link
  from 'next/link'

import styles
  from './RankingEmpty.module.css'

/* =========================================
🔥 Component
========================================= */

export default function
RankingEmpty() {

  return (

    <section
      className={
        styles.empty
      }
    >

      {/* ==================================
      ICON
      ================================== */}

      <div
        className={
          styles.icon
        }
      >
        ⚠️
      </div>

      {/* ==================================
      TITLE
      ================================== */}

      <h2
        className={
          styles.title
        }
      >
        データが見つかりません
      </h2>

      {/* ==================================
      DESCRIPTION
      ================================== */}

      <p
        className={
          styles.description
        }
      >
        semantic ranking data を取得できませんでした。
        別カテゴリやランキングをお試しください。
      </p>

      {/* ==================================
      ACTION
      ================================== */}

      <Link
        href="/ranking"

        className={
          styles.button
        }
      >
        ランキング一覧へ戻る
      </Link>

    </section>

  )
}