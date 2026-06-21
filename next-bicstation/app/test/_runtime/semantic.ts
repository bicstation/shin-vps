// app/test/_runtime/semantic.ts

import {

  fetchSemanticRuntime,

} from '@/shared/lib/api/django/pc/semantics'

export async function executeSemantic() {

  const runtime =

    await fetchSemanticRuntime()

  return {

    request: {},

    runtime,

  }

}