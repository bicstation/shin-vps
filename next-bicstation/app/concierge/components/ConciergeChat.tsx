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

import styles from './ConciergeChat.module.css'

/* ============================================================================
🔥 Conversation Message
============================================================================ */

interface ConciergeMessage {

    id: string

    role:
    | 'user'
    | 'assistant'

    content: string

}

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
        messages,
        setMessages,
    ] = useState<ConciergeMessage[]>(
        [],
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

        const normalizedMessage =
            message.trim()

        if (!normalizedMessage) {

            return

        }

        /* ====================================================================
        User Message
        ==================================================================== */

        const userMessage: ConciergeMessage = {

            id:
                `${Date.now()}-user`,

            role:
                'user',

            content:
                normalizedMessage,

        }

        setMessages(
            current => [

                ...current,

                userMessage,

            ],
        )

        setLoading(
            true,
        )

        setError(
            null,
        )

        try {

            /* ==================================================================
            Consultation Runtime
            ================================================================== */

            const result =
                await executeConcierge(
                    normalizedMessage,
                )

            console.log(
                '🔥 CONCIERGE RESULT',
                result,
            )

            setRuntime(
                result,
            )

            /* ==================================================================
            Backend Presentation
            ================================================================== */

            const presentation =
                result.consultation?.presentation

            const assistantContent =
                buildAssistantMessage(
                    presentation,
                    result.consultation?.summary.resultCount ?? 0,
                )

            /* ==================================================================
            Assistant Message
            ================================================================== */

            const assistantMessage: ConciergeMessage = {

                id:
                    `${Date.now()}-assistant`,

                role:
                    'assistant',

                content:
                    assistantContent,

            }

            setMessages(
                current => [

                    ...current,

                    assistantMessage,

                ],
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

            /* ==================================================================
            Error Message
            ================================================================== */

            const errorMessage: ConciergeMessage = {

                id:
                    `${Date.now()}-error`,

                role:
                    'assistant',

                content:
                    '検索中にエラーが発生しました。もう一度お試しください。',

            }

            setMessages(
                current => [

                    ...current,

                    errorMessage,

                ],
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
            Conversation
            ================================================================== */}

            {

                messages.length > 0 && (

                    <section
                        className={
                            styles.conversation
                        }

                        aria-label="AI Concierge conversation"
                    >

                        {

                            messages.map(
                                message => (

                                    <div

                                        key={
                                            message.id
                                        }

                                        className={
                                            message.role === 'user'
                                                ? styles.userMessage
                                                : styles.assistantMessage
                                        }

                                    >

                                        <span
                                            className={
                                                styles.messageLabel
                                            }
                                        >

                                            {
                                                message.role === 'user'
                                                    ? 'YOU'
                                                    : 'AI CONCIERGE'
                                            }

                                        </span>

                                        <p
                                            className={
                                                styles.messageContent
                                            }
                                        >
                                            {
                                                message.content
                                            }
                                        </p>

                                    </div>

                                ),
                            )

                        }

                    </section>

                )

            }


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
                            {
                                error
                            }
                        </p>

                    </div>

                )

            }


            {/* ==================================================================
            Latest Consultation Results
            ================================================================== */}

            <ConciergeResults

                consultation={
                    runtime?.consultation ?? null
                }

            />

        </main>

    )

}

/* ============================================================================
🔥 Assistant Message Builder
============================================================================ */

function buildAssistantMessage(

    presentation:
        ConciergeRuntimeContract['consultation']['presentation']
        | undefined,

    resultCount:
        number,

): string {

    const title =
        presentation?.title

    const subtitle =
        presentation?.subtitle

    const description =
        presentation?.description

    const lines: string[] = []

    if (title) {

        lines.push(
            `${title}を探してみます。`,
        )

    }
    else {

        lines.push(
            'ご希望に合うPCを探してみます。',
        )

    }

    if (subtitle) {

        lines.push(
            subtitle,
        )

    }

    if (description) {

        lines.push(
            description,
        )

    }

    if (resultCount > 0) {

        lines.push(
            `${resultCount}台見つかりました。`,
        )

    }

    return lines.join(
        '\n',
    )

}