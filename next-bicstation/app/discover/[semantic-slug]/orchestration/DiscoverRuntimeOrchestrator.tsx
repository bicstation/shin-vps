
// /home/maya/shin-dev/shin-vps/next-bicstation/app/discover/[semantic-slug]/page.tsx
// ============================================================================
// SHIN CORE LINX
// Discover Experience V2
// Discover Page Orchestrator
// ============================================================================

import { notFound } from 'next/navigation'

import {

  fetchDiscoverDetailRuntime,

} from '@/shared/lib/api/django/pc/discover-detail'

import {

  getExperienceDictionary,

} from '../services/dictionary'

import Hero from '../components/Hero'
import About from '../components/About'
import Elements from '../components/Elements'
import RepresentativeProducts from '../components/RepresentativeProducts'
import RelatedWorlds from '../components/RelatedWorlds'
import ContinueDiscovery from '../components/ContinueDiscovery'

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

  /* --------------------------------------------------------------------------
  Route Parameter
  -------------------------------------------------------------------------- */

  const {

    'semantic-slug': groupSlug,

  } = await params

  /* --------------------------------------------------------------------------
  Runtime
  -------------------------------------------------------------------------- */

  const runtime = await fetchDiscoverDetailRuntime(

    groupSlug

  )

  if (

    !runtime ||
    !runtime.found

  ) {

    notFound()

  }

  /* --------------------------------------------------------------------------
  Experience Dictionary
  -------------------------------------------------------------------------- */

  const dictionary = await getExperienceDictionary(

    runtime.data.group_slug

  )

  /* --------------------------------------------------------------------------
  Render
  -------------------------------------------------------------------------- */

  return (

    <main>

      <Hero

        runtime={runtime}

        dictionary={dictionary.hero}

      />

      <About

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

        dictionary={dictionary.continue}

      />

    </main>

  )

}