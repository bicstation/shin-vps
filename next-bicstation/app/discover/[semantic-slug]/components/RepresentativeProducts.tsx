// ============================================================================
// SHIN CORE LINX
// Discover Experience V2
// Representative Products
// ============================================================================

import type {

  DiscoverDetailRuntime,

} from '@/shared/lib/api/django/pc/discover-detail'

import type {

  ExperienceProducts,

} from '../types/experience'

import styles from '../styles/RepresentativeProducts.module.css'

/* ============================================================================
Props
============================================================================ */

interface RepresentativeProductsProps {

  runtime: DiscoverDetailRuntime

  dictionary: ExperienceProducts

}

/* ============================================================================
Representative Products
============================================================================ */

export default function RepresentativeProducts(

  {

    runtime,

    dictionary,

  }: RepresentativeProductsProps

) {

  const products = runtime.data.sample_products ?? []

  return (

    <section className={styles.products}>

      <div className={styles.container}>

        <header className={styles.header}>

          <h2 className={styles.title}>

            {

              dictionary.icon && (

                <span className={styles.icon}>

                  {dictionary.icon}

                </span>

              )

            }

            {dictionary.title}

          </h2>

          <p className={styles.description}>

            {dictionary.description}

          </p>

        </header>

        {

          products.length === 0 ? (

            <div className={styles.empty}>

              現在、代表的な製品は登録されていません。

            </div>

          ) : (

            <ul className={styles.grid}>

              {

                products.map(

                  (

                    product

                  ) => (

                    <li

                      key={product.unique_id}

                      className={styles.item}

                    >

                      <article className={styles.card}>

                        {

                          product.image_url && (

                            <img

                              className={styles.image}

                              src={product.image_url}

                              alt={product.name}

                            />

                          )

                        }

                        <div className={styles.content}>

                          <h3 className={styles.productName}>

                            {product.name}

                          </h3>

                          {

                            product.maker && (

                              <p className={styles.maker}>

                                {product.maker}

                              </p>

                            )

                          }

                          {

                            product.price !== undefined && (

                              <p className={styles.price}>

                                ¥{product.price.toLocaleString()}

                              </p>

                            )

                          }

                        </div>

                      </article>

                    </li>

                  )

                )

              }

            </ul>

          )

        }

      </div>

    </section>

  )

}