'use client'

/* ============================================================================
🔥 React
============================================================================ */

import {
    useState,
} from 'react'

/* ============================================================================
🔥 Concierge Runtime
============================================================================ */

import {
    executeConcierge,
} from '../lib/conciergeActions'

import type {
    ConciergeRuntimeContract,
} from '../lib/conciergeActions'

/* ============================================================================
🔥 Components
============================================================================ */

import ConciergeInput
    from './ConciergeInput'

import ConciergeResults
    from './ConciergeResults'

/* ============================================================================
🔥 Styles
============================================================================ */

import styles
    from './ConciergeChat.module.css'

/* ============================================================================
🔥 Concierge Chat
============================================================================ */

export default function ConciergeChat() {

    const [
        runtime,
        setRuntime,
    ] = useState<ConciergeRuntimeContract | null>(
        null,
    )

    const [
        loading,
        setLoading,
    ] = useState(false)

    const [
        error,
        setError,
    ] = useState<string | null>(
        null,
    )

    /* ========================================================================
    Submit
    ======================================================================== */

    const handleSubmit = async (
        message: string,
    ) => {

        setLoading(
            true,
        )

        setError(
            null,
        )

        try {

            const result =
                await executeConcierge(
                    message,
                )

            console.log(
                '🔥 CONCIERGE RESULT',
                result,
            )

            setRuntime(
                result,
            )

        }

        catch (error) {

            console.error(
                'Concierge Runtime Error',
                error,
            )

            setRuntime(
                null,
            )

            setError(
                '検索中にエラーが発生しました。もう一度お試しください。',
            )

        }

        finally {

            setLoading(
                false,
            )

        }

    }

    /* ========================================================================
    Render
    ======================================================================== */

    return (

        <main
            className={
                styles.main
            }
        >

            {/* ==================================================================
            Hero
            ================================================================== */}

            <section
                className={
                    styles.hero
                }
            >

                <span
                    className={
                        styles.eyebrow
                    }
                >
                    BIC STATION
                    <span>
                        AI CONCIERGE
                    </span>
                </span>

                <h1>
                    あなたに合うPCを、
                    <br />
                    一緒に探します。
                </h1>

                <p>
                    欲しいPCについて、日本語で自由に相談してください。
                </p>

            </section>


            {/* ==================================================================
            Input
            ================================================================== */}

            <ConciergeInput

                onSubmit={
                    handleSubmit
                }

                loading={
                    loading
                }

            />


            {/* ==================================================================
            Error
            ================================================================== */}

            {

                error && (

                    <div
                        className={
                            styles.error
                        }

                        role="alert"
                    >

                        <span>
                            !
                        </span>

                        <p>
                            {error}
                        </p>

                    </div>

                )

            }


            {/* ==================================================================
            Results
            ================================================================== */}

            <ConciergeResults

                intent={
                    runtime?.intent ?? null
                }

                finder={
                    runtime?.finder ?? null
                }

            />

        </main>

    )

}