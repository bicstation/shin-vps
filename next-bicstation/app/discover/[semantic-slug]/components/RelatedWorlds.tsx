// ============================================================================
// SHIN CORE LINX
// Discover Experience V2
// Related Worlds
// ============================================================================

import Link from 'next/link'

import type {

  CSSProperties,

} from 'react'

import type {

  DiscoverDetailRuntime,

} from '@/shared/lib/api/django/pc/discover-detail'

import {

  ICON_MAP,

} from '@/shared/lib/ui/semantic/icon-map'

import {

  getExperienceDictionary,

} from '../dictionary'

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

  const siblingGroups =

    runtime.data.sibling_groups ?? []

  const SectionIcon =

    dictionary.icon

      ? ICON_MAP[dictionary.icon]

      : null

  /* ==========================================================================
  View Model
  ========================================================================== */

  const worlds =

    siblingGroups.map(

      (

        group

      ) => {

        const experience =

          getExperienceDictionary(

            group.group_slug

          )

        return {

          ...group,

          experience,

          backgroundImage:

            experience?.hero.backgroundImage,

          accentColor:

            experience?.hero.accentColor,

          Icon:

            group.icon

              ? ICON_MAP[group.icon]

              : null,

        }

      }

    )

  return (

    <section className={styles.related}>

      <div className={styles.container}>

        <header className={styles.header}>

          <h2 className={styles.title}>

            {

              SectionIcon && (

                <span className={styles.icon}>

                  <SectionIcon

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

          worlds.length === 0 ? (

            <div className={styles.empty}>

              現在、同じカテゴリのセマンティックワールドはありません。

            </div>

          ) : (

            <ul className={styles.grid}>

              {

                worlds.map(

                  (

                    world

                  ) => {

                    const style: CSSProperties = {

                      ...(world.backgroundImage && {

                        backgroundImage:

                          `url(${world.backgroundImage})`,

                      }),

                      ...(world.accentColor && {

                        ['--accent-color' as const]:

                          world.accentColor,

                      }),

                    }

                    return (

                      <li

                        key={world.group_slug}

                      >

                        <Link

                          href={`/discover/${world.group_slug}`}

                          className={

                            world.is_current

                              ? `${styles.card} ${styles.activeCard}`

                              : styles.card

                          }

                          style={style}

                        >

                          <div

                            className={styles.overlay}

                          />

                          {

                            world.is_current && (

                              <span

                                className={styles.currentBadge}

                              >

                                現在閲覧中

                              </span>

                            )

                          }

                          <div

                            className={styles.content}

                          >

                            <span

                              className={styles.worldIcon}

                            >

                              {

                                world.Icon && (

                                  <world.Icon

                                    size={20}

                                    strokeWidth={2}

                                  />

                                )

                              }

                            </span>

                            <div

                              className={styles.text}

                            >

                              <span

                                className={styles.worldName}

                              >

                                {

                                  world.presentation_name

                                  ??

                                  world.group_name

                                }

                              </span>

                              {

                                world.presentation_description && (

                                  <span

                                    className={styles.worldDescription}

                                  >

                                    {

                                      world.presentation_description

                                    }

                                  </span>

                                )

                              }

                            </div>

                            <span

                              className={styles.arrow}

                            >

                              探索する →

                            </span>

                          </div>

                        </Link>

                      </li>

                    )

                  }

                )

              }

            </ul>

          )

        }

      </div>

    </section>

  )

}