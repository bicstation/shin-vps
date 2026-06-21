// app/test/_runtime/concierge.ts

import {

  ConciergeOrchestrator,

} from '@/shared/runtime/concierge'

export async function executeConcierge(

  value: string

) {

  const orchestrator =

    new ConciergeOrchestrator()

  const runtime =

    await orchestrator.execute({

      sessionId:
        'test-session',

      message:
        value,

    })

  return {

    request: {

      sessionId:
        'test-session',

      message:
        value,

    },

    runtime,

  }

}