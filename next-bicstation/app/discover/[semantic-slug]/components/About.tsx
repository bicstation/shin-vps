// ============================================================================
// SHIN CORE LINX
// Discover Experience V2
// About
// ============================================================================

import {

  ICON_MAP,

} from '@/shared/lib/ui/semantic/icon-map'

import ExperienceSection from '@/app/experience/components/product/ExperienceSection'

import type {

  ExperienceAbout,

} from '../types/experience'

import styles from '../styles/About.module.css'

/* ============================================================================
Props
============================================================================ */

interface AboutProps {

  dictionary: ExperienceAbout

  backgroundImage?: string

  accentColor?: string

}

/* ============================================================================
About
============================================================================ */

export default function About(

  {

    dictionary,

    backgroundImage,

    accentColor,

  }: AboutProps

) {

  const Icon =

    dictionary.icon

      ? ICON_MAP[dictionary.icon]

      : null

  return (

    <ExperienceSection

      backgroundImage={dictionary.backgroundImage}
      accentColor={dictionary.accentColor}
      backgroundPosition={dictionary.backgroundPosition}

    >

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

      </header>

      <div className={styles.card}>

        <p className={styles.body}>

          {dictionary.body}

        </p>

      </div>

    </ExperienceSection>

  )

}