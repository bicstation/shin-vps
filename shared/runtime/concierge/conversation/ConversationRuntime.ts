import type {
ConciergeInput,
ConciergeSession,
} from "../contracts";

export class ConversationRuntime {
public process(
input: ConciergeInput,
session?: ConciergeSession,
): ConciergeSession {
const currentSession: ConciergeSession = session ?? {
sessionId: input.sessionId,
messages: [],
};


return {
  ...currentSession,
  messages: [
    ...currentSession.messages,
    input.message,
  ],
};


}
}
