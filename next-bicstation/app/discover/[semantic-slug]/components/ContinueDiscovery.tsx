// ============================================================================
// SHIN CORE LINX
// Discover Experience V2
// Continue Discovery
// ============================================================================

import Link from 'next/link'

import {

  ICON_MAP,

} from '@/shared/lib/ui/semantic/icon-map'

import ExperienceSection from '@/app/experience/components/product/ExperienceSection'

import type {

  ExperienceContinue,

} from '../types/experience'

import styles from '../styles/ContinueDiscovery.module.css'

/* ============================================================================
Props
============================================================================ */

interface ContinueDiscoveryProps {

  dictionary: ExperienceContinue

}

/* ============================================================================
Continue Discovery
============================================================================ */

export default function ContinueDiscovery(

  {

    dictionary,

  }: ContinueDiscoveryProps

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

      <div className={styles.card}>

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

        <Link

          href="/discover"

          className={styles.button}

        >

          {dictionary.buttonLabel}

        </Link>

      </div>

    </ExperienceSection>

  )

}