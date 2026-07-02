// ============================================================================
// SHIN CORE LINX
// Discover Experience V2
// Related Worlds
// ============================================================================

import Link from 'next/link'

import type {

  DiscoverDetailRuntime,

} from '@/shared/lib/api/django/pc/discover-detail'

import {

  ICON_MAP,

} from '@/shared/lib/ui/semantic/icon-map'

import type {

  ExperienceRelated,

} from '../types/experience'

import styles from '../styles/RelatedWorlds.module.css'

/* ============================================================================
Props
============================================================================ */

interface RelatedWorldsProps {

  runtime: DiscoverDetailRuntime

  dictionary: ExperienceRelated

}

/* ============================================================================
Related Worlds
============================================================================ */

export default function RelatedWorlds(

  {

    runtime,

    dictionary,

  }: RelatedWorldsProps

) {

  const relatedGroups = runtime.data.related_groups ?? []

  const Icon =

    dictionary.icon

      ? ICON_MAP[dictionary.icon]

      : null

  return (

    <section className={styles.related}>

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

          relatedGroups.length === 0 ? (

            <div className={styles.empty}>

              現在、関連するセマンティックワールドはありません。

            </div>

          ) : (

            <ul className={styles.grid}>

              {

                relatedGroups.map(

                  (

                    groupSlug

                  ) => (

                    <li

                      key={groupSlug}

                    >

                      <Link

                        href={`/discover/${groupSlug}`}

                        className={styles.card}

                      >

                        <span className={styles.worldIcon}>

                          {

                            Icon && (

                              <Icon

                                size={18}

                                strokeWidth={2}

                              />

                            )

                          }

                        </span>

                        <span className={styles.worldName}>

                          {groupSlug}

                        </span>

                      </Link>

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