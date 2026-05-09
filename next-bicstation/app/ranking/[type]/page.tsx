// /home/maya/shin-dev/shin-vps/next-bicstation/app/ranking/[type]/page.tsx

/* eslint-disable @next/next/no-img-element */
// @ts-nocheck

import Link
  from 'next/link'

import styles
  from './page.module.css'

/* =========================================
🔥 API
========================================= */

import {
  fetchRankingByType,
} from '@/shared/lib/api/django/pc'

/* =========================================
🔥 Dynamic
========================================= */

export const dynamic =
  'force-dynamic'

/* =========================================
🔥 Props
========================================= */

type Props = {

  params: {
    type: string
  }
}

/* =========================================
🔥 PAGE
========================================= */

export default async function
RankingTypePage({
  params,
}: Props) {

  // ======================================
  // Type
  // ======================================

  const type =

    params?.type
    || ''

  // ======================================
  // Fetch
  // ======================================

  const response =

    await fetchRankingByType(
      type
    )

  // ======================================
  // Products
  // ======================================

  const products =

    Array.isArray(
      response?.results
    )

      ? response.results

      : []

  // ======================================
  // Debug
  // ======================================

  console.log(
    '\n🔥 ====================================='
  )

  console.log(
    '🔥 RANKING TYPE:',
    type
  )

  console.log(
    JSON.stringify(
      response,
      null,
      2
    )
  )

  console.log(
    '🔥 =====================================\n'
  )

  // ======================================
  // Render
  // ======================================

  return (

    <main
      className={
        styles.page
      }
    >

      <div
        className={
          styles.container
        }
      >

        {/* ================================= */}
        {/* TITLE */}
        {/* ================================= */}

        <h1>
          {type}
          ランキング
        </h1>

        {/* ================================= */}
        {/* EMPTY */}
        {/* ================================= */}

        {!products.length && (

          <div>

            データがありません

          </div>

        )}

        {/* ================================= */}
        {/* PRODUCTS */}
        {/* ================================= */}

        <ul
          style={{
            display: 'grid',
            gap: '20px',
            padding: 0,
            listStyle: 'none',
            marginTop: '32px',
          }}
        >

          {products.map(product => (

            <li
              key={
                product.unique_id
              }

              style={{
                border:
                  '1px solid rgba(255,255,255,0.08)',
                borderRadius:
                  '16px',
                padding:
                  '18px',
                background:
                  'rgba(255,255,255,0.03)',
              }}
            >

              {/* ========================= */}
              {/* IMAGE */}
              {/* ========================= */}

              {product.image_url && (

                <img
                  src={
                    product.image_url
                  }

                  alt={
                    product.name
                  }

                  style={{
                    width: '100%',
                    maxWidth: '280px',
                    borderRadius: '12px',
                  }}
                />

              )}

              {/* ========================= */}
              {/* NAME */}
              {/* ========================= */}

              <h2
                style={{
                  marginTop: '16px',
                  fontSize: '18px',
                  lineHeight: 1.5,
                }}
              >
                {product.name}
              </h2>

              {/* ========================= */}
              {/* PRICE */}
              {/* ========================= */}

              {product.price && (

                <p
                  style={{
                    marginTop: '12px',
                    fontSize: '18px',
                    fontWeight: 700,
                  }}
                >
                  ¥
                  {Number(
                    product.price
                  ).toLocaleString()}
                </p>

              )}

              {/* ========================= */}
              {/* MAKER */}
              {/* ========================= */}

              {product.maker && (

                <p
                  style={{
                    marginTop: '8px',
                    opacity: 0.8,
                  }}
                >
                  メーカー:
                  {' '}
                  {product.maker}
                </p>

              )}

              {/* ========================= */}
              {/* DETAIL */}
              {/* ========================= */}

              <Link
                href={
                  `/products/${
                    product.unique_id
                  }`
                }

                style={{
                  display: 'inline-block',
                  marginTop: '14px',
                  textDecoration:
                    'none',
                  fontWeight: 700,
                }}
              >
                詳細を見る →
              </Link>

            </li>

          ))}

        </ul>

      </div>

    </main>
  )
}