// ============================================================================
// SHIN CORE LINX
// Discover Experience V2
// Hero
// ============================================================================

import type {

  CSSProperties,

} from 'react'

import type {

  DiscoverDetailRuntime,

} from '@/shared/lib/api/django/pc/discover-detail'

import {

  ICON_MAP,

} from '@/shared/lib/ui/semantic/icon-map'

import type {

  ExperienceHero,

} from '../types/experience'

import styles from '../styles/Hero.module.css'

/* ============================================================================
Props
============================================================================ */

interface HeroProps {

  runtime: DiscoverDetailRuntime

  dictionary: ExperienceHero

}

/* ============================================================================
Hero
============================================================================ */

export default function Hero(

  {

    runtime,

    dictionary,

  }: HeroProps

) {

  const group = runtime.data

  const Icon =

    dictionary.icon

      ? ICON_MAP[dictionary.icon]

      : null

  const style: CSSProperties = {

    backgroundImage:

      `url(${dictionary.backgroundImage})`,

    ...(dictionary.accentColor && {

      ['--accent-color' as const]:

        dictionary.accentColor,

    }),

  }

  return (

    <section

      className={styles.hero}

      style={style}

    >

      <div className={styles.overlay} />

      <div className={styles.container}>

        <header className={styles.header}>

          <span className={styles.label}>

            {

              Icon && (

                <span className={styles.labelIcon}>

                  <Icon

                    size={18}

                    strokeWidth={2}

                  />

                </span>

              )

            }

            {dictionary.label}

          </span>

          <h1 className={styles.title}>

            {dictionary.title}

          </h1>

          <h2 className={styles.catchCopy}>

            {dictionary.catchCopy}

          </h2>

          <p className={styles.description}>

            {dictionary.description}

          </p>

        </header>

        <section className={styles.stats}>

          <dl className={styles.definitionList}>

            <div className={styles.statItem}>

              <dt>

                セマンティックグループ

              </dt>

              <dd>

                {group.group_name}

              </dd>

            </div>

            <div className={styles.statItem}>

              <dt>

                グループスラッグ

              </dt>

              <dd>

                {group.group_slug}

              </dd>

            </div>

            <div className={styles.statItem}>

              <dt>

                製品数

              </dt>

              <dd>

                {group.product_count ?? 0}

              </dd>

            </div>

          </dl>

        </section>

      </div>

    </section>

  )

}