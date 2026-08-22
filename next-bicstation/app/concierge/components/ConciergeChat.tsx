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
            Conversation Requirement
            ================================================================== */

            setPreviousRequirement(
                result.consultation.requirement
                    ?? null,
            )

            /* ==================================================================
            Backend Concierge Response
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
                                                ? styles.userRow
                                                : styles.assistantRow
                                        }

                                    >

                                        {/* ==================================================
                                        Avatar
                                        ================================================== */}

                                        <img

                                            src={
                                                message.role === 'user'
                                                    ? '/images/concierge/you-conciarge.png'
                                                    : '/images/concierge/ai-conciarge.png'
                                            }

                                            alt={
                                                message.role === 'user'
                                                    ? 'You'
                                                    : 'AI Concierge'
                                            }

                                            className={
                                                styles.avatar
                                            }

                                        />

                                        {/* ==================================================
                                        Message
                                        ================================================== */}

                                        <div

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

                                    </div>

                                ),
                            )

                        }

                    </section>

                )

            }


            {/* ==================================================================
            AI Concierge Guide
            ================================================================== */}

            {

                messages.length === 0 && (

                    <section
                        className={
                            styles.conciergeGuide
                        }

                        aria-label="AI Concierge guide"
                    >

                        <img
                            src="/images/concierge/ai-conciarge.png"
                            alt="AI Concierge"
                            className={
                                styles.guideImage
                            }
                        />

                        <p
                            className={
                                styles.guideMessage
                            }
                        >
                            こんなPCを探しています、と気軽に話しかけてください。
                        </p>

                        <div
                            className={
                                styles.sampleMessages
                            }
                        >

                            <button
                                type="button"
                                disabled={
                                    loading
                                }
                                onClick={() =>
                                    handleSubmit(
                                        '動画編集用のPCを探しています。'
                                    )
                                }
                            >
                                動画編集用のPCを探しています
                            </button>

                            <button
                                type="button"
                                disabled={
                                    loading
                                }
                                onClick={() =>
                                    handleSubmit(
                                        '仕事で使うPCを探しています。'
                                    )
                                }
                            >
                                仕事で使うPCを探しています
                            </button>

                            <button
                                type="button"
                                disabled={
                                    loading
                                }
                                onClick={() =>
                                    handleSubmit(
                                        'ゲーム用のPCを探しています。'
                                    )
                                }
                            >
                                ゲーム用のPCを探しています
                            </button>

                        </div>

                    </section>

                )

            }


            {/* ==========================================================================
            🔥 Concierge Loading
            ========================================================================== */}

            {

                loading && (

                    <div
                        className={
                            styles.loadingState
                        }

                        role="status"
                        aria-live="polite"
                    >

                        <img
                            src="/images/concierge/ai-conciarge.png"
                            alt=""
                            className={
                                styles.loadingAvatar
                            }
                        />

                        <div
                            className={
                                styles.loadingContent
                            }
                        >

                            <span
                                className={
                                    styles.loadingLabel
                                }
                            >
                                AI CONCIERGE
                            </span>

                            <div
                                className={
                                    styles.loadingMessage
                                }
                            >

                                <span>
                                    条件を整理しています
                                </span>

                                <span
                                    className={
                                        styles.loadingDots
                                    }
                                >
                                    <i />
                                    <i />
                                    <i />
                                </span>

                            </div>

                        </div>

                    </div>

                )

            }


            {/* ==========================================================================
            🔥 Result Count
            ========================================================================== */}

            {

                !loading &&
                runtime?.consultation &&
                runtime.consultation.summary && (

                    <div
                        className={
                            styles.resultCount
                        }

                        aria-live="polite"
                    >

                        {

                            runtime.consultation.summary.resultCount > 0

                                ? (

                                    <>

                                        <strong>
                                            {
                                                runtime.consultation.summary.resultCount
                                            }
                                        </strong>

                                        <span>
                                            件見つかりました
                                        </span>

                                    </>

                                )

                                : (

                                    <span>
                                        条件に合うPCが見つかりませんでした
                                    </span>

                                )

                        }

                    </div>

                )

            }


            {/* ==========================================================================
            Input
            ========================================================================== */}

            <ConciergeInput

                onSubmit={
                    handleSubmit
                }

                loading={
                    loading
                }

            />


            {/* ==========================================================================
            Latest Consultation Results
            ========================================================================== */}

            <ConciergeResults

                consultation={
                    runtime?.consultation ?? null
                }

            />


            {/* ==========================================================================
            Error
            ========================================================================== */}

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