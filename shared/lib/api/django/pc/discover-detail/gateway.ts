// ============================================================================
// Discover Detail Gateway V2
// ============================================================================

import type {

    DiscoverDetailRuntime,

} from './contracts'

/* ============================================================================
🔥 Runtime Endpoint
============================================================================ */

const API_ENDPOINT =
    '/api/pc/discover'

/* ============================================================================
🔥 Fetch Discover Detail
============================================================================ */

export async function fetchDiscoverDetail(

    slug: string

): Promise<DiscoverDetailRuntime> {

    const response = await fetch(

        `${API_ENDPOINT}/${slug}/`,

        {

            method: 'GET',

            headers: {

                Accept: 'application/json',

            },

            cache: 'no-store',

        }

    )

    if (!response.ok) {

        throw new Error(

            `Discover Detail API Error (${response.status})`

        )

    }

    return await response.json()
}

/* ============================================================================
🔥 Alias
============================================================================ */

export const getDiscoverDetail =
    fetchDiscoverDetail

/* ============================================================================
🔥 Default Export
============================================================================ */

export default fetchDiscoverDetail