// /home/maya/shin-dev/shin-vps/next-bicstation/app/product/[unique_id]/states/ProductEmpty.tsx
import Link
  from 'next/link'

import styles
  from './emptystate.module.css'

export default function ProductEmpty() {

  return (

    <main
      className={
        styles.emptyWrapper
      }
    >

      <section
        className={
          styles.emptyCard
        }
      >

        {/* ==============================
        LABEL
        ============================== */}

        <div
          className={
            styles.emptyLabel
          }
        >
          PRODUCT NOT FOUND
        </div>

        {/* ==============================
        TITLE
        ============================== */}

        <h1
          className={
            styles.emptyTitle
          }
        >
          製品情報が見つかりませんでした
        </h1>

        {/* ==============================
        DESCRIPTION
        ============================== */}

        <p
          className={
            styles.emptyDescription
          }
        >
          URLが変更されたか、
          製品データが削除されている可能性があります。
          他の人気ランキングや
          おすすめ構成も比較できます。
        </p>

        {/* ==============================
        ACTIONS
        ============================== */}

        <div
          className={
            styles.emptyActions
          }
        >

          <Link
            href="/ranking"

            className={
              styles.emptyPrimary
            }
          >
            人気ランキングを見る
          </Link>

          <Link
            href="/pc-finder"

            className={
              styles.emptySecondary
            }
          >
            PC診断を試す
          </Link>

        </div>

      </section>

    </main>

  )
}