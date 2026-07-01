// ============================================================================
// SHIN CORE LINX
// Discover Experience V2
// ============================================================================

import { notFound } from 'next/navigation'

import {

    fetchDiscoverDetailRuntime,

} from '@/shared/lib/api/django/pc/discover-detail'

import {

    getExperienceDictionary,

} from './lib/dictionary'

import Hero from './components/Hero'
import About from './components/About'
import Elements from './components/Elements'
import RepresentativeProducts from './components/RepresentativeProducts'
import RelatedWorlds from './components/RelatedWorlds'
import ContinueDiscovery from './components/ContinueDiscovery'

/* ============================================================================
Props
============================================================================ */

interface DiscoverPageProps {

    params: Promise<{

        'semantic-slug': string

    }>

}

/* ============================================================================
Discover Page
============================================================================ */

export default async function DiscoverPage(

    {

        params,

    }: DiscoverPageProps

) {

    const {

        'semantic-slug': slug,

    } = await params

    /* --------------------------------------------------------------------------
    Runtime
    -------------------------------------------------------------------------- */

    const runtime =

        await fetchDiscoverDetailRuntime(

            slug

        )

    if (

        !runtime.found

    ) {

        notFound()

    }

    /* --------------------------------------------------------------------------
    Experience Dictionary
    -------------------------------------------------------------------------- */

    const dictionary =

        await getExperienceDictionary(

            slug

        )

    /* --------------------------------------------------------------------------
    Render
    -------------------------------------------------------------------------- */

    return (

        <>

            <Hero
                runtime={runtime}
                dictionary={dictionary.hero}
            />

            <About
                runtime={runtime}
                dictionary={dictionary.about}
            />

            <Elements
                runtime={runtime}
                dictionary={dictionary.elements}
            />

            <RepresentativeProducts
                runtime={runtime}
                dictionary={dictionary.products}
            />

            <RelatedWorlds
                runtime={runtime}
                dictionary={dictionary.related}
            />

            <ContinueDiscovery
                runtime={runtime}
                dictionary={dictionary.continue}
            />

        </>

    )

}