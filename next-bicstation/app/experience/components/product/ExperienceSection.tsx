// ============================================================================
// SHIN CORE LINX
// Experience
// Experience Section
// ============================================================================

import type {

    CSSProperties,
    PropsWithChildren,

} from 'react'

import styles from '../styles/ExperienceSection.module.css'

/* ============================================================================
Props
============================================================================ */

interface ExperienceSectionProps
    extends PropsWithChildren {

    backgroundImage?: string

    backgroundPosition?: string

    accentColor?: string

    className?: string

}

/* ============================================================================
Experience Section
============================================================================ */

export default function ExperienceSection(

    {

        backgroundImage,

        backgroundPosition,

        accentColor,

        className,

        children,

    }: ExperienceSectionProps

) {

    const style: CSSProperties = {

        ...(backgroundImage && {

            backgroundImage:

                `url(${backgroundImage})`,

        }),

        ...(backgroundPosition && {

            backgroundPosition,

        }),

        ...(accentColor && {

            ['--accent-color' as const]:

                accentColor,

        }),

    }

    return (

        <section

            className={

                className

                    ? `${styles.section} ${className}`

                    : styles.section

            }

            style={style}

        >

            <div className={styles.overlay} />

            <div className={styles.container}>

                {children}

            </div>

        </section>

    )

}