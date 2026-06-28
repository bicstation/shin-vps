// ============================================================================
// FILE:
// /app/pc-finder/sections/intent/IntentSection.tsx
// ============================================================================

'use client'

/* ============================================================================
Components
============================================================================ */

import IntentCard
    from '../../components/IntentCard'

/* ============================================================================
Styles
============================================================================ */

import styles
    from './IntentSection.module.css'

/* ============================================================================
Props
============================================================================ */

type Intent = {

    id: string

    title: string

    description: string

    icon: string

}

type Props = {

    intents: Intent[]

    selected?: string

    onSelect: (id: string) => void

}

/* ============================================================================
Intent Section
============================================================================ */

export default function IntentSection({

    intents,

    selected,

    onSelect,

}: Props) {

    return (

        <section className={styles.section}>

            <div className={styles.header}>

                <span className={styles.eyebrow}>

                    STEP 1

                </span>

                <h2 className={styles.title}>

                    今日は何をしたいですか？

                </h2>

                <p className={styles.description}>

                    あなたの目的を選択すると、
                    Semantic Reality が最適な候補を探し始めます。

                </p>

            </div>

            <div className={styles.grid}>

                {

                    intents.map(intent => (

                        <IntentCard

                            key={intent.id}

                            intent={intent}

                            selected={

                                selected === intent.id

                            }

                            onClick={() =>

                                onSelect(intent.id)

                            }

                        />

                    ))

                }

            </div>

        </section>

    )

}