// app/test/_runtime/navigation.ts

import {

  fetchNavigationRuntime,

} from '@/shared/lib/api/django/pc/navigation'

export async function executeNavigation() {

  const runtime =

    await fetchNavigationRuntime()

  return {

    request: {},

    runtime,

  }

}