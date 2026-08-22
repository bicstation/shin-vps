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
🔥 Consultation Requirement
============================================================================ */

import type {
    ConsultationRequirement,
} from '@/shared/lib/api/django/pc/consultation/contracts'

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

    id:
    string

    role:
    | 'user'
    | 'assistant'

    content:
    string

}

/* ============================================================================
🔥 Concierge Chat
============================================================================ */

export default function ConciergeChat() {

    /* ========================================================================
    Concierge Runtime
    ======================================================================== */

    const [
        runtime,
        setRuntime,
    ] = useState<ConciergeRuntimeContract | null>(
        null,
    )

    /* ========================================================================
    Conversation State
    ========================================================================

    Backend Requirement Authority

    Concierge stores the latest Backend Requirement
    and passes it to the next Consultation request.

    Concierge does NOT:

    ✗ modify groups
    ✗ merge groups
    ✗ remove groups
    ✗ interpret Semantic Meaning
    ✗ generate Semantic Groups

    ======================================================================== */

    const [
        previousRequirement,
        setPreviousRequirement,
    ] = useState<ConsultationRequirement | null>(
        null,
    )

    /* ========================================================================
    Conversation Messages
    ======================================================================== */

    const [
        messages,
        setMessages,
    ] = useState<ConciergeMessage[]>(
        [],
    )

    /* ========================================================================
    Loading
    ======================================================================== */

    const [
        loading,
        setLoading,
    ] = useState(false)

    /* ========================================================================
    Error
    ======================================================================== */

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

        const userMessage:
            ConciergeMessage = {

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
            ==================================================================

            First message:

                message
                    ↓
                Backend

            Subsequent message:

                previousRequirement
                    +
                message
                    ↓
                Backend

            Concierge does not interpret
            or modify previousRequirement.
            ================================================================== */

            const result =
                await executeConcierge(

                    normalizedMessage,

                    previousRequirement,

                )

            console.log(
                '🔥 CONCIERGE RESULT',
                result,
            )

            /* ==================================================================
            Runtime
            ================================================================== */

            setRuntime(
                result,
            )

            /* ==================================================================
            Update Conversation State
            ==================================================================

            Backend remains the Requirement Authority.

            The latest Requirement completely replaces
            the previous Conversation State.

            ================================================================== */

            setPreviousRequirement(
                result.consultation.requirement
                    ?? null,
            )

            /* ==================================================================
            Backend Concierge Response
            ==================================================================

            Backend Consultation Runtime
                ↓
            Adapter Projection
                ↓
            ProjectedConsultationRuntime.response
                ↓
            Concierge Conversation

            Frontend does NOT generate
            or reinterpret the response.
            ================================================================== */

            const assistantContent =
                result.consultation.response

            /* ==================================================================
            Assistant Message
            ================================================================== */

            const assistantMessage:
                ConciergeMessage = {

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

            const errorMessage:
                ConciergeMessage = {

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
            Latest Consultation Results
            ================================================================== */}

            <ConciergeResults

                consultation={
                    runtime?.consultation ?? null
                }

            />


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

        </main>

    )

}