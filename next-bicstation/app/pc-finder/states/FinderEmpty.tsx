// ============================================================================
// FILE:
// /app/pc-finder/states/FinderEmpty.tsx
// Copyright (c) 2026 Shin Corporation.
// ============================================================================

'use client'

/* ============================================================================
Styles
============================================================================ */

import styles
    from '../styles/pcFinder.module.css'

/* ============================================================================
Props
============================================================================ */

type Props = {

    onReset?: () => void

}

/* ============================================================================
Finder Empty
============================================================================ */

export default function FinderEmpty({

    onReset,

}: Props) {

    return (

        <section
            className={
                styles.finderEmpty
            }
        >

            <div
                className={
                    styles.emptyIcon
                }
            >

                🔍

            </div>

            <h2
                className={
                    styles.emptyTitle
                }
            >

                条件に一致するPCは見つかりませんでした

            </h2>

            <p
                className={
                    styles.emptyDescription
                }
            >

                条件を少し変更すると、
                新しい候補が見つかるかもしれません。

                <br />

                用途や予算を変更して、
                もう一度お試しください。

            </p>

            {

                onReset && (

                    <button

                        onClick={onReset}

                        className={
                            styles.resetButton
                        }

                    >

                        条件を変更する

                    </button>

                )

            }

        </section>

    )

}