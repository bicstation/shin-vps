// /app/concierge/sections/hero/HeroSection.tsx

'use client'

/* =========================================
🔥 Props
========================================= */

type Props = {

  title?: string

  description?: string
}

/* =========================================
🔥 STYLES
========================================= */

import styles
  from './HeroSection.module.css'

/* =========================================
🔥 Hero Section
========================================= */

export default function HeroSection({
  title = 'Welcome to SHIN CORE LINX Concierge',
  description = 'Semantic AI recommendation and reasoning runtime',
}: Props) {

  return (

    <section
      className={styles.heroSection}
    >

      <div
        className={styles.heroBadge}
      >
        Concierge AI
      </div>

      <h1
        className={styles.heroTitle}
      >
        {title}
      </h1>

      <p
        className={styles.heroText}
      >
        {description}
      </p>

    </section>
  )
}