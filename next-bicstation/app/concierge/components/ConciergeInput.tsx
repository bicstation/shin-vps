'use client'

/* ============================================================================
🔥 React
============================================================================ */

import {
    FormEvent,
    useState,
} from 'react'

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
            onSubmit={
                handleSubmit
            }
        >

            <textarea

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

            <button

                type="submit"

                disabled={
                    loading
                    ||
                    !message.trim()
                }

            >

                {
                    loading
                        ? '検索中…'
                        : '探す'
                }

            </button>

        </form>

    )
}