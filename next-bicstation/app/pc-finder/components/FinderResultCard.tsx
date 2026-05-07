/* eslint-disable @next/next/no-img-element */

import Link from 'next/link'

import styles
  from '../styles/pcFinder.module.css'

export default function FinderResultCard({
  product,
}: any) {

  const grouped =
    (
      product?.grouped_attributes &&
      typeof product.grouped_attributes
        === 'object'
    )
      ? product.grouped_attributes
      : {}

  return (
    <Link
      href={`/product/${product.unique_id}`}
      className={styles.card}
    >

      <img
        src={
          product.image_url
          || '/no-image.png'
        }
        alt={product.name}
        className={styles.cardImage}
      />

      <div className={styles.cardBody}>

        <div className={styles.cardPrice}>
          ¥{product.price?.toLocaleString()}
        </div>

        <h3 className={styles.cardTitle}>
          {product.shortTitle || product.name}
        </h3>

        <div className={styles.semanticArea}>

          {Object.entries(grouped)
            .slice(0, 2)
            .map(([_, values]: any) => {

              const safeValues =
                Array.isArray(values)
                  ? values
                  : []

              return safeValues
                .slice(0, 2)
                .map((v: any, i: number) => (

                  <div
                    key={i}
                    className={styles.semanticBadge}
                  >
                    {v?.name || ''}
                  </div>

                ))
            })}

        </div>

      </div>

    </Link>
  )
}