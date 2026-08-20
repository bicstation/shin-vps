'use client'

/* ============================================================================
🔥 React
============================================================================ */

import {
    FormEvent,
    useState,
} from 'react'

/* ============================================================================
🔥 Styles
============================================================================ */

import styles from './ConciergeInput.module.css'

/* ============================================================================
🔥 Props
============================================================================ */

interface ConciergeInputProps {

    onSubmit: (
        message: string,
    ) => void

    loading?: boolean

}

/* ============================================================================
🔥 Concierge Input
============================================================================ */

export default function ConciergeInput({

    onSubmit,

    loading = false,

}: ConciergeInputProps) {

    const [
        message,
        setMessage,
    ] = useState('')

    /* ========================================================================
    Submit
    ======================================================================== */

    const handleSubmit = (
        event: FormEvent<HTMLFormElement>,
    ) => {

        event.preventDefault()

        const value =
            message.trim()

        if (
            !value
            ||
            loading
        ) {

            return

        }

        onSubmit(
            value,
        )

        setMessage('')
    }

    /* ========================================================================
    Render
    ======================================================================== */

    return (

        <form
            className={
                styles.form
            }

            onSubmit={
                handleSubmit
            }
        >

            <div
                className={
                    styles.inputWrap
                }
            >

                <textarea

                    className={
                        styles.textarea
                    }

                    value={
                        message
                    }

                    onChange={
                        event =>
                            setMessage(
                                event.target.value,
                            )
                    }

                    placeholder={
                        'どんなPCをお探しですか？'
                    }

                    disabled={
                        loading
                    }

                    rows={
                        4
                    }

                    aria-label={
                        'PCについて相談する'
                    }

                />

                <div
                    className={
                        styles.inputFooter
                    }
                >

                    <span
                        className={
                            styles.hint
                        }
                    >
                        日本語で自由に相談できます
                    </span>

                    <button

                        type="submit"

                        className={
                            styles.button
                        }

                        disabled={
                            loading
                            ||
                            !message.trim()
                        }

                    >

                        <span>
                            {
                                loading
                                    ? '検索中…'
                                    : '探す'
                            }
                        </span>

                        {

                            !loading && (

                                <span
                                    className={
                                        styles.arrow
                                    }
                                >
                                    →
                                </span>

                            )

                        }

                    </button>

                </div>

            </div>

        </form>

    )
}