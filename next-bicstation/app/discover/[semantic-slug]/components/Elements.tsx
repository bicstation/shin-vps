// ============================================================================
// SHIN CORE LINX
// Discover Experience V2
// Elements
// ============================================================================

import type {

  DiscoverDetailRuntime,

} from '@/shared/lib/api/django/pc/discover-detail'

import {

  ICON_MAP,

} from '@/shared/lib/ui/semantic/icon-map'

import type {

  ExperienceElements,

} from '../types/experience'

import styles from '../styles/Elements.module.css'

/* ============================================================================
Props
============================================================================ */

interface ElementsProps {

  runtime: DiscoverDetailRuntime

  dictionary: ExperienceElements

}

/* ============================================================================
Elements
============================================================================ */

export default function Elements(

  {

    runtime,

    dictionary,

  }: ElementsProps

) {

  const attribute = runtime.data.attribute

  const keywords = dictionary.keywords ?? []

  const Icon =

    dictionary.icon

      ? ICON_MAP[dictionary.icon]

      : null

  return (

    <section className={styles.elements}>

      <div className={styles.container}>

        <header className={styles.header}>

          <h2 className={styles.title}>

            {

              Icon && (

                <span className={styles.icon}>

                  <Icon

                    size={20}

                    strokeWidth={2}

                  />

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

          attribute && (

            <article className={styles.card}>

              <h3 className={styles.attributeTitle}>

                {attribute.title ?? attribute.name}

              </h3>

              {

                attribute.description && (

                  <p className={styles.attributeDescription}>

                    {attribute.description}

                  </p>

                )

              }

            </article>

          )

        }

        {

          keywords.length > 0 && (

            <ul className={styles.keywordGrid}>

              {

                keywords.map(

                  (

                    keyword

                  ) => (

                    <li

                      key={keyword}

                      className={styles.keywordChip}

                    >

                      {keyword}

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