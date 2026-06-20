import type {
ConciergeInput,
ConciergeOutput,
} from "../contracts";

import { ConversationRuntime } from "../conversation/ConversationRuntime";
import { SessionMemory } from "../memory/SessionMemory";
import { ConciergeTransport } from "../transport/ConciergeTransport";

export class ConciergeOrchestrator {
private readonly conversation: ConversationRuntime;
private readonly memory: SessionMemory;
private readonly transport: ConciergeTransport;

constructor(
conversation?: ConversationRuntime,
memory?: SessionMemory,
transport?: ConciergeTransport,
) {
this.conversation =
conversation ?? new ConversationRuntime();


this.memory =
  memory ?? new SessionMemory();

this.transport =
  transport ?? new ConciergeTransport();


}

public async execute(
input: ConciergeInput,
): Promise<ConciergeOutput> {
// Session取得
const session =
this.memory.get(input.sessionId);


// Conversation更新
const updatedSession =
  this.conversation.process(
    input,
    session,
  );

// Session保存
this.memory.save(updatedSession);

// Backend Runtime呼び出し
return await this.transport.execute(input);


}
}
