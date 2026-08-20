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

    return (

        <main>

            <section>

                <h1>
                    BIC STATION AI Concierge
                </h1>

                <p>
                    欲しいPCについて、日本語で相談してください。
                </p>

            </section>

            <ConciergeInput

                onSubmit={
                    handleSubmit
                }

                loading={
                    loading
                }

            />

            {

                error && (

                    <p
                        role="alert"
                    >
                        {error}
                    </p>

                )

            }

            <ConciergeResults

                finder={
                    runtime?.finder ?? null
                }

            />

        </main>

    )

}