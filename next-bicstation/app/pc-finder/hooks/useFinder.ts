// ============================================================================
// FILE:
// /app/pc-finder/hooks/useFinder.ts
// Copyright (c) 2026 Shin Corporation.
// ============================================================================

'use client'

/* ============================================================================
Hooks
============================================================================ */

import {

    useCallback,

} from 'react'

import {

    useFinderState,

} from './useFinderState'

/* ============================================================================
Actions
============================================================================ */

import {

    executeFinder,

} from '../lib/finderActions'

/* ============================================================================
Hook
============================================================================ */

export function useFinder() {

    const state =

        useFinderState()

    /* ------------------------------------------------------------------------
    Search
    ------------------------------------------------------------------------ */

    const search =

        useCallback(

            async () => {

                if (

                    !state.selectedIntent

                ) {

                    return

                }

                state.setLoading(

                    true

                )

                state.setError(

                    null

                )

                try {

                    const runtime =

                        await executeFinder({

                            groups: [

                                state.selectedIntent,

                            ],

                            max_price:

                                state.maxPrice,

                        })

                    state.setRuntime(

                        runtime

                    )

                }

                catch (

                error

                ) {

                    console.error(

                        error

                    )

                    state.setError(

                        '検索に失敗しました。'

                    )

                }

                finally {

                    state.setLoading(

                        false

                    )

                }

            },

            [

                state,

            ]

        )

    /* ------------------------------------------------------------------------
    Return
    ------------------------------------------------------------------------ */

    return {

        ...state,

        search,

    }

}